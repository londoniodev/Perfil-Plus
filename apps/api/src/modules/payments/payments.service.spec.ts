import * as crypto from 'crypto';

// Mock EmailService ANTES de importar PaymentsService para evitar
// que Jest resuelva las dependencias de React Email templates
jest.mock('../email/email.service', () => ({
    EmailService: jest.fn().mockImplementation(() => ({
        sendDigitalPurchaseEmail: jest.fn().mockResolvedValue(true),
        sendSubscriptionSuccessEmail: jest.fn().mockResolvedValue(true),
        sendVerificationEmail: jest.fn().mockResolvedValue(true),
    })),
}));

// Mock mercadopago para evitar dependencias nativas
jest.mock('mercadopago', () => ({
    MercadoPagoConfig: jest.fn().mockImplementation(() => ({})),
    Preference: jest.fn().mockImplementation(() => ({ create: jest.fn() })),
    Payment: jest.fn().mockImplementation(() => ({ get: jest.fn() })),
}));

import { PaymentsService } from './payments.service';
import { EmailService } from '../email/email.service';
import { StorageService } from '../storage/storage.service';

// ============ MOCK DATA ============

const MOCK_MP_CONFIG = {
    accessToken: 'TEST-access-token-123',
    publicKey: 'TEST-public-key-456',
    webhookSecret: 'test-webhook-secret',
};

const MOCK_MP_CONFIG_SETTING = {
    key: 'MERCADOPAGO_CONFIG',
    value: JSON.stringify(MOCK_MP_CONFIG),
};

const MOCK_ORDER = {
    id: 'order-1',
    orderNumber: 'ORD-2026-0001',
    userId: 'user-1',
    status: 'PENDING',
    totalAmount: 25.50,
    items: [
        {
            id: 'oi-1',
            variantId: 'var-1',
            productName: 'Producto Test',
            quantity: 1,
            price: 25.50,
        },
    ],
    user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
    },
};

const MOCK_SUBSCRIPTION = {
    id: 'sub-1',
    userId: 'user-1',
    status: 'ACTIVE',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
};

// ============ MOCK FACTORIES ============

function createMockPrisma() {
    const client: any = {
        systemSetting: {
            findUnique: jest.fn(),
        },
        order: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        subscription: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            upsert: jest.fn(),
            count: jest.fn(),
            findMany: jest.fn(),
        },
        purchase: {
            count: jest.fn(),
        },
        productVariant: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        product: {
            findUnique: jest.fn(),
        },
    };

    return { client };
}

function createMockConfigService() {
    return {
        get: jest.fn().mockReturnValue(''),
    };
}

function createMockEmailService() {
    return {
        sendDigitalPurchaseEmail: jest.fn().mockResolvedValue(undefined),
    };
}

function createMockStorageService() {
    return {
        getPresignedUrl: jest.fn().mockResolvedValue('http://mock-url.com/file'),
    };
}

// ============ TESTS ============

describe('PaymentsService', () => {
    let service: PaymentsService;
    let mockPrisma: ReturnType<typeof createMockPrisma>;
    let mockConfig: ReturnType<typeof createMockConfigService>;
    let mockEmail: ReturnType<typeof createMockEmailService>;
    let mockStorage: ReturnType<typeof createMockStorageService>;

    beforeEach(() => {
        mockPrisma = createMockPrisma();
        mockConfig = createMockConfigService();
        mockEmail = createMockEmailService();
        mockStorage = createMockStorageService();

        // Instanciación manual porque PaymentsService usa Scope.REQUEST
        // y NestJS no permite resolverlo con Test.createTestingModule
        const mockRequest = { tenantId: 'test-tenant', headers: {} } as any;
        service = new PaymentsService(
            mockRequest,
            mockPrisma as any,
            mockConfig as any,
            mockEmail as any,
            mockStorage as any,
        );
    });

    // ============ getMercadoPagoConfig (private, tested through public methods) ============

    describe('Configuración de MercadoPago', () => {
        it('debería obtener config de MP desde SystemSetting en DB', async () => {
            mockPrisma.client.systemSetting.findUnique.mockResolvedValue(MOCK_MP_CONFIG_SETTING);

            // verifyWebhookSignature llama getMercadoPagoConfig internamente
            await service.verifyWebhookSignature('ts=123;v1=abc', 'req-1', 'data-1');

            expect(mockPrisma.client.systemSetting.findUnique).toHaveBeenCalledWith({
                where: { key: 'MERCADOPAGO_CONFIG' },
            });
        });

        it('debería manejar config ausente (MP no configurado — admin debe configurar)', async () => {
            mockPrisma.client.systemSetting.findUnique.mockResolvedValue(null);

            // Sin config de MP, verifyWebhookSignature debería:
            // 1. Intentar fallback a env
            // 2. Si tampoco hay env, skip verification → retorna true
            const result = await service.verifyWebhookSignature('ts=123;v1=abc', 'req-1', 'data-1');
            expect(result).toBe(true); // No secret → skip verification
        });
    });

    // ============ verifyWebhookSignature ============

    describe('verifyWebhookSignature', () => {
        it('debería verificar firma HMAC válida correctamente', async () => {
            mockPrisma.client.systemSetting.findUnique.mockResolvedValue({
                key: 'MERCADOPAGO_CONFIG',
                value: MOCK_MP_CONFIG,
            });

            const dataId = 'payment-123';
            const requestId = 'req-abc';
            const ts = '1234567890';

            // Generar firma válida
            const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
            const hmac = crypto.createHmac('sha256', MOCK_MP_CONFIG.webhookSecret);
            hmac.update(manifest);
            const validSignature = hmac.digest('hex');

            const xSignature = `ts=${ts};v1=${validSignature}`;

            const result = await service.verifyWebhookSignature(xSignature, requestId, dataId);
            expect(result).toBe(true);
        });

        it('debería rechazar firma inválida', async () => {
            mockPrisma.client.systemSetting.findUnique.mockResolvedValue({
                key: 'MERCADOPAGO_CONFIG',
                value: MOCK_MP_CONFIG,
            });

            const result = await service.verifyWebhookSignature(
                'ts=123;v1=firma-falsa',
                'req-1',
                'data-1',
            );
            expect(result).toBe(false);
        });

        it('debería retornar false si falta xSignature o xRequestId o dataId', async () => {
            mockPrisma.client.systemSetting.findUnique.mockResolvedValue({
                key: 'MERCADOPAGO_CONFIG',
                value: MOCK_MP_CONFIG,
            });

            expect(await service.verifyWebhookSignature('', 'req-1', 'data-1')).toBe(false);
            expect(await service.verifyWebhookSignature('ts=1;v1=x', '', 'data-1')).toBe(false);
            expect(await service.verifyWebhookSignature('ts=1;v1=x', 'req-1', '')).toBe(false);
        });

        it('debería usar fallback a MP_WEBHOOK_SECRET del .env si DB falla', async () => {
            mockPrisma.client.systemSetting.findUnique.mockRejectedValue(new Error('DB error'));
            mockConfig.get.mockReturnValue('env-secret');

            const dataId = 'payment-123';
            const requestId = 'req-abc';
            const ts = '1234567890';

            const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
            const hmac = crypto.createHmac('sha256', 'env-secret');
            hmac.update(manifest);
            const validSignature = hmac.digest('hex');

            const result = await service.verifyWebhookSignature(
                `ts=${ts};v1=${validSignature}`,
                requestId,
                dataId,
            );
            expect(result).toBe(true);
        });
    });

    // ============ handleWebhook ============

    describe('handleWebhook', () => {
        it('debería ignorar notificaciones que no sean de tipo "payment"', async () => {
            const result = await service.handleWebhook('merchant_order', '12345');
            expect(result).toEqual({ status: 'ignored', reason: 'not a payment notification' });
        });

        it('debería retornar error si MercadoPago no está configurado', async () => {
            // initMercadoPago fallará porque no hay config
            mockPrisma.client.systemSetting.findUnique.mockResolvedValue(null);

            const result = await service.handleWebhook('payment', '12345');

            // Debería retornar error de config
            expect(result.status).toBe('error');
        });
    });

    // ============ approveOrder (private, tested through handleWebhook) ============

    describe('Flujo de aprobación de orden', () => {
        it('debería NO re-aprobar una orden ya aprobada', async () => {
            const approvedOrder = { ...MOCK_ORDER, status: 'APPROVED' };
            mockPrisma.client.order.findUnique.mockResolvedValue(approvedOrder);

            // Llamar approveOrder directamente (es private, usar as any)
            await (service as any).approveOrder('order-1', 'mp-pay-1');

            // No debería actualizar la orden
            expect(mockPrisma.client.order.update).not.toHaveBeenCalled();
        });

        it('debería NO re-aprobar una orden ya entregada', async () => {
            const deliveredOrder = { ...MOCK_ORDER, status: 'DELIVERED' };
            mockPrisma.client.order.findUnique.mockResolvedValue(deliveredOrder);

            await (service as any).approveOrder('order-1', 'mp-pay-1');

            expect(mockPrisma.client.order.update).not.toHaveBeenCalled();
        });

        it('debería aprobar orden y guardar mpPaymentId', async () => {
            mockPrisma.client.order.findUnique.mockResolvedValue(MOCK_ORDER);
            mockPrisma.client.order.update.mockResolvedValue({ ...MOCK_ORDER, status: 'APPROVED' });

            // Mock variant lookup para email digital
            mockPrisma.client.productVariant.findUnique.mockResolvedValue({
                id: 'var-1',
                product: { productType: 'PHYSICAL', slug: 'test' },
            });

            await (service as any).approveOrder('order-1', 'mp-pay-123');

            expect(mockPrisma.client.order.update).toHaveBeenCalledWith({
                where: { id: 'order-1' },
                data: {
                    status: 'APPROVED',
                    mpPaymentId: 'mp-pay-123',
                },
            });
        });

        it('debería enviar email para productos digitales al aprobar', async () => {
            mockPrisma.client.order.findUnique.mockResolvedValue(MOCK_ORDER);
            mockPrisma.client.order.update.mockResolvedValue({ ...MOCK_ORDER, status: 'APPROVED' });

            mockPrisma.client.productVariant.findUnique.mockResolvedValue({
                id: 'var-1',
                product: { productType: 'DIGITAL', slug: 'ebook-test' },
            });

            await (service as any).approveOrder('order-1', 'mp-pay-123');

            expect(mockEmail.sendDigitalPurchaseEmail).toHaveBeenCalledWith(
                'test@example.com',
                'Test User',
                'Producto Test',
                'ebook-test',
            );
        });

        it('debería NO enviar email si el producto es físico', async () => {
            mockPrisma.client.order.findUnique.mockResolvedValue(MOCK_ORDER);
            mockPrisma.client.order.update.mockResolvedValue({ ...MOCK_ORDER, status: 'APPROVED' });

            mockPrisma.client.productVariant.findUnique.mockResolvedValue({
                id: 'var-1',
                product: { productType: 'PHYSICAL', slug: 'camiseta' },
            });

            await (service as any).approveOrder('order-1', 'mp-pay-123');

            expect(mockEmail.sendDigitalPurchaseEmail).not.toHaveBeenCalled();
        });
    });

    // ============ getPaymentStats ============

    describe('getPaymentStats', () => {
        it('debería retornar estadísticas de pagos', async () => {
            mockPrisma.client.subscription.count
                .mockResolvedValueOnce(5)   // activeSubscriptions
                .mockResolvedValueOnce(2);  // pendingSubscriptions
            mockPrisma.client.purchase.count.mockResolvedValue(10);
            mockPrisma.client.subscription.findMany.mockResolvedValue([]);

            const result = await service.getPaymentStats();

            expect(result).toEqual({
                activeSubscriptions: 5,
                totalEbookPurchases: 10,
                pendingSubscriptions: 2,
                recentSubscriptions: [],
            });
        });
    });

    // ============ cancelSubscription ============

    describe('cancelSubscription', () => {
        it('debería cancelar suscripción activa del usuario', async () => {
            mockPrisma.client.subscription.findUnique.mockResolvedValue(MOCK_SUBSCRIPTION);
            mockPrisma.client.subscription.update.mockResolvedValue({
                ...MOCK_SUBSCRIPTION,
                status: 'CANCELLED',
            });

            const result = await service.cancelSubscription('user-1');

            expect(mockPrisma.client.subscription.update).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
                data: { status: 'CANCELLED' },
            });
            expect(result).toEqual({ message: 'Suscripción cancelada correctamente' });
        });
    });

    // ============ getSubscriptionStatus ============

    describe('getSubscriptionStatus', () => {
        it('debería retornar estado de suscripción del usuario', async () => {
            mockPrisma.client.subscription.findUnique.mockResolvedValue(MOCK_SUBSCRIPTION);

            const result = await service.getSubscriptionStatus('user-1');

            expect(result).toEqual(expect.objectContaining({
                hasSubscription: true,
                status: 'ACTIVE',
            }));
        });

        it('debería retornar hasSubscription=false si no tiene suscripción', async () => {
            mockPrisma.client.subscription.findUnique.mockResolvedValue(null);

            const result = await service.getSubscriptionStatus('user-1');

            expect(result).toEqual({ hasSubscription: false, status: null });
        });
    });

    // ============ Flujo Admin: pago manual (efectivo/caja) ============

    describe('assignManualSubscription (Admin configura pagos)', () => {
        it('debería crear suscripción manual para un usuario (pago en efectivo)', async () => {
            mockPrisma.client.subscription.upsert.mockResolvedValue({
                ...MOCK_SUBSCRIPTION,
                mpSubscriptionId: 'MANUAL_ASSIGNMENT',
            });

            const result = await service.assignManualSubscription('user-1', 1);

            expect(mockPrisma.client.subscription.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: 'user-1' },
                    create: expect.objectContaining({
                        userId: 'user-1',
                        status: 'ACTIVE',
                        mpSubscriptionId: 'MANUAL_ASSIGNMENT',
                    }),
                    update: expect.objectContaining({
                        status: 'ACTIVE',
                        mpSubscriptionId: 'MANUAL_ASSIGNMENT',
                    }),
                }),
            );
            expect(result).toEqual({ message: 'Suscripción asignada correctamente' });
        });

        it('debería crear suscripción con duración personalizada (meses)', async () => {
            mockPrisma.client.subscription.upsert.mockResolvedValue(MOCK_SUBSCRIPTION);

            await service.assignManualSubscription('user-1', 3);

            const upsertCall = mockPrisma.client.subscription.upsert.mock.calls[0][0];
            const createData = upsertCall.create;

            // Verificar que endDate es ~3 meses después de startDate
            const startDate = new Date(createData.startDate);
            const endDate = new Date(createData.endDate);
            const diffMonths = (endDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000);
            expect(Math.round(diffMonths)).toBe(3);
        });
    });

    // ============ hasActiveSubscription ============

    describe('hasActiveSubscription', () => {
        it('debería retornar true si el usuario tiene suscripción activa', async () => {
            mockPrisma.client.subscription.findUnique.mockResolvedValue(MOCK_SUBSCRIPTION);

            const result = await service.hasActiveSubscription('user-1');
            expect(result).toBe(true);
        });

        it('debería retornar false si el usuario NO tiene suscripción activa', async () => {
            mockPrisma.client.subscription.findUnique.mockResolvedValue(null);

            const result = await service.hasActiveSubscription('user-1');
            expect(result).toBe(false);
        });
    });
});
