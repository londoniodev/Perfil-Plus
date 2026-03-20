import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ProductType, OrderStatus, Prisma, Role } from '@alvarosky/database';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

import { Decimal } from '@prisma/client/runtime/library';
import { OrdersGateway } from './orders.gateway';
import { validateOrderTransition } from './domain/order-state-machine';
import { InventoryService } from '../inventory/inventory.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

import { OrderPricingService } from './services/order-pricing.service';
import { OrderValidationService } from './services/order-validation.service';
import { OrderCreatedEvent, OrderStatusChangedEvent } from './events/order.events';

@Injectable({ scope: Scope.REQUEST })
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private prisma: PrismaService,
    private storage: StorageService,
    private ordersGateway: OrdersGateway,
    private inventoryService: InventoryService,
    private eventEmitter: EventEmitter2,
    private pricingService: OrderPricingService,
    private validationService: OrderValidationService,
  ) { }

  private getTenantId(): string {
    const tenantId = this.request.headers['x-tenant-id'] as string;
    if (!tenantId) {
      // Fallback for some edge cases or throw?
      // Ideally we should always have it if we used the guard/interceptor.
      // But for safety in async contexts (if any) we might check.
      // services are request scoped so it should be fine.
      this.logger.warn('Tenant ID missing in OrdersService');
      return 'default';
    }
    return tenantId;
  }

  // ============ CREAR ORDEN (con cálculo server-side) ============
  async createOrder(userId: string | undefined, dto: CreateOrderDto) {
    const tenantId = this.getTenantId();
    this.logger.log(`[CREATE_ORDER] Iniciando creación de orden para Tenant: ${tenantId}`);
    
    // 1. Validar y Calcular Precíos y Modificadores (Síncrono)
    const { totalAmount, orderItemsData } = await this.pricingService.calculate(tenantId, dto.items);

    let lastError: any;
    const MAX_RETRIES = 3;

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const createdOrder = await this.prisma.$transaction(async (tx) => {
          // 2. Generar número de orden
          const orderCount = await tx.order.count();
          const year = new Date().getFullYear();
          const orderNumber = `ORD-${year}-${String(orderCount + 1).padStart(4, '0')}`;

          // Validación de inventario lógico y deductivas
          await this.validationService.validateAndDeductStock(orderItemsData, tx);

          // 3. Crear la orden atómica
          const order = await tx.order.create({
            data: {
              tenantId,
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
                const paymentNote = dto.paymentMethod ? `Forma de pago: ${methodLabel}` : null;
                if (dto.notes && paymentNote) return `${dto.notes}\n\n${paymentNote}`;
                return paymentNote || dto.notes || null;
              })(),
              shippingData: dto.shippingData || Prisma.DbNull,
              items: {
                create: orderItemsData.map((item) => ({
                  variantId: item.variantId,
                  quantity: item.quantity,
                  price: item.price,
                  productName: item.productName,
                  variantName: item.variantName,
                  notes: item.notes,
                  modifiers: {
                    create: item.modifiers.map((mod) => ({
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
              items: { include: { modifiers: true, variant: { include: { product: true } } } },
            },
          });

          // DEDUCT INVENTORY RAW INGREDIENTS
          const productItems = orderItemsData.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          }));

          if (productItems.length > 0) {
            const inventoryResult = await this.inventoryService.deductByOrder(tenantId, order.id, productItems, tx);
            if (inventoryResult.alerts.length > 0) {
              this.logger.warn(`Orden ${orderNumber}: ${inventoryResult.alerts.length} alertas de stock bajo`);
            }
          }

          return order;
        });

        this.logger.log(`Orden ${createdOrder.orderNumber} creada — Total: ${totalAmount} — Items: ${dto.items.length}`);

        // DISPATCH DOMAIN EVENT (Side Effects handled asíncronamente por los Listeners)
        this.eventEmitter.emit('order.created', new OrderCreatedEvent(tenantId, createdOrder, dto));

        return createdOrder;
      } catch (error) {
        lastError = error;
        this.logger.error(`[CREATE_ORDER] Fallo en intento ${i + 1}/${MAX_RETRIES}: ${error.message}`);
        if (i < MAX_RETRIES - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100 * (i + 1)));
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') continue;
        throw error;
      }
    }
    this.logger.error(`[CREATE_ORDER] Todos los intentos fallaron. Error final: ${lastError.message}`);
    throw lastError;
  }

  // ============ CAMBIO DE ESTADO (Kitchen Display / Mesero) ============
  async updateStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    userRole: Role,
  ) {
    const order = await this.prisma.secure.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Validate Transition
    validateOrderTransition(order.status, dto.status, userRole);

    return await this.prisma.$transaction(async (tx) => {
      // 0. Verificar estado actual para evitar doble cancelación/devolución
      if (order.status === 'CANCELLED') {
        throw new BadRequestException(
          'Esta orden ya fue cancelada anteriormente.',
        );
      }

      // 1. Si el nuevo estado es CANCELLED, devolver stock
      if (dto.status === 'CANCELLED') {
        const orderWithItems = await tx.order.findUnique({
          where: { id: orderId },
          include: {
            items: {
              include: {
                modifiers: true,
                variant: true,
              },
            },
          },
        });

        if (orderWithItems) {
          for (const item of orderWithItems.items) {
            // Devolver stock Variante
            if (item.variant.stock !== -1) {
              // -1 = Infinito
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            }

            // Devolver stock Modificadores
            for (const mod of item.modifiers) {
              // Necesitamos saber si el modifier tiene control de stock.
              // En OrderItemModifier no tenemos el stock actual, solo el ID y nombre snapshot.
              // Debemos buscar el modificador original en la DB.
              const originalModifier = await tx.modifier.findUnique({
                where: { id: mod.modifierId },
              });

              if (originalModifier && originalModifier.stock !== null) {
                await tx.modifier.update({
                  where: { id: mod.modifierId },
                  data: { stock: { increment: mod.quantity * item.quantity } },
                });
              }
            }
          }
          this.logger.log(
            `Stock de variantes restaurado para orden cancelada: ${orderId}`,
          );

          // Restaurar stock de inventario (ingredientes)
          await this.inventoryService.restoreByOrder(
            this.getTenantId(),
            orderId,
            tx,
          );
        }
      }

      // 2. Actualizar estado
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: dto.status },
        include: {
          items: {
            include: {
              modifiers: true,
            },
          },
        },
      });

      // 3. Analytics Updates
      // Fetch analytics separately to avoid type issues with nested includes
      const analytics = await tx.orderDeliveryAnalytics.findUnique({
        where: { orderId: orderId },
      });

      if (analytics) {
        const now = new Date();
        const analyticsUpdate: any = {};

        if (dto.status === 'PREPARING' && !analytics.preparingAt) {
          analyticsUpdate.preparingAt = now;
          analyticsUpdate.timeToPrepare = Math.floor(
            (now.getTime() - analytics.pendingAt.getTime()) / 1000,
          );
        } else if ((dto.status === 'SHIPPED' || dto.status === 'READY') && !analytics.shippedAt) {
          analyticsUpdate.shippedAt = now;
          if (analytics.preparingAt) {
            analyticsUpdate.timeToShip = Math.floor(
              (now.getTime() - analytics.preparingAt.getTime()) / 1000,
            );
          }
        } else if ((dto.status === 'DELIVERED' || dto.status === 'SERVED') && !analytics.deliveredAt) {
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

        // Update pickedUpAt when IN_TRANSIT
        if (dto.status === 'IN_TRANSIT' && analytics.assignedAt && !analytics.pickedUpAt) {
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

      // 4. Liberar domiciliario cuando se completa o cancela la entrega
      if (
        (dto.status === 'DELIVERED' || dto.status === 'CANCELLED') &&
        order.driverId
      ) {
        const driver = await tx.deliveryDriver.findUnique({
          where: { id: order.driverId },
        });

        if (driver) {
          const newActiveOrders = Math.max(0, driver.currentActiveOrders - 1);
          const newStatus = driver.status === 'OFFLINE' ? 'OFFLINE' : 'AVAILABLE';

          await tx.deliveryDriver.update({
            where: { id: order.driverId },
            data: {
              currentActiveOrders: newActiveOrders,
              status: newStatus,
            },
          });
          this.logger.log(
            `Domiciliario ${order.driverId} liberado tras ${dto.status === 'DELIVERED' ? 'entrega' : 'cancelación'} (órdenes activas: ${newActiveOrders})`,
          );
        }
      }

      // SSE: notificar cambio de estado con la orden actualizada completa
      this.ordersGateway.emit(this.getTenantId(), {
        type: 'status_changed',
        orderId,
        data: updated,
      });

      return updated;
    });
  }

  // ============ MIS ÓRDENES ============
  async findMyOrders(userId: string, take = 20, skip = 0) {
    return await this.prisma.secure.order.findMany({
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
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }

  // ============ TRACKING PÚBLICO ============
  async getOrderForTracking(orderId: string) {
    const order = await this.prisma.secure.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        customerName: true,
        items: {
          select: {
            productName: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  // ============ OBTENER UNA ORDEN (Pública/Segura) ============
  async findOne(id: string) {
    const order = await this.prisma.secure.order.findUnique({
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

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  // ============ ADMIN: LISTAR ÓRDENES ============
  // ============ ADMIN: LISTAR ÓRDENES ============
  async findAllAdmin(
    status?: OrderStatus,
    activeOnly: boolean = false,
    take = 50,
    skip = 0,
  ) {
    if (activeOnly) {
      // Fetch active orders + recent completed/delivered
      const activeStatuses: OrderStatus[] = [
        'PENDING',
        'APPROVED',
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

      const [activeOrders, recentCompleted] = await Promise.all([
        this.prisma.secure.order.findMany({
          where: { status: { in: activeStatuses } },
          include: {
            user: { select: { id: true, name: true, email: true } },
            items: {
              include: {
                modifiers: true,
                variant: { include: { product: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.secure.order.findMany({
          where: { status: { in: completedStatuses } },
          include: {
            user: { select: { id: true, name: true, email: true } },
            items: {
              include: {
                modifiers: true,
                variant: { include: { product: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take, // Paginated historical items
        }),
      ]);

      return [...activeOrders, ...recentCompleted].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return await this.prisma.secure.order.findMany({
      where: status ? { status } : undefined,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            modifiers: true,
            variant: {
              include: { product: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }

  // ============ DESCARGAS DIGITALES ============
  async getDownloadUrl(
    userId: string,
    orderId: string | null,
    productId: string,
  ) {
    let order;

    if (orderId) {
      order = await this.prisma.secure.order.findFirst({
        where: {
          id: orderId,
          userId,
          status: { in: ['APPROVED', 'DELIVERED', 'SHIPPED', 'PROCESSING'] },
        },
        include: {
          items: {
            where: {
              variant: {
                productId: productId,
              },
            },
          },
        },
      });
    } else {
      const validOrder = await this.prisma.secure.order.findFirst({
        where: {
          userId,
          status: { in: ['APPROVED', 'DELIVERED', 'SHIPPED', 'PROCESSING'] },
          items: {
            some: {
              variant: {
                productId: productId,
              },
            },
          },
        },
        select: { id: true },
      });
      order = validOrder;
    }

    if (!order) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este producto o no has comprado este ítem.',
      );
    }

    const product = await this.prisma.secure.product.findUnique({
      where: { id: productId },
      select: { digitalFileUrl: true, productType: true },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (
      product.productType !== ProductType.DIGITAL &&
      product.productType !== 'SERVICE'
    ) {
    }

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

  // ============ PAGOS (CAJA) ============
  async createPayment(orderId: string, dto: CreatePaymentDto) {
    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new NotFoundException('Orden no encontrada');

      // 1. Crear Pago
      const payment = await tx.payment.create({
        data: {
          orderId,
          amount: dto.amount,
          method: dto.method,
          reference: dto.reference,
        },
      });

      // 2. Marcar items como pagados
      if (dto.itemIds && dto.itemIds.length > 0) {
        await tx.orderItem.updateMany({
          where: {
            id: { in: dto.itemIds },
            orderId: orderId, // Seguridad extra
          },
          data: { isPaid: true },
        });
      }

      // 3. Verificar cierre de orden
      let shouldClose = dto.closeOrder;

      if (!shouldClose) {
        // Verificar si quedan items sin pagar
        const unpaidItemsCount = await tx.orderItem.count({
          where: {
            orderId: orderId,
            isPaid: false,
          },
        });

        if (unpaidItemsCount === 0) {
          shouldClose = true;
        }
      }

      if (shouldClose) {
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'DELIVERED' },
        });
      }

      // SSE: notificar pago recibido
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

  // ============ KITCHEN CONTROL (isPrepared) ============
  async toggleItemPrepared(
    orderId: string,
    itemId: string,
    isPrepared: boolean,
  ) {
    // 1. Verificar que el item pertenece a la orden
    const item = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
    });

    if (!item) {
      throw new NotFoundException('Item no encontrado en esta orden');
    }

    // 2. Actualizar estado
    const updatedItem = await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { isPrepared },
    });

    this.logger.log(
      `Item ${itemId} de orden ${orderId} marcado como ${isPrepared ? 'PREPARADO' : 'PENDIENTE'}`,
    );

    // 3. Notificar SSE a todos (Cocina, Meseros)
    // Podríamos enviar solo el update del item, pero para simplificar el frontend,
    // ordenamos refrescar la orden o enviamos el evento específico.
    // Vamos a enviar un 'order_update' genérico o 'item_update'.
    // Para consistencia con el frontend actual que escucha 'status_changed',
    // podemos reutilizar ese evento o crear uno nuevo.
    // El frontend WaiterClient hace `fetchOrders` en `status_changed`.
    // KitchenPage hace `fetchOrders` en `status_changed`.
    // Así que 'status_changed' es seguro para forzar recarga.

    this.ordersGateway.emit(this.getTenantId(), {
      type: 'status_changed',
      orderId,
      data: {
        itemId,
        isPrepared,
        triggeredBy: 'kitchen_display',
      },
    });

    return updatedItem;
  }

  // ============ ASIGNACIÓN DE DOMICILIARIO ============
  async assignDriver(orderId: string, driverId: string, userRole: Role) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Verificar que la orden existe, es DELIVERY y está READY
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException('Orden no encontrada');
      }

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

      // 2. Verificar que el driver existe y está disponible
      const driver = await tx.deliveryDriver.findUnique({
        where: { id: driverId },
        include: { user: { select: { name: true } } },
      });

      if (!driver) {
        throw new NotFoundException('Domiciliario no encontrado');
      }

      if (driver.status !== 'AVAILABLE') {
        throw new BadRequestException(
          `El domiciliario ${driver.user.name} no está disponible. Estado: ${driver.status}`,
        );
      }

      // 3. Validate transition
      validateOrderTransition(order.status, 'ASSIGNED', userRole);

      const now = new Date();

      // 4. Calcular secuencia y actualizar orden
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

      // 5. Actualizar capacidad del driver
      const newActiveOrders = driver.currentActiveOrders + 1;
      const newStatus =
        newActiveOrders >= driver.maxCapacity ? 'AT_CAPACITY' : driver.status;

      await tx.deliveryDriver.update({
        where: { id: driverId },
        data: {
          currentActiveOrders: newActiveOrders,
          status: newStatus,
        },
      });

      // 6. Actualizar analytics
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
          data: {
            driverId,
            assignedAt: now,
            timeToAssign,
          },
        });
      }

      // 7. Emitir SSE
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

  // ============ ÓRDENES DEL DOMICILIARIO ============
  async getDriverOrders(driverId: string) {
    return this.prisma.secure.order.findMany({
      where: {
        driverId,
        status: { in: ['ASSIGNED', 'IN_TRANSIT'] },
      },
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
    const driver = await this.prisma.secure.deliveryDriver.findUnique({
      where: { userId },
    });

    if (!driver) {
      throw new NotFoundException('Perfil de domiciliario no encontrado');
    }

    return this.getDriverOrders(driver.id);
  }
}
