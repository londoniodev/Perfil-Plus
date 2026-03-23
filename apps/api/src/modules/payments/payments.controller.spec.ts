import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Mock dependencies ANTES de importar los módulos de pagos
jest.mock('../email/email.service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendDigitalPurchaseEmail: jest.fn().mockResolvedValue(true),
    sendSubscriptionSuccessEmail: jest.fn().mockResolvedValue(true),
  })),
}));

jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn(),
  Preference: jest.fn(),
  Payment: jest.fn(),
}));

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

// ============ MOCK DATA ============

const mockCheckoutResult = {
  init_point: 'https://www.mercadopago.com/checkout/v1/redirect?pref_id=123',
  preferenceId: 'pref-123',
};

const mockSubscriptionStatus = {
  id: 'sub-1',
  status: 'ACTIVE',
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
};

const mockPaymentStats = {
  activeSubscriptions: 5,
  totalEbookPurchases: 10,
  pendingSubscriptions: 2,
  recentSubscriptions: [],
};

// ============ MOCK SERVICE ============

const mockPaymentsService = {
  createSubscriptionCheckout: jest.fn(),
  getSubscriptionStatus: jest.fn(),
  cancelSubscription: jest.fn(),
  createProductCheckout: jest.fn(),
  verifyWebhookSignature: jest.fn(),
  handleWebhook: jest.fn(),
  getPaymentStats: jest.fn(),
};

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

// ============ TESTS ============

describe('PaymentsController', () => {
  let controller: PaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: mockPaymentsService },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        {
          provide: PrismaService,
          useValue: {
            secure: {
              user: {
                findFirst: jest.fn(),
              },
            },
            raw: {},
            getPrometheusMetrics: jest.fn().mockResolvedValue(''),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<PaymentsController>(PaymentsController);
    jest.clearAllMocks();
  });

  // ============ POST /payments/subscription/checkout ============

  describe('createSubscriptionCheckout', () => {
    it('debería crear checkout de suscripción con MercadoPago', async () => {
      mockPaymentsService.createSubscriptionCheckout.mockResolvedValue(
        mockCheckoutResult,
      );

      const result = await controller.createSubscriptionCheckout('user-1', {
        email: 'user@test.com',
        frontUrl: 'http://localhost:3000',
      });

      expect(
        mockPaymentsService.createSubscriptionCheckout,
      ).toHaveBeenCalledWith(
        'user-1',
        'user@test.com',
        'http://localhost:3000',
      );
      expect(result).toEqual(mockCheckoutResult);
    });
  });

  // ============ GET /payments/subscription/status ============

  describe('getSubscriptionStatus', () => {
    it('debería retornar estado de suscripción del usuario', async () => {
      mockPaymentsService.getSubscriptionStatus.mockResolvedValue(
        mockSubscriptionStatus,
      );

      const result = await controller.getSubscriptionStatus('user-1');

      expect(mockPaymentsService.getSubscriptionStatus).toHaveBeenCalledWith(
        'user-1',
      );
      expect(result).toEqual(mockSubscriptionStatus);
    });
  });

  // ============ DELETE /payments/subscription ============

  describe('cancelSubscription', () => {
    it('debería cancelar suscripción del usuario', async () => {
      mockPaymentsService.cancelSubscription.mockResolvedValue({
        status: 'CANCELLED',
      });

      const result = await controller.cancelSubscription('user-1');

      expect(mockPaymentsService.cancelSubscription).toHaveBeenCalledWith(
        'user-1',
      );
    });
  });

  // ============ POST /payments/product/checkout ============

  describe('createProductCheckout', () => {
    it('debería crear checkout de producto', async () => {
      mockPaymentsService.createProductCheckout.mockResolvedValue(
        mockCheckoutResult,
      );

      const result = await controller.createProductCheckout(
        { tenantId: 'test-tenant' } as any,
        { productId: 'prod-1', email: 'test@test.com', frontUrl: 'url' },
      );

      expect(mockPaymentsService.createProductCheckout).toHaveBeenCalled();
      expect(result).toEqual(mockCheckoutResult);
    });
  });

  // ============ POST /payments/webhook ============

  describe('handleWebhook', () => {
    it('debería procesar webhook válido', async () => {
      mockPaymentsService.verifyWebhookSignature.mockResolvedValue(true);

      const result = await controller.handleWebhook(
        { type: 'payment', data: { id: '123' } },
        'sig-123',
        'req-123',
        'tenant-1',
      );

      expect(result.status).toBe('received');
    });

    it('debería rechazar firma inválida', async () => {
      mockPaymentsService.verifyWebhookSignature.mockResolvedValue(false);

      const result = await controller.handleWebhook(
        { type: 'payment', data: { id: '123' } },
        'invalid',
        'req-123',
        'tenant-1',
      );

      expect(result.status).toBe('error');
      expect(result.reason).toBe('invalid signature');
    });
  });

  // ============ GET /payments/admin/stats ============

  describe('getPaymentStats', () => {
    it('debería retornar estadísticas para ADMIN', async () => {
      mockPaymentsService.getPaymentStats.mockResolvedValue(mockPaymentStats);

      const result = await controller.getPaymentStats();

      expect(mockPaymentsService.getPaymentStats).toHaveBeenCalled();
      expect(result).toEqual(mockPaymentStats);
    });
  });
});
