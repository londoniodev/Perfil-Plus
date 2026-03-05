import { Test, TestingModule } from '@nestjs/testing';

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
      providers: [{ provide: PaymentsService, useValue: mockPaymentsService }],
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
    it('debería crear checkout de productos con MercadoPago', async () => {
      const items = [
        { variantId: 'var-1', quantity: 2 },
        { variantId: 'var-2', quantity: 1 },
      ];
      mockPaymentsService.createProductCheckout.mockResolvedValue(
        mockCheckoutResult,
      );

      const mockReq = { tenantId: 'tenant-1', headers: {} } as any;
      const dto = { items, frontUrl: 'http://localhost:3000' } as any;

      const result = await controller.createProductCheckout(mockReq, dto);

      expect(mockPaymentsService.createProductCheckout).toHaveBeenCalledWith(
        dto,
        'tenant-1',
      );
      expect(result).toEqual(mockCheckoutResult);
    });
  });

  // ============ POST /payments/webhook ============

  describe('handleWebhook', () => {
    it('debería verificar firma y procesar webhook de pago aprobado', async () => {
      mockPaymentsService.verifyWebhookSignature.mockResolvedValue(true);
      mockPaymentsService.handleWebhook.mockResolvedValue({
        status: 'processed',
      });

      const body = {
        type: 'payment',
        data: { id: '12345' },
      };

      const result = await controller.handleWebhook(
        body,
        'ts=1;v1=abc',
        'req-1',
      );

      expect(mockPaymentsService.verifyWebhookSignature).toHaveBeenCalledWith(
        'ts=1;v1=abc',
        'req-1',
        '12345',
      );
      expect(mockPaymentsService.handleWebhook).toHaveBeenCalledWith(
        'payment',
        '12345',
      );
      expect(result).toEqual({ status: 'processed' });
    });

    it('debería rechazar webhook con firma inválida', async () => {
      mockPaymentsService.verifyWebhookSignature.mockResolvedValue(false);

      const body = {
        type: 'payment',
        data: { id: '12345' },
      };

      const result = await controller.handleWebhook(
        body,
        'ts=1;v1=FALSA',
        'req-1',
      );

      expect(result).toEqual({ status: 'error', reason: 'invalid signature' });
      expect(mockPaymentsService.handleWebhook).not.toHaveBeenCalled();
    });

    it('debería ignorar webhook sin type o data.id', async () => {
      mockPaymentsService.verifyWebhookSignature.mockResolvedValue(true);

      const body = {}; // sin type ni data

      const result = await controller.handleWebhook(
        body,
        'ts=1;v1=abc',
        'req-1',
      );

      expect(result).toEqual({
        status: 'ignored',
        reason: 'missing type or data.id',
      });
    });

    it('debería manejar formato alternativo de webhook (topic + id)', async () => {
      mockPaymentsService.verifyWebhookSignature.mockResolvedValue(true);
      mockPaymentsService.handleWebhook.mockResolvedValue({
        status: 'processed',
      });

      const body = {
        topic: 'payment',
        id: '67890',
      };

      const result = await controller.handleWebhook(
        body,
        'ts=1;v1=abc',
        'req-1',
      );

      expect(mockPaymentsService.handleWebhook).toHaveBeenCalledWith(
        'payment',
        '67890',
      );
    });
  });

  // ============ GET /payments/admin/stats ============

  describe('getPaymentStats', () => {
    it('debería retornar estadísticas de pagos (admin only)', async () => {
      mockPaymentsService.getPaymentStats.mockResolvedValue(mockPaymentStats);

      const result = await controller.getPaymentStats();

      expect(mockPaymentsService.getPaymentStats).toHaveBeenCalled();
      expect(result).toEqual(mockPaymentStats);
    });
  });
});
