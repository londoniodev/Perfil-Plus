import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

// ============ MOCK DATA ============

const MOCK_TENANT = {
  id: 1,
  name: 'Restaurante Demo',
  slug: 'demo',
  design: {
    logo: 'https://example.com/logo.png',
    slogan: 'El mejor sabor',
    coverVideo: 'https://example.com/cover.mp4',
  },
};

const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Hamburguesas', slug: 'hamburguesas' },
  { id: 'cat-2', name: 'Bebidas', slug: 'bebidas' },
];

const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Hamburguesa Clásica',
    description: 'Carne 150g con queso',
    slug: 'hamburguesa-clasica',
    images: ['https://example.com/burger.jpg'],
    basePrice: new Decimal(12.5),
    published: true,
    isAvailable: true,
    variants: [
      { id: 'var-1', name: 'Regular', price: new Decimal(12.5) },
      { id: 'var-2', name: 'Doble', price: new Decimal(18.0) },
    ],
    modifierGroups: [
      {
        id: 'mg-1',
        name: 'Extras',
        minSelect: 0,
        maxSelect: 3,
        modifiers: [
          {
            id: 'mod-1',
            name: 'Queso Extra',
            priceAdjustment: new Decimal(2),
            stock: 20,
          },
          {
            id: 'mod-2',
            name: 'Tocino',
            priceAdjustment: new Decimal(3.5),
            stock: null,
          },
        ],
      },
    ],
    categories: [
      { category: { id: 'cat-1', name: 'Hamburguesas', slug: 'hamburguesas' } },
    ],
    likes: [],
    comments: [],
  },
  {
    id: 'prod-2',
    name: 'Coca Cola',
    description: 'Refresco 355ml',
    slug: 'coca-cola',
    images: [],
    basePrice: new Decimal(2.5),
    published: true,
    isAvailable: true,
    variants: [{ id: 'var-3', name: 'Default', price: new Decimal(2.5) }],
    modifierGroups: [],
    categories: [
      { category: { id: 'cat-2', name: 'Bebidas', slug: 'bebidas' } },
    ],
    likes: [],
    comments: [],
  },
];

const MOCK_SYSTEM_SETTING = {
  key: 'TENANT_CONFIG',
  value: {
    social: {
      whatsapp: '+573001234567',
      instagram: 'https://instagram.com/demo',
      facebook: 'https://facebook.com/demo',
    },
  },
};

// ============ MOCK PRISMA ============

const MOCK_TENANT_ID = 'tenant-123';

function createMockPrisma() {
  const mockTenantClient = {
    category: {
      findMany: jest.fn().mockResolvedValue(MOCK_CATEGORIES),
    },
    product: {
      findMany: jest.fn().mockResolvedValue(MOCK_PRODUCTS),
    },
    systemSetting: {
      findUnique: jest.fn().mockResolvedValue(MOCK_SYSTEM_SETTING),
    },
  };

  return {
    getTenantBySlug: jest.fn(),
    getTenantClient: jest.fn().mockResolvedValue(mockTenantClient),
    _tenantClient: mockTenantClient,
    secure: {
      tenant: {
        findUnique: jest.fn().mockResolvedValue({
          id: MOCK_TENANT_ID,
          name: 'Test Tenant',
          slug: 'test-tenant',
          brandSettings: null,
        }),
      },
      category: {
        findMany: jest.fn().mockResolvedValue(MOCK_CATEGORIES),
      },
      product: {
        findMany: jest.fn().mockResolvedValue(MOCK_PRODUCTS),
      },
      systemSetting: {
        findMany: jest.fn().mockResolvedValue([MOCK_SYSTEM_SETTING]),
      },
    },
  };
}

// ============ TESTS ============

describe('RestaurantService', () => {
  let service: RestaurantService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: 'CACHE_MANAGER',
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
        { provide: ClsService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
  });

  // ============ getPublicMenu ============

  describe('getPublicMenu', () => {
    it('debería retornar menú público con productos, categorías y datos del restaurante', async () => {
      mockPrisma.getTenantBySlug.mockResolvedValue(MOCK_TENANT);

      const result = await service.getPublicMenu('demo');

      // Verifica estructura del restaurante
      expect(result.restaurant).toEqual({
        name: 'Restaurante Demo',
        slug: 'demo',
        logo: 'https://example.com/logo.png',
        slogan: 'El mejor sabor',
        coverVideo: 'https://example.com/cover.mp4',
        social: MOCK_SYSTEM_SETTING.value.social,
        phone: '+573001234567',
      });

      // Verifica categorías
      expect(result.categories).toEqual(MOCK_CATEGORIES);

      // Verifica cantidad de productos
      expect(result.products).toHaveLength(2);
    });

    it('debería transformar Decimal a number en precios', async () => {
      mockPrisma.getTenantBySlug.mockResolvedValue(MOCK_TENANT);

      const result = await service.getPublicMenu('demo');

      const product = result.products[0];
      expect(typeof product.basePrice).toBe('number');
      expect(product.basePrice).toBe(12.5);

      // Variantes
      expect(typeof product.variants[0].price).toBe('number');
      expect(product.variants[0].price).toBe(12.5);
      expect(product.variants[1].price).toBe(18.0);

      // Modificadores
      expect(typeof product.modifierGroups[0].modifiers[0].price).toBe(
        'number',
      );
      expect(product.modifierGroups[0].modifiers[0].price).toBe(2);
    });

    it('debería incluir modifierGroups con estructura correcta', async () => {
      mockPrisma.getTenantBySlug.mockResolvedValue(MOCK_TENANT);

      const result = await service.getPublicMenu('demo');

      const mg = result.products[0].modifierGroups[0];
      expect(mg).toEqual({
        id: 'mg-1',
        name: 'Extras',
        minSelect: 0,
        maxSelect: 3,
        modifiers: [
          { id: 'mod-1', name: 'Queso Extra', price: 2, maxQuantity: 20 },
          { id: 'mod-2', name: 'Tocino', price: 3.5, maxQuantity: 99 },
        ],
      });
    });

    it('debería usar maxQuantity=99 cuando stock es null', async () => {
      mockPrisma.getTenantBySlug.mockResolvedValue(MOCK_TENANT);

      const result = await service.getPublicMenu('demo');

      const tocino = result.products[0].modifierGroups[0].modifiers[1];
      expect(tocino.maxQuantity).toBe(99);
    });

    it('debería lanzar NotFoundException si el tenant no existe', async () => {
      mockPrisma.getTenantBySlug.mockResolvedValue(null);

      await expect(service.getPublicMenu('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería conectar al tenant client con el slug correcto', async () => {
      mockPrisma.getTenantBySlug.mockResolvedValue(MOCK_TENANT);

      await service.getPublicMenu('demo');

      expect(mockPrisma.getTenantClient).toHaveBeenCalledWith('demo');
    });

    it('debería filtrar solo productos publicados y disponibles', async () => {
      mockPrisma.getTenantBySlug.mockResolvedValue(MOCK_TENANT);

      await service.getPublicMenu('demo');

      expect(mockPrisma._tenantClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            published: true,
            isAvailable: true,
          },
        }),
      );
    });

    it('debería retornar valores default cuando design no tiene campos', async () => {
      const tenantSinDesign = { ...MOCK_TENANT, design: {} };
      mockPrisma.getTenantBySlug.mockResolvedValue(tenantSinDesign);

      const result = await service.getPublicMenu('demo');

      expect(result.restaurant.logo).toBeNull();
      expect(result.restaurant.slogan).toBe(
        'Bienvenido a nuestro menú digital',
      );
      expect(result.restaurant.coverVideo).toBeNull();
    });

    // ============ NUEVOS TESTS — Social Links ============

    it('debería incluir social links desde SystemSetting TENANT_CONFIG', async () => {
      mockPrisma.getTenantBySlug.mockResolvedValue(MOCK_TENANT);

      const result = await service.getPublicMenu('demo');

      expect(result.restaurant.social).toEqual({
        whatsapp: '+573001234567',
        instagram: 'https://instagram.com/demo',
        facebook: 'https://facebook.com/demo',
      });
      expect(result.restaurant.phone).toBe('+573001234567');
    });

    it('debería retornar social vacío y phone null cuando SystemSetting no existe', async () => {
      mockPrisma.getTenantBySlug.mockResolvedValue(MOCK_TENANT);
      mockPrisma._tenantClient.systemSetting.findUnique.mockResolvedValue(null);

      const result = await service.getPublicMenu('demo');

      expect(result.restaurant.social).toEqual({});
      expect(result.restaurant.phone).toBeNull();
    });

    it('debería buscar SystemSetting con key TENANT_CONFIG', async () => {
      mockPrisma.getTenantBySlug.mockResolvedValue(MOCK_TENANT);

      await service.getPublicMenu('demo');

      expect(
        mockPrisma._tenantClient.systemSetting.findUnique,
      ).toHaveBeenCalledWith({
        where: { key: 'TENANT_CONFIG' },
      });
    });

    // ============ NUEVOS TESTS — Edge Cases ============

    it('debería defaultear nombre a "Restaurant" cuando tenant.name es null', async () => {
      const tenantSinNombre = { ...MOCK_TENANT, name: null };
      mockPrisma.getTenantBySlug.mockResolvedValue(tenantSinNombre);

      const result = await service.getPublicMenu('demo');

      expect(result.restaurant.name).toBe('Restaurant');
    });

    it('debería manejar design null (no solo {})', async () => {
      const tenantDesignNull = { ...MOCK_TENANT, design: null };
      mockPrisma.getTenantBySlug.mockResolvedValue(tenantDesignNull);

      const result = await service.getPublicMenu('demo');

      expect(result.restaurant.logo).toBeNull();
      expect(result.restaurant.slogan).toBe(
        'Bienvenido a nuestro menú digital',
      );
      expect(result.restaurant.coverVideo).toBeNull();
    });

    it('debería manejar producto sin categorías (categories = [])', async () => {
      const productosSinCat = [
        {
          ...MOCK_PRODUCTS[0],
          categories: [],
        },
      ];
      mockPrisma._tenantClient.product.findMany.mockResolvedValue(
        productosSinCat,
      );
      mockPrisma.getTenantBySlug.mockResolvedValue(MOCK_TENANT);

      const result = await service.getPublicMenu('demo');

      expect(result.products[0].categories).toEqual([]);
    });

    it('debería retornar array vacío cuando no hay productos disponibles', async () => {
      mockPrisma.getTenantBySlug.mockResolvedValue(MOCK_TENANT);
      mockPrisma._tenantClient.product.findMany.mockResolvedValue([]);

      const result = await service.getPublicMenu('demo');

      expect(result.products).toEqual([]);
    });

    it('debería retornar categorías vacías cuando no hay categorías', async () => {
      mockPrisma.getTenantBySlug.mockResolvedValue(MOCK_TENANT);
      mockPrisma._tenantClient.category.findMany.mockResolvedValue([]);

      const result = await service.getPublicMenu('demo');

      expect(result.categories).toEqual([]);
    });

    it('debería manejar producto sin variantes', async () => {
      const productoSinVariantes = [
        {
          ...MOCK_PRODUCTS[0],
          variants: [],
          modifierGroups: [],
        },
      ];
      mockPrisma._tenantClient.product.findMany.mockResolvedValue(
        productoSinVariantes,
      );
      mockPrisma.getTenantBySlug.mockResolvedValue(MOCK_TENANT);

      const result = await service.getPublicMenu('demo');

      expect(result.products[0].variants).toEqual([]);
    });
  });
});
