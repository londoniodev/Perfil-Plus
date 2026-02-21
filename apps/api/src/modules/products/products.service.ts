import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductType } from '@prisma/client';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(
        private prisma: PrismaService,
        private storage: StorageService
    ) { }

    // ============ INCLUDES REUTILIZABLES ============
    private readonly modifierGroupsInclude = {
        modifierGroups: {
            include: {
                modifiers: {
                    orderBy: { createdAt: 'asc' as const },
                },
            },
            orderBy: { createdAt: 'asc' as const },
        },
    };

    // ============ CREAR PRODUCTO ============
    async create(data: CreateProductDto) {
        const { sku, stock, modifierGroups, ...productData } = data;

        // Validar slug único
        const existing = await this.prisma.client.product.findUnique({
            where: { slug: data.slug },
        });

        if (existing) {
            throw new BadRequestException('El slug del producto ya existe');
        }

        // Transacción para crear producto + variante default + modifier groups
        return await this.prisma.client.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    name: productData.name,
                    slug: productData.slug,
                    description: productData.description,
                    productType: productData.productType,
                    basePrice: productData.basePrice,
                    images: productData.images,
                    specs: productData.specs || {},
                    published: productData.published || false,
                    // Digital fields
                    digitalFileUrl: productData.digitalFileUrl,
                    previewUrl: productData.previewUrl,
                },
            });

            // Crear variante default
            const defaultSku = sku || `${product.slug}-${Math.random().toString(36).substring(7)}`;

            await tx.productVariant.create({
                data: {
                    productId: product.id,
                    sku: defaultSku,
                    price: productData.basePrice,
                    stock: productData.productType === ProductType.DIGITAL ? -1 : (stock || 0),
                    isDefault: true,
                    name: 'Standard',
                },
            });

            // Crear modifier groups si se envían (restaurante)
            if (modifierGroups && modifierGroups.length > 0) {
                for (const group of modifierGroups) {
                    await tx.modifierGroup.create({
                        data: {
                            productId: product.id,
                            name: group.name,
                            minSelect: group.minSelect ?? 0,
                            maxSelect: group.maxSelect ?? 1,
                            modifiers: {
                                create: group.modifiers.map((mod) => ({
                                    name: mod.name,
                                    priceAdjustment: mod.priceAdjustment ?? 0,
                                    stock: mod.stock ?? null,
                                    isAvailable: mod.isAvailable ?? true,
                                })),
                            },
                        },
                    });
                }
            }

            // Retornar producto completo con relaciones
            return await tx.product.findUnique({
                where: { id: product.id },
                include: {
                    variants: true,
                    ...this.modifierGroupsInclude,
                },
            });
        });
    }

    // ============ ACTUALIZAR PRODUCTO ============
    async update(id: string, data: CreateProductDto) {
        const existing = await this.prisma.client.product.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException('Producto no encontrado');
        }

        const { sku, stock, modifierGroups, ...productData } = data;

        return await this.prisma.client.$transaction(async (tx) => {
            // Actualizar producto base
            await tx.product.update({
                where: { id },
                data: {
                    name: productData.name,
                    slug: productData.slug,
                    description: productData.description,
                    productType: productData.productType,
                    basePrice: productData.basePrice,
                    images: productData.images,
                    specs: productData.specs || {},
                    published: productData.published,
                    digitalFileUrl: productData.digitalFileUrl,
                    previewUrl: productData.previewUrl,
                },
            });

            // Sync modifier groups: borrar existentes y recrear (replace strategy)
            if (modifierGroups !== undefined) {
                // Borrar todos los grupos existentes (cascade borra modifiers)
                await tx.modifierGroup.deleteMany({
                    where: { productId: id },
                });

                // Recrear si hay nuevos
                if (modifierGroups && modifierGroups.length > 0) {
                    for (const group of modifierGroups) {
                        await tx.modifierGroup.create({
                            data: {
                                productId: id,
                                name: group.name,
                                minSelect: group.minSelect ?? 0,
                                maxSelect: group.maxSelect ?? 1,
                                modifiers: {
                                    create: group.modifiers.map((mod) => ({
                                        name: mod.name,
                                        priceAdjustment: mod.priceAdjustment ?? 0,
                                        stock: mod.stock ?? null,
                                        isAvailable: mod.isAvailable ?? true,
                                    })),
                                },
                            },
                        });
                    }
                }
            }

            return await tx.product.findUnique({
                where: { id },
                include: {
                    variants: true,
                    ...this.modifierGroupsInclude,
                },
            });
        });
    }

    // ============ DESCARGAS DIGITALES ============
    async getProductDownloadUrl(productId: string, userId: string) {
        // 1. Verify Active Subscription (Priority Access)
        const subscription = await this.prisma.client.subscription.findUnique({
            where: { userId },
        });

        // If active subscription, allow access to all digital products (or custom logic)
        if (subscription?.status === 'ACTIVE') {
            // Pass through to download
        } else {
            // 2. Verify Purchase (if no subscription)
            const hasPurchased = await this.prisma.client.order.findFirst({
                where: {
                    userId,
                    status: { in: ['APPROVED', 'DELIVERED', 'SHIPPED', 'PROCESSING'] },
                    items: {
                        some: {
                            variant: { productId }
                        }
                    }
                }
            });

            // Check deprecated Purchase table as fallback (for migration compatibility)
            const hasLegacyPurchase = !hasPurchased && await this.prisma.client.purchase.findFirst({
                where: {
                    userId,
                    status: 'approved',
                    productId
                }
            });

            if (!hasPurchased && !hasLegacyPurchase) {
                throw new ForbiddenException('No tienes acceso a este producto digital. Debes comprarlo primero.');
            }
        }

        // 3. Get Product File URL
        const product = await this.prisma.client.product.findUnique({
            where: { id: productId },
            select: { digitalFileUrl: true, productType: true }
        });

        if (!product || product.productType !== ProductType.DIGITAL) {
            throw new NotFoundException('Producto no encontrado o no es digital');
        }

        if (!product.digitalFileUrl) {
            throw new NotFoundException('Este producto no tiene archivo digital asociado');
        }

        // 4. Generate Signed URL
        const signedUrl = await this.storage.getSignedUrl(product.digitalFileUrl, 3600);
        return { downloadUrl: signedUrl };
    }

    // ============ QUERIES ============
    async findAllAdmin() {
        return await this.prisma.client.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                variants: true,
                ...this.modifierGroupsInclude,
                categories: { include: { category: true } },
            },
        });
    }

    async findAllPublished(type?: ProductType, allVariants: boolean = false) {
        return await this.prisma.client.product.findMany({
            where: {
                published: true,
                ...(type ? { productType: type } : {}),
            },
            orderBy: { createdAt: 'desc' },
            include: {
                variants: allVariants ? true : {
                    where: { isDefault: true }
                },
                ...this.modifierGroupsInclude,
                categories: { include: { category: true } },
            },
        });
    }

    async findOnePublished(slug: string) {
        const product = await this.prisma.client.product.findUnique({
            where: { slug },
            include: {
                variants: true,
                ...this.modifierGroupsInclude,
            },
        });

        if (!product || !product.published) {
            throw new NotFoundException('Producto no encontrado');
        }

        return product;
    }

    async findOne(id: string) {
        const product = await this.prisma.client.product.findUnique({
            where: { id },
            include: {
                variants: true,
                ...this.modifierGroupsInclude,
            },
        });
        if (!product) throw new NotFoundException('Producto no encontrado');
        return product;
    }
}
