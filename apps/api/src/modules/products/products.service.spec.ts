import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockProduct = {
  id: 'prod-1',
  name: 'Hamburguesa Clásica',
  slug: 'hamburguesa-clasica',
  description: 'Una hamburguesa deliciosa',
  productType: 'PHYSICAL',
  basePrice: 15.99,
  images: ['https://example.com/burger.jpg'],
  published: true,
  isAvailable: true,
  specs: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockVariant = {
  id: 'var-1',
  productId: 'prod-1',
  sku: 'hamburguesa-clasica-abc123',
  price: 15.99,
  stock: 50,
  isDefault: true,
  name: 'Standard',
};

const mockModifierGroup = {
  id: 'mg-1',
  productId: 'prod-1',
  name: 'Extras',
  minSelect: 0,
  maxSelect: 3,
  modifiers: [
    {
      id: 'mod-1',
      name: 'Queso Extra',
      priceAdjustment: 2.0,
      stock: 20,
      isAvailable: true,
    },
  ],
};

const mockProductComplete = {
  ...mockProduct,
  variants: [mockVariant],
  modifierGroups: [mockModifierGroup],
};

function createMockPrismaClient() {
  const models: any = {
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    productVariant: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    modifierGroup: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    modifier: {
      deleteMany: jest.fn(),
    },
    orderItemModifier: {
      deleteMany: jest.fn(),
    },
    categoriesOnProducts: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
    },
    order: {
      findFirst: jest.fn(),
    },
    purchase: {
      findFirst: jest.fn(),
    },
  };
  return {
    secure: {
      ...models,
      $transaction: jest.fn((fn) => fn(models)),
    },
    raw: models,
    ...models,
    $transaction: jest.fn((fn) => fn(models)),
    getPrometheusMetrics: jest.fn().mockResolvedValue(''),
  };
}

describe('ProductsService', () => {
  let service: ProductsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = createMockPrismaClient();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: StorageService,
          useValue: {
            getSignedUrl: jest
              .fn()
              .mockResolvedValue('https://signed-url.com/file'),
          },
        },
        {
          provide: ClsService,
          useValue: {
            get: jest.fn().mockReturnValue('test-tenant'),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      name: 'Hamburguesa Clásica',
      slug: 'hamburguesa-clasica',
      description: 'Una hamburguesa deliciosa',
      productType: 'PHYSICAL' as any,
      basePrice: 15.99,
      images: ['https://example.com/burger.jpg'],
      published: true,
      stock: 50,
      sku: 'BURG-001',
      specs: {},
    };

    it('debería crear producto con variante default', async () => {
      mockPrisma.secure.product.findFirst.mockResolvedValue(null);
      mockPrisma.secure.product.create.mockResolvedValue(mockProduct);
      mockPrisma.secure.product.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(mockProductComplete);

      const result = await service.create(createDto);
      expect(result).toBeDefined();
      expect(mockPrisma.secure.product.create).toHaveBeenCalled();
    });
  });
});
