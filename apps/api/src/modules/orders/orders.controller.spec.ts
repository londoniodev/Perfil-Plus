import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController, AdminOrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OrderStatus, OrderType } from '@prisma/client';

// ============ MOCK DATA ============

const mockOrder = {
    id: 'order-1',
    orderNumber: 'ORD-2026-0001',
    userId: 'user-1',
    status: 'PENDING',
    orderType: 'DINE_IN',
    tableNumber: '5',
    totalAmount: 21.49,
    items: [
        {
            id: 'oi-1',
            productName: 'Hamburguesa Clásica',
            variantName: 'Standard',
            quantity: 1,
            price: 15.99,
            modifiers: [
                { modifierName: 'Queso Extra', priceAdjustment: 2.0, quantity: 1 },
            ],
        },
    ],
};

const mockOrdersService = {
    createOrder: jest.fn(),
    findMyOrders: jest.fn(),
    getDownloadUrl: jest.fn(),
    findAllAdmin: jest.fn(),
    updateStatus: jest.fn(),
};

// Mock guard que siempre permite acceso
const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

// ============ ORDERS CONTROLLER ============

describe('OrdersController', () => {
    let controller: OrdersController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrdersController],
            providers: [
                { provide: OrdersService, useValue: mockOrdersService },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockGuard)
            .compile();

        controller = module.get<OrdersController>(OrdersController);
        jest.clearAllMocks();
    });

    // ============ POST /orders ============

    describe('createOrder', () => {
        it('debería llamar ordersService.createOrder con userId y dto', async () => {
            const dto: CreateOrderDto = {
                orderType: OrderType.DINE_IN,
                tableNumber: '5',
                items: [{ variantId: 'var-1', quantity: 1 }],
            };
            mockOrdersService.createOrder.mockResolvedValue(mockOrder);

            const result = await controller.createOrder('user-1', dto);

            expect(mockOrdersService.createOrder).toHaveBeenCalledWith('user-1', dto);
            expect(result).toEqual(mockOrder);
        });

        it('debería soportar userId undefined para guest checkout (POS mesero)', async () => {
            const dto: CreateOrderDto = {
                orderType: OrderType.DINE_IN,
                tableNumber: '3',
                customerName: 'Mesa 3',
                items: [{ variantId: 'var-1', quantity: 2 }],
            };
            mockOrdersService.createOrder.mockResolvedValue({ ...mockOrder, userId: null });

            const result = await controller.createOrder(undefined, dto);

            expect(mockOrdersService.createOrder).toHaveBeenCalledWith(undefined, dto);
            expect(result.userId).toBeNull();
        });

        it('debería soportar orden DINE_IN con modifiers y notas', async () => {
            const dto: CreateOrderDto = {
                orderType: OrderType.DINE_IN,
                tableNumber: '5',
                notes: 'Atendido por: Juan',
                items: [
                    {
                        variantId: 'var-1',
                        quantity: 1,
                        notes: 'Sin cebolla',
                        modifiers: [
                            { modifierId: 'mod-1', quantity: 1 },
                            { modifierId: 'mod-2', quantity: 1 },
                        ],
                    },
                ],
            };
            mockOrdersService.createOrder.mockResolvedValue(mockOrder);

            await controller.createOrder('user-1', dto);

            expect(mockOrdersService.createOrder).toHaveBeenCalledWith('user-1', dto);
        });

        it('debería crear orden POS con status PREPARING (flujo cocina directo)', async () => {
            const dto: CreateOrderDto = {
                orderType: OrderType.DINE_IN,
                tableNumber: '5',
                status: OrderStatus.PREPARING,
                items: [{ variantId: 'var-1', quantity: 1 }],
            };
            const orderWithPreparing = { ...mockOrder, status: 'PREPARING' };
            mockOrdersService.createOrder.mockResolvedValue(orderWithPreparing);

            const result = await controller.createOrder(undefined, dto);

            expect(mockOrdersService.createOrder).toHaveBeenCalledWith(undefined, dto);
            expect(result.status).toBe('PREPARING');
        });
    });

    // ============ GET /orders/my-orders ============

    describe('findMyOrders', () => {
        it('debería llamar findMyOrders con userId', async () => {
            const orders = [mockOrder];
            mockOrdersService.findMyOrders.mockResolvedValue(orders);

            const result = await controller.findMyOrders('user-1');

            expect(mockOrdersService.findMyOrders).toHaveBeenCalledWith('user-1');
            expect(result).toEqual(orders);
        });
    });

    // ============ GET /orders/product/:productId/download ============

    describe('downloadByProduct', () => {
        it('debería llamar getDownloadUrl con userId, null orderId, y productId', async () => {
            const downloadResult = { url: 'https://signed-url.com/file' };
            mockOrdersService.getDownloadUrl.mockResolvedValue(downloadResult);

            const result = await controller.downloadByProduct('user-1', 'prod-1');

            expect(mockOrdersService.getDownloadUrl).toHaveBeenCalledWith('user-1', null, 'prod-1');
            expect(result).toEqual(downloadResult);
        });
    });

    // ============ GET /orders/:id/download/:productId ============

    describe('downloadItem', () => {
        it('debería llamar getDownloadUrl con userId, orderId, y productId', async () => {
            const downloadResult = { url: 'https://signed-url.com/file' };
            mockOrdersService.getDownloadUrl.mockResolvedValue(downloadResult);

            const result = await controller.downloadItem('user-1', 'order-1', 'prod-1');

            expect(mockOrdersService.getDownloadUrl).toHaveBeenCalledWith('user-1', 'order-1', 'prod-1');
            expect(result).toEqual(downloadResult);
        });
    });
});

// ============ ADMIN ORDERS CONTROLLER ============

describe('AdminOrdersController', () => {
    let controller: AdminOrdersController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AdminOrdersController],
            providers: [
                { provide: OrdersService, useValue: mockOrdersService },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockGuard)
            .overrideGuard(RolesGuard)
            .useValue(mockGuard)
            .compile();

        controller = module.get<AdminOrdersController>(AdminOrdersController);
        jest.clearAllMocks();
    });

    // ============ GET /admin/orders ============

    describe('findAll', () => {
        it('debería llamar findAllAdmin sin filtro de status', async () => {
            const orders = [mockOrder];
            mockOrdersService.findAllAdmin.mockResolvedValue(orders);

            const result = await controller.findAll();

            expect(mockOrdersService.findAllAdmin).toHaveBeenCalledWith(undefined, false);
            expect(result).toEqual(orders);
        });

        it('debería llamar findAllAdmin con filtro PENDING', async () => {
            const pendingOrders = [mockOrder];
            mockOrdersService.findAllAdmin.mockResolvedValue(pendingOrders);

            const result = await controller.findAll(OrderStatus.PENDING);

            expect(mockOrdersService.findAllAdmin).toHaveBeenCalledWith(OrderStatus.PENDING, false);
            expect(result).toEqual(pendingOrders);
        });

        it('debería llamar findAllAdmin con filtro PREPARING (cocina)', async () => {
            mockOrdersService.findAllAdmin.mockResolvedValue([]);

            const result = await controller.findAll(OrderStatus.PREPARING);

            expect(mockOrdersService.findAllAdmin).toHaveBeenCalledWith(OrderStatus.PREPARING, false);
            expect(result).toEqual([]);
        });

        it('debería llamar findAllAdmin con activeOnly=true (KDS polling)', async () => {
            const activeOrders = [
                { ...mockOrder, status: 'PREPARING' },
                { ...mockOrder, id: 'order-2', status: 'READY' },
            ];
            mockOrdersService.findAllAdmin.mockResolvedValue(activeOrders);

            const result = await controller.findAll(undefined, 'true');

            expect(mockOrdersService.findAllAdmin).toHaveBeenCalledWith(undefined, true);
            expect(result).toEqual(activeOrders);
        });

        it('debería tratar activeOnly como false si no es "true"', async () => {
            mockOrdersService.findAllAdmin.mockResolvedValue([mockOrder]);

            await controller.findAll(undefined, 'false');

            expect(mockOrdersService.findAllAdmin).toHaveBeenCalledWith(undefined, false);
        });
    });

    // ============ PATCH /admin/orders/:id/status ============

    describe('updateStatus', () => {
        it('debería cambiar estado a PREPARING (flujo cocina)', async () => {
            const dto: UpdateOrderStatusDto = { status: OrderStatus.PREPARING };
            const updatedOrder = { ...mockOrder, status: 'PREPARING' };
            mockOrdersService.updateStatus.mockResolvedValue(updatedOrder);

            const result = await controller.updateStatus('order-1', dto);

            expect(mockOrdersService.updateStatus).toHaveBeenCalledWith('order-1', dto);
            expect(result.status).toBe('PREPARING');
        });

        it('debería cambiar estado a READY (listo para entregar)', async () => {
            const dto: UpdateOrderStatusDto = { status: OrderStatus.READY };
            const updatedOrder = { ...mockOrder, status: 'READY' };
            mockOrdersService.updateStatus.mockResolvedValue(updatedOrder);

            const result = await controller.updateStatus('order-1', dto);

            expect(mockOrdersService.updateStatus).toHaveBeenCalledWith('order-1', dto);
            expect(result.status).toBe('READY');
        });

        it('debería cambiar estado a SERVED (servido en mesa)', async () => {
            const dto: UpdateOrderStatusDto = { status: OrderStatus.SERVED };
            const updatedOrder = { ...mockOrder, status: 'SERVED' };
            mockOrdersService.updateStatus.mockResolvedValue(updatedOrder);

            const result = await controller.updateStatus('order-1', dto);

            expect(mockOrdersService.updateStatus).toHaveBeenCalledWith('order-1', dto);
            expect(result.status).toBe('SERVED');
        });
    });
});
