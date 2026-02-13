import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
                        getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.com/file'),
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
            modifierGroups: [
                {
                    name: 'Extras',
                    minSelect: 0,
                    maxSelect: 3,
                    modifiers: [
                        { name: 'Queso Extra', priceAdjustment: 2.0, stock: 20, isAvailable: true },
                        { name: 'Tocino', priceAdjustment: 3.5, stock: 15, isAvailable: true },
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
                            expect.objectContaining({ name: 'Queso Extra', priceAdjustment: 2.0 }),
                            expect.objectContaining({ name: 'Tocino', priceAdjustment: 3.5 }),
                        ]),
                    },
                }),
            });

            expect(result).toEqual(mockProductComplete);
        });

        it('debería lanzar BadRequestException si el slug ya existe', async () => {
            mockClient.product.findUnique.mockResolvedValue(mockProduct);

            await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
        });

        it('debería incluir mensaje descriptivo en error de slug duplicado', async () => {
            mockClient.product.findUnique.mockResolvedValue(mockProduct);

            await expect(service.create(createDto)).rejects.toThrow('El slug del producto ya existe');
        });

        it('debería crear producto SIN modifier groups (e-commerce normal)', async () => {
            const dtoSinModifiers = { ...createDto, modifierGroups: undefined };

            mockClient.product.findUnique
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ ...mockProduct, variants: [mockVariant], modifierGroups: [] });
            mockClient.product.create.mockResolvedValue(mockProduct);
            mockClient.productVariant.create.mockResolvedValue(mockVariant);

            const result = await service.create(dtoSinModifiers);

            expect(mockClient.modifierGroup.create).not.toHaveBeenCalled();
            expect(result.modifierGroups).toEqual([]);
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
                            expect.objectContaining({ name: 'Ketchup', priceAdjustment: 0, isAvailable: true }),
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
            modifierGroups: [
                {
                    name: 'Nuevos Extras',
                    minSelect: 1,
                    maxSelect: 2,
                    modifiers: [
                        { name: 'Trufa', priceAdjustment: 5.0, stock: 10, isAvailable: true },
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

            await expect(service.update('no-existe', updateDto)).rejects.toThrow(NotFoundException);
            await expect(service.update('no-existe', updateDto)).rejects.toThrow('Producto no encontrado');
        });
    });
});
