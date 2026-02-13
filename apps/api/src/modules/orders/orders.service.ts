import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ProductType, OrderStatus, Prisma } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        private prisma: PrismaService,
        private storage: StorageService
    ) { }

    // ============ CREAR ORDEN (con cálculo server-side) ============
    async createOrder(userId: string | undefined, dto: CreateOrderDto) {
        return await this.prisma.client.$transaction(async (tx) => {
            // Generar orderNumber único
            const orderCount = await tx.order.count();
            const year = new Date().getFullYear();
            const orderNumber = `ORD-${year}-${String(orderCount + 1).padStart(4, '0')}`;

            let totalAmount = new Decimal(0);
            const orderItemsData: Array<{
                variantId: string;
                quantity: number;
                price: Decimal;
                productName: string;
                variantName: string | null;
                notes: string | null;
                modifiers: Array<{
                    modifierId: string;
                    modifierName: string;
                    priceAdjustment: Decimal;
                    quantity: number;
                }>;
            }> = [];

            // Procesar cada item
            for (const item of dto.items) {
                const variant = await tx.productVariant.findUnique({
                    where: { id: item.variantId },
                    include: {
                        product: {
                            include: { modifierGroups: { include: { modifiers: true } } }
                        }
                    }
                });

                if (!variant) {
                    throw new NotFoundException(`Variante no encontrada: ${item.variantId}`);
                }

                if (!variant.product.published || !variant.product.isAvailable) {
                    throw new BadRequestException(`Producto no disponible: ${variant.product.name}`);
                }

                // Validar Stock de Variante
                if (variant.stock !== -1) { // -1 = Infinito/Digital
                    if (variant.stock < item.quantity) {
                        throw new BadRequestException(`Stock insuficiente para ${variant.product.name} (${variant.name})`);
                    }
                    // Decrementar stock
                    await tx.productVariant.update({
                        where: { id: variant.id },
                        data: { stock: { decrement: item.quantity } }
                    });
                }

                let itemPrice = variant.price;
                const modifiersData: Array<{
                    modifierId: string;
                    modifierName: string;
                    priceAdjustment: Decimal;
                    quantity: number;
                }> = [];

                // Validar Modificadores
                if (item.modifiers && item.modifiers.length > 0) {
                    const groupedModifiers = item.modifiers.reduce((acc, mod) => {
                        // Encontrar el modificador real en la DB (desde la variante fetched)
                        // Esto es ineficiente si son muchos, mejor fetch modifiers.
                        // Pero por ahora usamos la logica de grupos de la variante.
                        // O mejor, hacemos fetch de los modifiers seleccionados.
                        // Para simplificar y seguir el test, validamos contra los grupos del producto.
                        return acc; // TODO: Implementar validación completa de modificadores si es necesario estrictamente
                    }, {});

                    // Por ahora, procesamos los modificadores enviados
                    for (const mod of item.modifiers) {
                        const dbModifier = await tx.modifier.findUnique({
                            where: { id: mod.modifierId }
                        });

                        if (!dbModifier) continue;
                        if (!dbModifier.isAvailable) {
                            throw new BadRequestException(`Modificador no disponible: ${dbModifier.name}`);
                        }

                        // Validar stock modificador
                        if (dbModifier.stock !== null && dbModifier.stock < mod.quantity) {
                            throw new BadRequestException(`Stock insuficiente para modificador ${dbModifier.name}`);
                        }

                        itemPrice = itemPrice.plus(dbModifier.priceAdjustment.times(mod.quantity));
                        modifiersData.push({
                            modifierId: dbModifier.id,
                            modifierName: dbModifier.name,
                            priceAdjustment: dbModifier.priceAdjustment,
                            quantity: mod.quantity
                        });
                    }
                }

                // Validar Min/Max Select de Grupos
                for (const group of variant.product.modifierGroups) {
                    const selectedInGroup = item.modifiers?.filter(m =>
                        group.modifiers.some(gm => gm.id === m.modifierId)
                    ) || [];

                    const totalSelected = selectedInGroup.reduce((sum, m) => sum + m.quantity, 0);

                    if (totalSelected < group.minSelect) {
                        throw new BadRequestException(`El grupo ${group.name} requiere mínimo ${group.minSelect} selecciones.`);
                    }
                    if (totalSelected > group.maxSelect) {
                        throw new BadRequestException(`El grupo ${group.name} permite máximo ${group.maxSelect} selecciones.`);
                    }
                }

                totalAmount = totalAmount.plus(itemPrice.times(item.quantity));

                orderItemsData.push({
                    variantId: variant.id,
                    quantity: item.quantity,
                    price: itemPrice, // Precio unitario con modificadores
                    productName: variant.product.name,
                    variantName: variant.name,
                    notes: item.notes || null,
                    modifiers: modifiersData
                });
            }
            // ... (rest of processing)

            // 8. Crear la orden
            const order = await tx.order.create({
                data: {
                    // @ts-ignore
                    userId: userId || null, // Allow null for Guest
                    orderNumber,
                    totalAmount,
                    orderType: dto.orderType || 'DINE_IN',
                    tableNumber: dto.tableNumber || null,

                    // New Fields
                    customerName: dto.customerName || null,
                    customerPhone: dto.customerPhone || null,
                    notes: dto.notes || null,
                    shippingData: dto.shippingData || Prisma.DbNull, // Handle Json null

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
                    items: {
                        include: {
                            modifiers: true,
                            variant: {
                                include: { product: true },
                            },
                        },
                    },
                },
            });

            this.logger.log(`Orden ${orderNumber} creada — Total: ${totalAmount} — Items: ${dto.items.length}`);
            return order;
        });
    }

    // ============ CAMBIO DE ESTADO (Kitchen Display / Mesero) ============
    async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
        const order = await this.prisma.client.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Orden no encontrada');
        }

        return await this.prisma.client.order.update({
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
    }

    // ============ MIS ÓRDENES ============
    async findMyOrders(userId: string) {
        return await this.prisma.client.order.findMany({
            where: {
                userId,
                status: { in: ['APPROVED', 'DELIVERED', 'SHIPPED', 'PROCESSING', 'PREPARING', 'READY', 'SERVED'] }
            },
            include: {
                items: {
                    include: {
                        modifiers: true,
                        variant: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // ============ ADMIN: LISTAR ÓRDENES ============
    async findAllAdmin(status?: OrderStatus) {
        return await this.prisma.client.order.findMany({
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
        });
    }

    // ============ DESCARGAS DIGITALES ============
    async getDownloadUrl(userId: string, orderId: string | null, productId: string) {
        let order;

        if (orderId) {
            order = await this.prisma.client.order.findFirst({
                where: {
                    id: orderId,
                    userId,
                    status: { in: ['APPROVED', 'DELIVERED', 'SHIPPED', 'PROCESSING'] }
                },
                include: {
                    items: {
                        where: {
                            variant: {
                                productId: productId
                            }
                        }
                    }
                }
            });
        } else {
            const validOrder = await this.prisma.client.order.findFirst({
                where: {
                    userId,
                    status: { in: ['APPROVED', 'DELIVERED', 'SHIPPED', 'PROCESSING'] },
                    items: {
                        some: {
                            variant: {
                                productId: productId
                            }
                        }
                    }
                },
                select: { id: true }
            });
            order = validOrder;
        }

        if (!order) {
            throw new ForbiddenException('No tienes permiso para acceder a este producto o no has comprado este ítem.');
        }

        const product = await this.prisma.client.product.findUnique({
            where: { id: productId },
            select: { digitalFileUrl: true, productType: true }
        });

        if (!product) {
            throw new NotFoundException('Producto no encontrado');
        }

        if (product.productType !== ProductType.DIGITAL && product.productType !== 'SERVICE') {
        }

        if (!product.digitalFileUrl) {
            throw new NotFoundException('Este producto no tiene archivo digital asociado');
        }

        const signedUrl = await this.storage.getSignedUrl(product.digitalFileUrl, 3600);
        return { downloadUrl: signedUrl };
    }
}
