import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

// ============ MOCK FACTORIES ============

const MOCK_VARIANT = {
    id: 'var-1',
    productId: 'prod-1',
    sku: 'BURG-001',
    price: new Decimal(15.99),
    stock: 50,
    isDefault: true,
    name: 'Standard',
    product: {
        id: 'prod-1',
        name: 'Hamburguesa Clásica',
        published: true,
        isAvailable: true,
        modifierGroups: [
            {
                id: 'mg-1',
                productId: 'prod-1',
                name: 'Extras',
                minSelect: 0,
                maxSelect: 3,
                modifiers: [
                    { id: 'mod-1', name: 'Queso Extra', priceAdjustment: new Decimal(2), stock: 20, isAvailable: true },
                    { id: 'mod-2', name: 'Tocino', priceAdjustment: new Decimal(3.5), stock: 15, isAvailable: true },
                ],
            },
            {
                id: 'mg-2',
                productId: 'prod-1',
                name: 'Tamaño',
                minSelect: 1,
                maxSelect: 1,
                modifiers: [
                    { id: 'mod-3', name: 'Regular', priceAdjustment: new Decimal(0), stock: null, isAvailable: true },
                    { id: 'mod-4', name: 'Grande', priceAdjustment: new Decimal(4), stock: null, isAvailable: true },
                ],
            },
        ],
    },
};

const MOCK_ORDER = {
    id: 'order-1',
    userId: 'user-1',
    orderNumber: 'ORD-2026-0001',
    totalAmount: new Decimal(21.49),
    orderType: 'DINE_IN',
    tableNumber: '5',
    status: 'PENDING',
    items: [
        {
            id: 'oi-1',
            variantId: 'var-1',
            quantity: 1,
            price: new Decimal(21.49),
            productName: 'Hamburguesa Clásica',
            variantName: 'Standard',
            notes: 'Sin cebolla',
            modifiers: [
                { modifierId: 'mod-1', modifierName: 'Queso Extra', priceAdjustment: new Decimal(2), quantity: 1 },
                { modifierId: 'mod-2', modifierName: 'Tocino', priceAdjustment: new Decimal(3.5), quantity: 1 },
            ],
            variant: {
                id: 'var-1',
                product: { id: 'prod-1', name: 'Hamburguesa Clásica' },
            },
        },
    ],
};

function createMockTx() {
    const tx: any = {
        order: {
            count: jest.fn().mockResolvedValue(0),
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
        },
        productVariant: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        modifier: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };
    return tx;
}

describe('OrdersService', () => {
    let service: OrdersService;
    let mockClient: any;
    let mockTx: ReturnType<typeof createMockTx>;

    beforeEach(async () => {
        mockTx = createMockTx();
        mockClient = {
            ...mockTx,
            $transaction: jest.fn((fn) => fn(mockTx)),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                {
                    provide: PrismaService,
                    useValue: { client: mockClient },
                },
                {
                    provide: StorageService,
                    useValue: { getSignedUrl: jest.fn() },
                },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);
    });

    // ============ CREAR ORDEN ============

    describe('createOrder', () => {
        it('debería crear orden con cálculo de precio server-side', async () => {
            // Variante con precio 15.99, modificadores de +2, +3.5 (Extras) y +0 (Tamaño Regular)
            mockTx.productVariant.findUnique.mockResolvedValue(MOCK_VARIANT);
            mockTx.modifier.findUnique
                // Resolver mod-1 (Queso Extra, grupo Extras)
                .mockResolvedValueOnce({
                    ...MOCK_VARIANT.product.modifierGroups[0].modifiers[0],
                    group: MOCK_VARIANT.product.modifierGroups[0],
                })
                // Resolver mod-2 (Tocino, grupo Extras)
                .mockResolvedValueOnce({
                    ...MOCK_VARIANT.product.modifierGroups[0].modifiers[1],
                    group: MOCK_VARIANT.product.modifierGroups[0],
                })
                // Resolver mod-3 (Regular, grupo Tamaño) — satisface minSelect:1
                .mockResolvedValueOnce({
                    ...MOCK_VARIANT.product.modifierGroups[1].modifiers[0],
                    group: MOCK_VARIANT.product.modifierGroups[1],
                })
                // Para el decrement check de mod-1 y mod-2 (stock check)
                .mockResolvedValueOnce({ stock: 20 })
                .mockResolvedValueOnce({ stock: 15 });

            mockTx.order.create.mockResolvedValue(MOCK_ORDER);

            const dto = {
                orderType: 'DINE_IN' as any,
                tableNumber: '5',
                items: [
                    {
                        variantId: 'var-1',
                        quantity: 1,
                        notes: 'Sin cebolla',
                        modifiers: [
                            { modifierId: 'mod-1', quantity: 1 },
                            { modifierId: 'mod-2', quantity: 1 },
                            { modifierId: 'mod-3', quantity: 1 }, // Tamaño Regular
                        ],
                    },
                ],
            };

            const result = await service.createOrder('user-1', dto);

            // Verifica que se creó la orden con los datos correctos
            expect(mockTx.order.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        userId: 'user-1',
                        orderType: 'DINE_IN',
                        tableNumber: '5',
                    }),
                }),
            );

            // Verifica que se decrementó stock de la variante
            expect(mockTx.productVariant.update).toHaveBeenCalledWith({
                where: { id: 'var-1' },
                data: { stock: { decrement: 1 } },
            });

            expect(result).toEqual(MOCK_ORDER);
        });

        it('debería lanzar NotFoundException si la variante no existe', async () => {
            mockTx.productVariant.findUnique.mockResolvedValue(null);

            const dto = {
                items: [{ variantId: 'no-existe', quantity: 1 }],
            };

            await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(NotFoundException);
        });

        it('debería lanzar BadRequestException si stock es insuficiente', async () => {
            const lowStockVariant = {
                ...MOCK_VARIANT,
                stock: 2,
            };
            mockTx.productVariant.findUnique.mockResolvedValue(lowStockVariant);

            const dto = {
                items: [{ variantId: 'var-1', quantity: 5 }], // quiere 5, solo hay 2
            };

            await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(BadRequestException);
            await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(/Stock insuficiente/);
        });

        it('debería lanzar BadRequestException si producto no está publicado', async () => {
            const unpublishedVariant = {
                ...MOCK_VARIANT,
                product: { ...MOCK_VARIANT.product, published: false },
            };
            mockTx.productVariant.findUnique.mockResolvedValue(unpublishedVariant);

            const dto = { items: [{ variantId: 'var-1', quantity: 1 }] };
            await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(BadRequestException);
            await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(/no disponible/);
        });

        it('debería lanzar BadRequestException si producto no está disponible (isAvailable)', async () => {
            const unavailableVariant = {
                ...MOCK_VARIANT,
                product: { ...MOCK_VARIANT.product, isAvailable: false },
            };
            mockTx.productVariant.findUnique.mockResolvedValue(unavailableVariant);

            const dto = { items: [{ variantId: 'var-1', quantity: 1 }] };
            await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(/no disponible/);
        });

        it('debería validar minSelect — lanzar error si se requiere selección mínima y no se envía', async () => {
            // El grupo "Tamaño" tiene minSelect: 1, pero no se envían modifiers de ese grupo
            mockTx.productVariant.findUnique.mockResolvedValue(MOCK_VARIANT);

            const dto = {
                items: [{ variantId: 'var-1', quantity: 1 }], // sin modifiers
            };

            await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(BadRequestException);
            await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(/requiere mínimo/);
        });

        it('debería validar maxSelect — lanzar error si se excede el máximo', async () => {
            mockTx.productVariant.findUnique.mockResolvedValue(MOCK_VARIANT);

            // Grupo "Tamaño" tiene maxSelect: 1, enviamos 2 selecciones
            // Usamos mockImplementation para que cada llamada devuelva correctamente
            mockTx.modifier.findUnique.mockImplementation((args: any) => {
                if (args.where.id === 'mod-3') {
                    return Promise.resolve({
                        ...MOCK_VARIANT.product.modifierGroups[1].modifiers[0],
                        group: MOCK_VARIANT.product.modifierGroups[1],
                    });
                }
                if (args.where.id === 'mod-4') {
                    return Promise.resolve({
                        ...MOCK_VARIANT.product.modifierGroups[1].modifiers[1],
                        group: MOCK_VARIANT.product.modifierGroups[1],
                    });
                }
                return Promise.resolve(null);
            });

            const dto = {
                items: [
                    {
                        variantId: 'var-1',
                        quantity: 1,
                        modifiers: [
                            { modifierId: 'mod-3', quantity: 1 },
                            { modifierId: 'mod-4', quantity: 1 }, // ya son 2, maxSelect es 1
                        ],
                    },
                ],
            };

            await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(/permite máximo/);
        });

        it('debería lanzar error si modificador no está disponible', async () => {
            const unavailableModifier = {
                ...MOCK_VARIANT.product.modifierGroups[0].modifiers[0],
                isAvailable: false,
                group: MOCK_VARIANT.product.modifierGroups[0],
            };

            mockTx.productVariant.findUnique.mockResolvedValue(MOCK_VARIANT);
            mockTx.modifier.findUnique.mockResolvedValueOnce(unavailableModifier);

            const dto = {
                items: [
                    {
                        variantId: 'var-1',
                        quantity: 1,
                        modifiers: [{ modifierId: 'mod-1', quantity: 1 }],
                    },
                ],
            };

            await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(/no disponible/);
        });

        it('debería NO decrementar stock si variante es digital (stock = -1)', async () => {
            const digitalVariant = {
                ...MOCK_VARIANT,
                stock: -1,
                product: {
                    ...MOCK_VARIANT.product,
                    productType: 'DIGITAL',
                    modifierGroups: [], // digital sin modifiers
                },
            };

            mockTx.productVariant.findUnique.mockResolvedValue(digitalVariant);
            mockTx.order.create.mockResolvedValue({ ...MOCK_ORDER, items: [] });

            const dto = {
                items: [{ variantId: 'var-1', quantity: 1 }],
            };

            await service.createOrder('user-1', dto as any);

            // NO debería llamar update en productVariant (no decrement)
            expect(mockTx.productVariant.update).not.toHaveBeenCalled();
        });

        describe('Guest Checkout', () => {
            it('debería crear orden para usuario invitado (userId null) con detalles de cliente', async () => {
                mockTx.productVariant.findUnique.mockResolvedValue(MOCK_VARIANT);
                // Mock modifier findUnique for the required size modifier
                mockTx.modifier.findUnique.mockResolvedValue({
                    id: 'mod-3',
                    name: 'Regular',
                    priceAdjustment: new Decimal(0),
                    stock: null,
                    isAvailable: true,
                    group: MOCK_VARIANT.product.modifierGroups[1]
                });

                // @ts-ignore
                mockTx.order.create.mockResolvedValue({ ...MOCK_ORDER, userId: null });

                const dto = {
                    items: [{
                        variantId: 'var-1',
                        quantity: 1,
                        modifiers: [{ modifierId: 'mod-3', quantity: 1 }] // Add required modifier
                    }],
                    customerName: 'Guest User',
                    customerPhone: '555-1234',
                    orderType: 'DINE_IN' as any,
                    tableNumber: '10'
                };

                await service.createOrder(undefined, dto as any);

                expect(mockTx.order.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            userId: null,
                            customerName: 'Guest User',
                            customerPhone: '555-1234',
                            tableNumber: '10',
                            orderType: 'DINE_IN',
                        }),
                    }),
                );
            });

            it('debería persistir datos de envío para delivery', async () => {
                mockTx.productVariant.findUnique.mockResolvedValue(MOCK_VARIANT);
                // Mock modifier findUnique
                mockTx.modifier.findUnique.mockResolvedValue({
                    id: 'mod-3',
                    name: 'Regular',
                    priceAdjustment: new Decimal(0),
                    stock: null,
                    isAvailable: true,
                    group: MOCK_VARIANT.product.modifierGroups[1]
                });

                // @ts-ignore
                mockTx.order.create.mockResolvedValue({ ...MOCK_ORDER, userId: null, orderType: 'DELIVERY' });

                const shippingData = { address: 'Calle 123', city: 'Ciudad' };
                const dto = {
                    items: [{
                        variantId: 'var-1',
                        quantity: 1,
                        modifiers: [{ modifierId: 'mod-3', quantity: 1 }] // Add required modifier
                    }],
                    customerName: 'Delivery User',
                    customerPhone: '555-9876',
                    orderType: 'DELIVERY' as any,
                    shippingData
                };

                await service.createOrder(undefined, dto as any);

                expect(mockTx.order.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            userId: null,
                            orderType: 'DELIVERY',
                            shippingData: expect.objectContaining(shippingData),
                        }),
                    }),
                );
            });
        });
    });

    // ============ CAMBIO DE ESTADO ============

    describe('updateStatus', () => {
        it('debería cambiar estado de orden existente', async () => {
            const updatedOrder = { ...MOCK_ORDER, status: 'PREPARING' };
            mockClient.order.findUnique.mockResolvedValue(MOCK_ORDER);
            mockClient.order.update.mockResolvedValue(updatedOrder);

            const result = await service.updateStatus('order-1', { status: 'PREPARING' as any });

            expect(mockClient.order.update).toHaveBeenCalledWith({
                where: { id: 'order-1' },
                data: { status: 'PREPARING' },
                include: expect.objectContaining({
                    items: expect.objectContaining({
                        include: expect.objectContaining({ modifiers: true }),
                    }),
                }),
            });

            expect(result.status).toBe('PREPARING');
        });

        it('debería lanzar NotFoundException si la orden no existe', async () => {
            mockClient.order.findUnique.mockResolvedValue(null);

            await expect(
                service.updateStatus('no-existe', { status: 'PREPARING' as any }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    // ============ LISTAR ÓRDENES ADMIN ============

    describe('findAllAdmin', () => {
        it('debería listar todas las órdenes sin filtro', async () => {
            const orders = [MOCK_ORDER];
            mockClient.order.findMany.mockResolvedValue(orders);

            const result = await service.findAllAdmin();

            expect(mockClient.order.findMany).toHaveBeenCalledWith({
                where: undefined,
                include: expect.objectContaining({
                    user: expect.objectContaining({ select: expect.objectContaining({ email: true }) }),
                    items: expect.anything(),
                }),
                orderBy: { createdAt: 'desc' },
            });

            expect(result).toEqual(orders);
        });

        it('debería filtrar órdenes por status', async () => {
            const pendingOrders = [MOCK_ORDER];
            mockClient.order.findMany.mockResolvedValue(pendingOrders);

            const result = await service.findAllAdmin('PENDING' as any);

            expect(mockClient.order.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'PENDING' },
                }),
            );

            expect(result).toEqual(pendingOrders);
        });
    });
});
