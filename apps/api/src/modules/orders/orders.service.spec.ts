import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { OrdersGateway } from './orders.gateway';
import { InventoryService } from '../inventory/inventory.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderPricingService } from './services/order-pricing.service';
import { OrderValidationService } from './services/order-validation.service';
import { OrderCreatedEvent } from './events/order.events';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClsService } from 'nestjs-cls';

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
          {
            id: 'mod-1',
            name: 'Queso Extra',
            priceAdjustment: new Decimal(2),
            stock: 20,
            isAvailable: true,
          },
        ],
      },
      {
        id: 'mg-2',
        productId: 'prod-1',
        name: 'Tamaño',
        minSelect: 1,
        maxSelect: 1,
        modifiers: [
          {
            id: 'mod-3',
            name: 'Regular',
            priceAdjustment: new Decimal(0),
            stock: null,
            isAvailable: true,
          },
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
  items: [],
};

function createMockTx() {
  const tx: any = {
    order: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    productVariant: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    modifier: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    lead: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    orderDeliveryAnalytics: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    deliveryDriver: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    waCustomer: {
      upsert: jest.fn(),
    },
  };
  return tx;
}

describe('OrdersService', () => {
  let service: OrdersService;
  let mockClient: any;
  let mockTx: any;

  beforeEach(async () => {
    mockTx = createMockTx();
    mockClient = {
      ...mockTx,
      secure: {
        ...mockTx,
        $transaction: jest.fn((fn) => fn(mockTx)),
      },
      raw: mockTx,
      $transaction: jest.fn((fn) => fn(mockTx)),
      getPrometheusMetrics: jest.fn().mockResolvedValue(''),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        OrderPricingService,
        OrderValidationService,
        {
          provide: PrismaService,
          useValue: mockClient,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: ClsService,
          useValue: {
            get: jest.fn().mockReturnValue('test-tenant'),
          },
        },
        {
          provide: StorageService,
          useValue: { getSignedUrl: jest.fn() },
        },
        {
          provide: OrdersGateway,
          useValue: { emit: jest.fn() },
        },
        {
          provide: InventoryService,
          useValue: {
            deductByOrder: jest.fn().mockResolvedValue({ alerts: [] }),
            restoreByOrder: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('debería crear orden exitosamente', async () => {
      mockTx.productVariant.findUnique.mockResolvedValue(MOCK_VARIANT);
      mockTx.modifier.findUnique.mockImplementation((args: any) => {
        if (args.where.id === 'mod-3') {
          return Promise.resolve({
            ...MOCK_VARIANT.product.modifierGroups[1].modifiers[0],
            group: MOCK_VARIANT.product.modifierGroups[1],
          });
        }
        return Promise.resolve(null);
      });
      mockTx.order.create.mockResolvedValue(MOCK_ORDER);

      const dto = {
        orderType: 'DINE_IN' as any,
        tableNumber: '5',
        items: [
          {
            variantId: 'var-1',
            quantity: 1,
            modifiers: [{ modifierId: 'mod-3', quantity: 1 }],
          },
        ],
      };

      const result = await service.createOrder('user-1', dto);
      expect(result).toBeDefined();
    });
  });
});
