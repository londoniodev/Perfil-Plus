import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { ClsService } from 'nestjs-cls';

// ============ MOCK FACTORIES ============

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
    {
      id: 'mod-2',
      name: 'Tocino',
      priceAdjustment: 3.5,
      stock: 15,
      isAvailable: true,
    },
  ],
};

const mockProductComplete = {
  ...mockProduct,
  variants: [mockVariant],
  modifierGroups: [mockModifierGroup],
};

/**
 * Crea un mock de PrismaClient con $transaction que ejecuta el callback
 * pasándole el mismo mock (simula transacción de Prisma).
 */
function createMockPrismaClient() {
  const client: any = {
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    productVariant: {
      create: jest.fn(),
    },
    modifierGroup: {
      create: jest.fn(),
      deleteMany: jest.fn(),
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
    $transaction: jest.fn((fn) => fn(client)),
  };
  return client;
}

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;
  let mockClient: ReturnType<typeof createMockPrismaClient>;

  beforeEach(async () => {
    mockClient = createMockPrismaClient();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            client: mockClient,
          },
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
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  // ============ CREAR PRODUCTO ============

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
      modifierGroups: [
        {
          name: 'Extras',
          minSelect: 0,
          maxSelect: 3,
          modifiers: [
            {
              name: 'Queso Extra',
              priceAdjustment: 2.0,
              stock: 20,
              isAvailable: true,
            },
            {
              name: 'Tocino',
              priceAdjustment: 3.5,
              stock: 15,
              isAvailable: true,
            },
          ],
        },
      ],
    };

    it('debería crear producto con modifier groups y variante default', async () => {
      mockClient.product.findUnique
        .mockResolvedValueOnce(null) // slug check
        .mockResolvedValueOnce(mockProductComplete); // final findUnique
      mockClient.product.create.mockResolvedValue(mockProduct);
      mockClient.productVariant.create.mockResolvedValue(mockVariant);
      mockClient.modifierGroup.create.mockResolvedValue(mockModifierGroup);

      const result = await service.create(createDto);

      // Verifica que se buscó slug duplicado
      expect(mockClient.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'hamburguesa-clasica' },
      });

      // Verifica que se creó producto
      expect(mockClient.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Hamburguesa Clásica',
          slug: 'hamburguesa-clasica',
          basePrice: 15.99,
        }),
      });

      // Verifica variante default
      expect(mockClient.productVariant.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sku: 'BURG-001',
          price: 15.99,
          stock: 50,
          isDefault: true,
          name: 'Standard',
        }),
      });

      // Verifica modifier group creado
      expect(mockClient.modifierGroup.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Extras',
          minSelect: 0,
          maxSelect: 3,
          modifiers: {
            create: expect.arrayContaining([
              expect.objectContaining({
                name: 'Queso Extra',
                priceAdjustment: 2.0,
              }),
              expect.objectContaining({ name: 'Tocino', priceAdjustment: 3.5 }),
            ]),
          },
        }),
      });

      expect(result).toEqual(mockProductComplete);
    });

    it('debería lanzar BadRequestException si el slug ya existe', async () => {
      mockClient.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería incluir mensaje descriptivo en error de slug duplicado', async () => {
      mockClient.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.create(createDto)).rejects.toThrow(
        'El slug del producto ya existe',
      );
    });

    it('debería crear producto SIN modifier groups (e-commerce normal)', async () => {
      const dtoSinModifiers = { ...createDto, modifierGroups: undefined };

      mockClient.product.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          ...mockProduct,
          variants: [mockVariant],
          modifierGroups: [],
        });
      mockClient.product.create.mockResolvedValue(mockProduct);
      mockClient.productVariant.create.mockResolvedValue(mockVariant);

      const result = await service.create(dtoSinModifiers);

      expect(mockClient.modifierGroup.create).not.toHaveBeenCalled();
      expect(result!.modifierGroups).toEqual([]);
    });

    it('debería usar defaults para minSelect (0) y maxSelect (1) si no se envían', async () => {
      const dtoDefaults = {
        ...createDto,
        modifierGroups: [
          {
            name: 'Salsas',
            modifiers: [{ name: 'Ketchup' }, { name: 'Mostaza' }],
          },
        ],
      };

      mockClient.product.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockProductComplete);
      mockClient.product.create.mockResolvedValue(mockProduct);
      mockClient.productVariant.create.mockResolvedValue(mockVariant);
      mockClient.modifierGroup.create.mockResolvedValue({});

      await service.create(dtoDefaults);

      expect(mockClient.modifierGroup.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          minSelect: 0,
          maxSelect: 1,
          modifiers: {
            create: expect.arrayContaining([
              expect.objectContaining({
                name: 'Ketchup',
                priceAdjustment: 0,
                isAvailable: true,
              }),
            ]),
          },
        }),
      });
    });
  });

  // ============ ACTUALIZAR PRODUCTO ============

  describe('update', () => {
    const updateDto = {
      name: 'Hamburguesa Premium',
      slug: 'hamburguesa-premium',
      description: 'Versión premium',
      productType: 'PHYSICAL' as any,
      basePrice: 22.99,
      images: ['https://example.com/burger-premium.jpg'],
      published: true,
      specs: {},
      modifierGroups: [
        {
          name: 'Nuevos Extras',
          minSelect: 1,
          maxSelect: 2,
          modifiers: [
            {
              name: 'Trufa',
              priceAdjustment: 5.0,
              stock: 10,
              isAvailable: true,
            },
          ],
        },
      ],
    };

    it('debería actualizar producto y reemplazar modifier groups (replace strategy)', async () => {
      mockClient.product.findUnique
        .mockResolvedValueOnce(mockProduct) // exists check
        .mockResolvedValueOnce(mockProductComplete); // final find
      mockClient.product.update.mockResolvedValue(mockProduct);
      mockClient.modifierGroup.deleteMany.mockResolvedValue({ count: 1 });
      mockClient.modifierGroup.create.mockResolvedValue({});

      const result = await service.update('prod-1', updateDto);

      // Verifica que se borraron los modifier groups existentes
      expect(mockClient.modifierGroup.deleteMany).toHaveBeenCalledWith({
        where: { productId: 'prod-1' },
      });

      // Verifica que se crearon los nuevos
      expect(mockClient.modifierGroup.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productId: 'prod-1',
          name: 'Nuevos Extras',
          minSelect: 1,
          maxSelect: 2,
        }),
      });
    });

    it('debería lanzar NotFoundException si el producto no existe', async () => {
      mockClient.product.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('no-existe', updateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update('no-existe', updateDto),
      ).rejects.toThrow('Producto no encontrado');
    });
  });

  // ============ QUERIES ============

  describe('findAllAdmin', () => {
    it('debería retornar todos los productos con includes ordenados por createdAt desc', async () => {
      const products = [
        mockProductComplete,
        { ...mockProductComplete, id: 'prod-2', name: 'Otro' },
      ];
      mockClient.product.findMany.mockResolvedValue(products);

      const result = await service.findAllAdmin();

      expect(result).toEqual(products);
      expect(mockClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
          include: expect.objectContaining({
            variants: true,
            categories: { include: { category: true } },
          }),
        }),
      );
    });

    it('debería retornar array vacío cuando no hay productos', async () => {
      mockClient.product.findMany.mockResolvedValue([]);

      const result = await service.findAllAdmin();

      expect(result).toEqual([]);
    });
  });

  describe('findAllPublished', () => {
    it('debería filtrar por published=true sin filtro de tipo', async () => {
      mockClient.product.findMany.mockResolvedValue([mockProductComplete]);

      await service.findAllPublished();

      expect(mockClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { published: true },
        }),
      );
    });

    it('debería filtrar por tipo cuando se pasa type', async () => {
      mockClient.product.findMany.mockResolvedValue([]);

      await service.findAllPublished('DIGITAL' as any);

      expect(mockClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { published: true, productType: 'DIGITAL' },
        }),
      );
    });

    it('debería incluir solo variantes default cuando allVariants=false', async () => {
      mockClient.product.findMany.mockResolvedValue([]);

      await service.findAllPublished(undefined, false);

      expect(mockClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            variants: { where: { isDefault: true } },
          }),
        }),
      );
    });

    it('debería incluir todas las variantes cuando allVariants=true', async () => {
      mockClient.product.findMany.mockResolvedValue([]);

      await service.findAllPublished(undefined, true);

      expect(mockClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            variants: true,
          }),
        }),
      );
    });
  });

  describe('findOnePublished', () => {
    it('debería retornar producto publicado por slug', async () => {
      mockClient.product.findUnique.mockResolvedValue(mockProductComplete);

      const result = await service.findOnePublished(
        'hamburguesa-clasica',
      );

      expect(result).toEqual(mockProductComplete);
      expect(mockClient.product.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'hamburguesa-clasica' },
        }),
      );
    });

    it('debería lanzar NotFoundException si el producto no existe', async () => {
      mockClient.product.findUnique.mockResolvedValue(null);

      await expect(
        service.findOnePublished('no-existe'),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar NotFoundException si el producto no está publicado', async () => {
      mockClient.product.findUnique.mockResolvedValue({
        ...mockProductComplete,
        published: false,
      });

      await expect(
        service.findOnePublished('hamburguesa-clasica'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('debería retornar producto por id con variantes y modifierGroups', async () => {
      mockClient.product.findUnique.mockResolvedValue(mockProductComplete);

      const result = await service.findOne('prod-1');

      expect(result).toEqual(mockProductComplete);
      expect(mockClient.product.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
          include: expect.objectContaining({
            variants: true,
          }),
        }),
      );
    });

    it('debería lanzar NotFoundException si el producto no existe', async () => {
      mockClient.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('no-existe')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('no-existe')).rejects.toThrow(
        'Producto no encontrado',
      );
    });
  });

  // ============ DESCARGAS DIGITALES ============

  describe('getProductDownloadUrl', () => {
    const digitalProduct = {
      digitalFileUrl: 'uploads/ebook.pdf',
      productType: 'DIGITAL',
    };

    it('debería permitir descarga con suscripción activa (sin verificar compra)', async () => {
      mockClient.subscription.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        userId: 'user-1',
      });
      mockClient.product.findUnique.mockResolvedValue(digitalProduct);

      const result = await service.getProductDownloadUrl('prod-1', 'user-1');

      expect(result).toEqual({ downloadUrl: 'https://signed-url.com/file' });
      // No debería consultar orders ni purchases
      expect(mockClient.order.findFirst).not.toHaveBeenCalled();
      expect(mockClient.purchase.findFirst).not.toHaveBeenCalled();
    });

    it('debería permitir descarga con compra válida (Order)', async () => {
      mockClient.subscription.findUnique.mockResolvedValue(null); // sin suscripción
      mockClient.order.findFirst.mockResolvedValue({ id: 'order-1' }); // compra via Order
      mockClient.product.findUnique.mockResolvedValue(digitalProduct);

      const result = await service.getProductDownloadUrl('prod-1', 'user-1');

      expect(result).toEqual({ downloadUrl: 'https://signed-url.com/file' });
      expect(mockClient.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            status: { in: ['APPROVED', 'DELIVERED', 'SHIPPED', 'PROCESSING'] },
          }),
        }),
      );
    });

    it('debería permitir descarga con compra legacy (Purchase table)', async () => {
      mockClient.subscription.findUnique.mockResolvedValue(null);
      mockClient.order.findFirst.mockResolvedValue(null); // sin Order
      mockClient.purchase.findFirst.mockResolvedValue({
        id: 'purchase-1',
        status: 'approved',
      }); // legacy
      mockClient.product.findUnique.mockResolvedValue(digitalProduct);

      const result = await service.getProductDownloadUrl('prod-1', 'user-1');

      expect(result).toEqual({ downloadUrl: 'https://signed-url.com/file' });
      expect(mockClient.purchase.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', status: 'approved', productId: 'prod-1' },
        }),
      );
    });

    it('debería lanzar ForbiddenException si no tiene acceso (sin suscripción, sin compra)', async () => {
      mockClient.subscription.findUnique.mockResolvedValue(null);
      mockClient.order.findFirst.mockResolvedValue(null);
      mockClient.purchase.findFirst.mockResolvedValue(null);

      await expect(
        service.getProductDownloadUrl('prod-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar NotFoundException si producto no es DIGITAL', async () => {
      mockClient.subscription.findUnique.mockResolvedValue({
        status: 'ACTIVE',
      });
      mockClient.product.findUnique.mockResolvedValue({
        digitalFileUrl: null,
        productType: 'PHYSICAL',
      });

      await expect(
        service.getProductDownloadUrl('prod-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar NotFoundException si producto digital no tiene archivo', async () => {
      mockClient.subscription.findUnique.mockResolvedValue({
        status: 'ACTIVE',
      });
      mockClient.product.findUnique.mockResolvedValue({
        digitalFileUrl: null,
        productType: 'DIGITAL',
      });

      await expect(
        service.getProductDownloadUrl('prod-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería generar signed URL con expiración de 3600 segundos', async () => {
      mockClient.subscription.findUnique.mockResolvedValue({
        status: 'ACTIVE',
      });
      mockClient.product.findUnique.mockResolvedValue(digitalProduct);

      await service.getProductDownloadUrl('prod-1', 'user-1');

      const mockStorage = (service as any).storage;
      expect(mockStorage.getSignedUrl).toHaveBeenCalledWith(
        'uploads/ebook.pdf',
        3600,
      );
    });

    it('debería NO permitir acceso con suscripción inactiva', async () => {
      mockClient.subscription.findUnique.mockResolvedValue({
        status: 'CANCELLED',
      });
      mockClient.order.findFirst.mockResolvedValue(null);
      mockClient.purchase.findFirst.mockResolvedValue(null);

      await expect(
        service.getProductDownloadUrl('prod-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
