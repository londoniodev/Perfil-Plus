import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { StorageService } from '../storage/storage.service';
import { ClsService } from 'nestjs-cls';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockPrisma: any;

  const mockSetting = {
    id: '1',
    key: 'MERCADOPAGO_CONFIG',
    value: JSON.stringify({
      accessToken: 'TEST-ACCESS-TOKEN',
      publicKey: 'TEST-PUBLIC-KEY',
    }),
  };

  beforeEach(async () => {
    const models = {
      systemSetting: {
        findFirst: jest.fn(),
      },
      order: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        create: jest.fn(),
      },
    };

    mockPrisma = {
      secure: models,
      raw: models,
      ...models,
      $transaction: jest.fn((fn) => fn(models)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('some-id'),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
            sendVerificationEmail: jest.fn(),
            sendPasswordRecoveryEmail: jest.fn(),
            sendSubscriptionSuccessEmail: jest.fn(),
            sendDigitalPurchaseEmail: jest.fn(),
            sendDigitalDelivery: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            getSignedUrl: jest.fn(),
          },
        },
        {
          provide: ClsService,
          useValue: {
            get: jest.fn().mockReturnValue('test-tenant'),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Configuración de MercadoPago', () => {
    it('debería obtener config de MP desde SystemSetting en DB', async () => {
      mockPrisma.secure.systemSetting.findFirst.mockResolvedValue(mockSetting);

      const config = await (service as any).getMercadoPagoConfig();
      expect(config).toBeDefined();
      expect(config.accessToken).toBe('TEST-ACCESS-TOKEN');
    });

    it('debería lanzar InternalServerErrorException si la config de MP está ausente', async () => {
      mockPrisma.secure.systemSetting.findFirst.mockResolvedValue(null);

      await expect((service as any).getMercadoPagoConfig()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
