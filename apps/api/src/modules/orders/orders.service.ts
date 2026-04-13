import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ProductType, OrderStatus, PaymentProvider, Prisma, Role } from '@alvarosky/database';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

import { Decimal } from '@prisma/client/runtime/library';
import { OrdersGateway } from './orders.gateway';
import { validateOrderTransition } from './domain/order-state-machine';
import { InventoryService } from '../inventory/inventory.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ClsService } from 'nestjs-cls';
import { OrderPricingService } from './services/order-pricing.service';
import { OrderValidationService } from './services/order-validation.service';
import {
  OrderCreatedEvent,
  OrderStatusChangedEvent,
} from './events/order.events';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly cls: ClsService,
    private prisma: PrismaService,
    private storage: StorageService,
    private ordersGateway: OrdersGateway,
    private inventoryService: InventoryService,
    private eventEmitter: EventEmitter2,
    private pricingService: OrderPricingService,
    private validationService: OrderValidationService,
  ) {}

  private getTenantId(): string {
    return this.cls.get<string>('tenantId') ?? 'unknown';
  }

  async createOrder(
    userId: string | undefined,
    dto: CreateOrderDto,
    clientIp?: string,
    clientUserAgent?: string,
  ) {
    const tenantId = this.getTenantId();
    this.logger.log(
      `[CREATE_ORDER] Iniciando creación de orden para Tenant: ${tenantId}`,
    );

    const { totalAmount, orderItemsData } = await this.pricingService.calculate(
      dto.items,
    );

    let lastError: any;
    const MAX_RETRIES = 3;

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const createdOrder = await this.prisma.$transaction(
          async (tx) => {
            const orderCount = await tx.order.count();
            const year = new Date().getFullYear();
            const orderNumber = `ORD-${year}-${String(orderCount + 1).padStart(4, '0')}`;

            await this.validationService.validateAndDeductStock(
              orderItemsData,
              tx,
            );

            const defaultBranch = await tx.branch.findFirst({
              where: { tenantId: this.getTenantId(), isDefault: true },
              select: { id: true },
            });

            const order = await tx.order.create({
              data: {
                tenantId: this.getTenantId(),
                branchId: defaultBranch!.id,
                userId: userId || null,
                orderNumber,
                totalAmount,
                status: dto.status || 'PENDING',
                orderType: dto.orderType || 'DINE_IN',
                tableNumber: dto.tableNumber || null,
                customerName: dto.customerName || null,
                customerPhone: dto.customerPhone || null,
                customerEmail: dto.customerEmail || null,
                identification: dto.identification || null,
                notes: (() => {
                  let methodLabel = dto.paymentMethod;
                  if (methodLabel === 'CASH') methodLabel = 'Efectivo';
                  if (methodLabel === 'CARD') methodLabel = 'Tarjeta';
                  if (methodLabel === 'TRANSFER') methodLabel = 'Transferencia';
                  if (methodLabel === 'BOLD') methodLabel = 'Bold';
                  if (methodLabel === 'MERCADOPAGO')
                    methodLabel = 'MercadoPago';

                  const paymentNote = dto.paymentMethod
                    ? `Forma de pago: ${methodLabel}`
                    : null;
                  if (dto.notes && paymentNote)
                    return `${dto.notes}\n\n${paymentNote}`;
                  return paymentNote || dto.notes || null;
                })(),
                shippingData: dto.shippingData || Prisma.DbNull,
                items: {
                  create: orderItemsData.map((item) => ({
                    tenantId: this.getTenantId(),
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price,
                    productName: item.productName,
                    variantName: item.variantName,
                    notes: item.notes,
                    modifiers: {
                      create: item.modifiers.map((mod) => ({
                        tenantId: this.getTenantId(),
                        modifierId: mod.modifierId,
                        modifierName: mod.modifierName,
                        priceAdjustment: mod.priceAdjustment,
                        quantity: mod.quantity,
                      })),
                    },
                  })),
                },
              },
              include: {
                items: {
                  include: {
                    modifiers: true,
                    variant: { include: { product: true } },
                  },
                },
              },
            });

            const productItems = orderItemsData.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            }));

            if (productItems.length > 0) {
              const inventoryResult = await this.inventoryService.deductByOrder(
                order.id,
                productItems,
                tx,
              );
              if (inventoryResult.alerts.length > 0) {
                this.logger.warn(
                  `Orden ${orderNumber}: ${inventoryResult.alerts.length} alertas de stock bajo`,
                );
              }
            }

            return order;
          },
        );

        this.logger.log(
          `Orden ${createdOrder.orderNumber} creada — Total: ${totalAmount} — Items: ${dto.items.length}`,
        );

        this.eventEmitter.emit(
          'order.created',
          new OrderCreatedEvent(tenantId, createdOrder, dto, clientIp, clientUserAgent),
        );

        return createdOrder;
      } catch (error) {
        lastError = error;
        this.logger.error(
          `[CREATE_ORDER] Fallo en intento ${i + 1}/${MAX_RETRIES}: ${error.message}`,
        );
        if (i < MAX_RETRIES - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100 * (i + 1)));
        }
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        )
          continue;
        throw error;
      }
    }
    this.logger.error(
      `[CREATE_ORDER] Todos los intentos fallaron. Error final: ${lastError.message}`,
    );
    throw lastError;
  }

  async updateStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    userRole: Role,
    userId?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    if (userRole === Role.DRIVER) {
      if (!userId) {
        throw new ForbiddenException('Usuario no autenticado');
      }
      const driver = await this.prisma.deliveryDriver.findUnique({
        where: { userId },
      });
      if (!driver || order.driverId !== driver.id) {
        throw new ForbiddenException(
          'No tienes permiso para actualizar esta orden',
        );
      }
    }

    validateOrderTransition(order.status, dto.status, userRole);

    return await this.prisma.$transaction(async (tx) => {
      if (order.status === 'CANCELLED') {
        throw new BadRequestException(
          'Esta orden ya fue cancelada anteriormente.',
        );
      }

      if (dto.status === 'CANCELLED') {
        const orderWithItems = await tx.order.findUnique({
          where: { id: orderId },
          include: {
            items: { include: { modifiers: true, variant: true } },
          },
        });

        if (orderWithItems) {
          const variantIncrements = new Map<string, number>();
          const modifierIncrements = new Map<string, number>();

          for (const item of orderWithItems.items) {
            if (item.variant.stock !== -1) {
              variantIncrements.set(
                item.variantId,
                (variantIncrements.get(item.variantId) || 0) + item.quantity
              );
            }

            for (const mod of item.modifiers) {
              modifierIncrements.set(
                mod.modifierId,
                (modifierIncrements.get(mod.modifierId) || 0) + mod.quantity * item.quantity
              );
            }
          }

          const updatePromises: any[] = [];

          for (const [variantId, increment] of variantIncrements.entries()) {
            updatePromises.push(
              tx.productVariant.update({
                where: { id: variantId },
                data: { stock: { increment } },
              })
            );
          }

          if (modifierIncrements.size > 0) {
            const modifierIds = Array.from(modifierIncrements.keys());
            const modifiersToUpdate = await tx.modifier.findMany({
              where: {
                id: { in: modifierIds },
                stock: { not: null },
              },
              select: { id: true },
            });

            for (const mod of modifiersToUpdate) {
              const increment = modifierIncrements.get(mod.id);
              if (increment) {
                updatePromises.push(
                  tx.modifier.update({
                    where: { id: mod.id },
                    data: { stock: { increment } },
                  })
                );
              }
            }
          }

          await Promise.all(updatePromises);
          this.logger.log(
            `Stock de variantes restaurado para orden cancelada: ${orderId}`,
          );

          await this.inventoryService.restoreByOrder(orderId, tx);
        }
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: dto.status },
        include: {
          items: { include: { modifiers: true } },
        },
      });

      const analytics = await tx.orderDeliveryAnalytics.findUnique({
        where: { orderId },
      });

      if (analytics) {
        const now = new Date();
        const analyticsUpdate: any = {};

        if (dto.status === 'PREPARING' && !analytics.preparingAt) {
          analyticsUpdate.preparingAt = now;
          analyticsUpdate.timeToPrepare = Math.floor(
            (now.getTime() - analytics.pendingAt.getTime()) / 1000,
          );
        } else if (
          (dto.status === 'SHIPPED' || dto.status === 'READY') &&
          !analytics.shippedAt
        ) {
          analyticsUpdate.shippedAt = now;
          if (analytics.preparingAt) {
            analyticsUpdate.timeToShip = Math.floor(
              (now.getTime() - analytics.preparingAt.getTime()) / 1000,
            );
          }
        } else if (
          (dto.status === 'DELIVERED' || dto.status === 'SERVED') &&
          !analytics.deliveredAt
        ) {
          analyticsUpdate.deliveredAt = now;
          if (analytics.shippedAt) {
            analyticsUpdate.timeToDeliver = Math.floor(
              (now.getTime() - analytics.shippedAt.getTime()) / 1000,
            );
          } else if (analytics.preparingAt) {
            analyticsUpdate.timeToDeliver = Math.floor(
              (now.getTime() - analytics.preparingAt.getTime()) / 1000,
            );
          }
        }

        if (Object.keys(analyticsUpdate).length > 0) {
          await tx.orderDeliveryAnalytics.update({
            where: { id: analytics.id },
            data: analyticsUpdate,
          });
        }

        if (
          dto.status === 'IN_TRANSIT' &&
          analytics.assignedAt &&
          !analytics.pickedUpAt
        ) {
          const now2 = new Date();
          await tx.orderDeliveryAnalytics.update({
            where: { id: analytics.id },
            data: {
              pickedUpAt: now2,
              timeToPickup: Math.floor(
                (now2.getTime() - analytics.assignedAt.getTime()) / 1000,
              ),
            },
          });
        }
      }

      if (
        (dto.status === 'DELIVERED' || dto.status === 'CANCELLED') &&
        order.driverId
      ) {
        const driver = await tx.deliveryDriver.findUnique({
          where: { id: order.driverId },
        });

        if (driver) {
          const newActiveOrders = Math.max(0, driver.currentActiveOrders - 1);
          const newStatus =
            driver.status === 'OFFLINE' ? 'OFFLINE' : 'AVAILABLE';
          await tx.deliveryDriver.update({
            where: { id: order.driverId },
            data: { currentActiveOrders: newActiveOrders, status: newStatus },
          });
          this.logger.log(
            `Domiciliario ${order.driverId} liberado tras ${
              dto.status === 'DELIVERED' ? 'entrega' : 'cancelación'
            } (órdenes activas: ${newActiveOrders})`,
          );
        }
      }

      this.ordersGateway.emit(this.getTenantId(), {
        type: 'status_changed',
        orderId,
        data: updated,
      });

      // Emitir evento para listeners (WhatsApp notification, etc.)
      this.eventEmitter.emit(
        'order.status_changed',
        new OrderStatusChangedEvent(
          orderId,
          this.getTenantId(),
          order.status,
          dto.status,
          updated,
        ),
      );

      return updated;
    });
  }

  async findMyOrders(userId: string, take = 20, skip = 0) {
    return await this.prisma.order.findMany({
      where: {
        userId,
        status: {
          in: [
            'APPROVED',
            'DELIVERED',
            'SHIPPED',
            'PROCESSING',
            'PREPARING',
            'READY',
            'SERVED',
          ],
        },
      },
      include: {
        items: {
          include: {
            modifiers: true,
            variant: { include: { product: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }

  async getOrderForTracking(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        customerName: true,
        items: { select: { productName: true, quantity: true } },
      },
    });

    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        orderType: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        identification: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            variantName: true,
            quantity: true,
            price: true,
            variantId: true,
            modifiers: {
              select: {
                id: true,
                modifierName: true,
                quantity: true,
                priceAdjustment: true,
              },
            },
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  async findAllAdmin(
    status?: OrderStatus,
    activeOnly: boolean = false,
    take = 50,
    skip = 0,
  ) {
    const fullInclude = {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          modifiers: true,
          variant: { include: { product: true } },
        },
      },
    };

    if (activeOnly) {
      // Providers que requieren pago antes de aparecer en cocina
      const onlineProviders: PaymentProvider[] = ['BOLD', 'MERCADO_PAGO'];

      const activeStatuses: OrderStatus[] = [
        'APPROVED',
        'ACCEPTED',
        'COOKING',
        'PROCESSING',
        'PREPARING',
        'READY',
      ];
      const completedStatuses: OrderStatus[] = [
        'SERVED',
        'DELIVERED',
        'SHIPPED',
        'CANCELLED',
        'REFUNDED',
      ];

      const [activeOrders, pendingCashOrders, recentCompleted] =
        await Promise.all([
          // Órdenes activas (ya confirmadas / en proceso)
          this.prisma.order.findMany({
            where: { status: { in: activeStatuses } },
            include: fullInclude,
            orderBy: { createdAt: 'desc' },
          }),
          // PENDING solo si NO usan pasarela de pago online
          // (ej: efectivo, transferencia → sí se muestran para que el operador las acepte)
          this.prisma.order.findMany({
            where: {
              status: 'PENDING',
              OR: [
                { paymentProvider: { notIn: onlineProviders } },
                { paymentProvider: null },
              ],
            },
            include: fullInclude,
            orderBy: { createdAt: 'desc' },
          }),
          this.prisma.order.findMany({
            where: { status: { in: completedStatuses } },
            include: fullInclude,
            orderBy: { createdAt: 'desc' },
            take,
          }),
        ]);

      return [...activeOrders, ...pendingCashOrders, ...recentCompleted].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return await this.prisma.order.findMany({
      where: status ? { status } : undefined,
      include: fullInclude,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }

  async getDownloadUrl(
    userId: string,
    orderId: string | null,
    productId: string,
  ) {
    let order: any;

    if (orderId) {
      order = await this.prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
          status: { in: ['APPROVED', 'DELIVERED', 'SHIPPED', 'PROCESSING'] },
        },
        include: { items: { where: { variant: { productId } } } },
      });
    } else {
      order = await this.prisma.order.findFirst({
        where: {
          userId,
          status: { in: ['APPROVED', 'DELIVERED', 'SHIPPED', 'PROCESSING'] },
          items: { some: { variant: { productId } } },
        },
        select: { id: true },
      });
    }

    if (!order) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este producto o no has comprado este ítem.',
      );
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { digitalFileUrl: true, productType: true },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    if (!product.digitalFileUrl) {
      throw new NotFoundException(
        'Este producto no tiene archivo digital asociado',
      );
    }

    const signedUrl = await this.storage.getSignedUrl(
      product.digitalFileUrl,
      3600,
    );
    return { downloadUrl: signedUrl };
  }

  async createPayment(orderId: string, dto: CreatePaymentDto) {
    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new NotFoundException('Orden no encontrada');

      const payment = await tx.payment.create({
        data: {
          tenantId: this.getTenantId(),
          orderId,
          amount: dto.amount,
          method: dto.method,
          reference: dto.reference,
        },
      });

      if (dto.itemIds && dto.itemIds.length > 0) {
        await tx.orderItem.updateMany({
          where: { id: { in: dto.itemIds }, orderId },
          data: { isPaid: true },
        });
      }

      let shouldClose = dto.closeOrder;

      if (!shouldClose) {
        const unpaidItemsCount = await tx.orderItem.count({
          where: { orderId, isPaid: false },
        });
        if (unpaidItemsCount === 0) shouldClose = true;
      }

      if (shouldClose) {
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'DELIVERED' },
        });
      }

      const updatedOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              modifiers: true,
              variant: { include: { product: true } },
            },
          },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      this.ordersGateway.emit(this.getTenantId(), {
        type: 'payment_received',
        orderId,
        data: {
          ...updatedOrder,
          paymentAmount: Number(dto.amount),
          paymentMethod: dto.method,
          closed: shouldClose,
        },
      });

      return payment;
    });
  }

  async toggleItemPrepared(
    orderId: string,
    itemId: string,
    isPrepared: boolean,
  ) {
    const item = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
    });

    if (!item) throw new NotFoundException('Item no encontrado en esta orden');

    const updatedItem = await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { isPrepared },
    });

    this.logger.log(
      `Item ${itemId} de orden ${orderId} marcado como ${isPrepared ? 'PREPARADO' : 'PENDIENTE'}`,
    );

    this.ordersGateway.emit(this.getTenantId(), {
      type: 'status_changed',
      orderId,
      data: { itemId, isPrepared, triggeredBy: 'kitchen_display' },
    });

    return updatedItem;
  }

  async assignDriver(orderId: string, driverId: string, userRole: Role) {
    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });

      if (!order) throw new NotFoundException('Orden no encontrada');
      if (order.orderType !== 'DELIVERY') {
        throw new BadRequestException(
          'Solo se pueden asignar domiciliarios a órdenes de tipo DELIVERY',
        );
      }
      if (order.status !== 'READY') {
        throw new BadRequestException(
          `La orden debe estar en estado READY para asignar domiciliario. Estado actual: ${order.status}`,
        );
      }

      const driver = await tx.deliveryDriver.findUnique({
        where: { id: driverId },
        include: { user: { select: { name: true } } },
      });

      if (!driver) throw new NotFoundException('Domiciliario no encontrado');
      if (driver.status !== 'AVAILABLE') {
        throw new BadRequestException(
          `El domiciliario ${driver.user.name} no está disponible. Estado: ${driver.status}`,
        );
      }

      validateOrderTransition(order.status, 'ASSIGNED', userRole);

      const now = new Date();
      const deliverySequence = driver.currentActiveOrders + 1;

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'ASSIGNED',
          driverId,
          assignedAt: now,
          deliverySequence,
        },
        include: {
          items: { include: { modifiers: true } },
          driver: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      const newActiveOrders = driver.currentActiveOrders + 1;
      const newStatus =
        newActiveOrders >= driver.maxCapacity ? 'AT_CAPACITY' : driver.status;

      await tx.deliveryDriver.update({
        where: { id: driverId },
        data: { currentActiveOrders: newActiveOrders, status: newStatus },
      });

      const analytics = await tx.orderDeliveryAnalytics.findUnique({
        where: { orderId },
      });

      if (analytics) {
        const timeToAssign = analytics.shippedAt
          ? Math.floor((now.getTime() - analytics.shippedAt.getTime()) / 1000)
          : analytics.preparingAt
            ? Math.floor(
                (now.getTime() - analytics.preparingAt.getTime()) / 1000,
              )
            : undefined;

        await tx.orderDeliveryAnalytics.update({
          where: { id: analytics.id },
          data: { driverId, assignedAt: now, timeToAssign },
        });
      }

      this.ordersGateway.emit(this.getTenantId(), {
        type: 'driver_assigned',
        orderId,
        data: updated,
      });

      this.logger.log(
        `Orden ${order.orderNumber} asignada a domiciliario ${driver.user.name}`,
      );

      return updated;
    });
  }

  async getDriverOrders(driverId: string) {
    return this.prisma.order.findMany({
      where: { driverId, status: { in: ['ASSIGNED', 'IN_TRANSIT'] } },
      include: {
        items: {
          include: {
            modifiers: true,
            variant: { include: { product: true } },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async getDriverOrdersByUserId(userId: string) {
    const driver = await this.prisma.deliveryDriver.findUnique({
      where: { userId },
    });

    if (!driver)
      throw new NotFoundException('Perfil de domiciliario no encontrado');

    return this.getDriverOrders(driver.id);
  }
}
