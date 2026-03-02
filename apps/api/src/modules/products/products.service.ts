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
    async create(data: CreateProductDto, tenantId: string) {
        // Extraemos properties transaccionales hijas
        const { sku, stock, modifierGroups, categories, variants, ...productData } = data;

        // Validar slug único en este tenant
        const existing = await this.prisma.product.findFirst({
            where: { tenantId, slug: data.slug },
        });

        if (existing) {
            throw new BadRequestException('El slug del producto ya existe');
        }

        // Transacción para crear producto + variantes + modifier groups + categorías
        return await this.prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    tenantId,
                    name: productData.name,
                    slug: productData.slug,
                    description: productData.description,
                    productType: productData.productType,
                    basePrice: productData.basePrice,
                    images: productData.images,
                    specs: productData.specs || {},
                    published: productData.published || false,
                    digitalFileUrl: productData.digitalFileUrl,
                    previewUrl: productData.previewUrl,
                    categories: categories && categories.length > 0 ? {
                        create: categories.map(categoryId => ({
                            categoryId
                        }))
                    } : undefined,
                },
            });

            // Si envían array de variantes explícitas (e.g., producto físico con colores/tallas)
            if (variants && variants.length > 0) {
                // Crear variantes enviadas inyectando el tenantId explícito
                await tx.productVariant.createMany({
                    data: variants.map((v, i) => ({
                        tenantId,
                        productId: product.id,
                        sku: v.sku || `${product.slug}-${Math.random().toString(36).substring(7)}`,
                        name: v.name || 'Standard',
                        price: v.price ?? productData.basePrice,
                        stock: v.stock ?? 0,
                        isDefault: v.isDefault ?? (i === 0),
                        attributes: v.attributes ?? undefined,
                    })),
                });
            } else {
                // Crear variante default fallback si no se manda array
                const defaultSku = sku || `${product.slug}-${Math.random().toString(36).substring(7)}`;

                await tx.productVariant.create({
                    data: {
                        tenantId,
                        productId: product.id,
                        sku: defaultSku,
                        price: productData.basePrice,
                        stock: productData.productType === ProductType.DIGITAL ? -1 : (stock || 0),
                        isDefault: true,
                        name: 'Standard',
                    },
                });
            }

            // Crear modifier groups si se envían (restaurante)
            if (modifierGroups && modifierGroups.length > 0) {
                for (const group of modifierGroups) {
                    await tx.modifierGroup.create({
                        data: {
                            tenantId,
                            productId: product.id,
                            name: group.name,
                            minSelect: group.minSelect ?? 0,
                            maxSelect: group.maxSelect ?? 1,
                            modifiers: {
                                create: group.modifiers.map((mod) => ({
                                    tenantId,
                                    name: mod.name,
                                    priceAdjustment: mod.priceAdjustment ?? 0,
                                    stock: mod.stock ?? null,
                                    isAvailable: mod.isAvailable ?? true,
                                }))
                            },
                        },
                    });
                }
            }

            // Retornar producto completo con relaciones
            return await tx.product.findFirst({
                where: { id: product.id, tenantId },
                include: {
                    variants: true,
                    ...this.modifierGroupsInclude,
                },
            });
        });
    }

    // ============ ACTUALIZAR PRODUCTO ============
    async update(id: string, data: CreateProductDto, tenantId: string) {
        const existing = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException('Producto no encontrado');
        }

        const { sku, stock, modifierGroups, ...productData } = data;

        return await this.prisma.$transaction(async (tx) => {
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
                // Cascada manual: OrderItemModifier → Modifier → ModifierGroup
                // La FK OrderItemModifier_modifierId_fkey es RESTRICT, así que
                // primero debemos desconectar las referencias de pedidos existentes.
                const existingGroups = await tx.modifierGroup.findMany({
                    where: { productId: id },
                    select: { id: true, modifiers: { select: { id: true } } },
                });

                const modifierIds = existingGroups.flatMap(g => g.modifiers.map(m => m.id));

                if (modifierIds.length > 0) {
                    // 1. Eliminar OrderItemModifier que referencian estos modifiers
                    await tx.orderItemModifier.deleteMany({
                        where: { modifierId: { in: modifierIds } },
                    });

                    // 2. Eliminar los Modifiers
                    await tx.modifier.deleteMany({
                        where: { id: { in: modifierIds } },
                    });
                }

                // 3. Eliminar los ModifierGroups (ya vacíos)
                await tx.modifierGroup.deleteMany({
                    where: { productId: id },
                });

                // Recrear si hay nuevos
                if (modifierGroups && modifierGroups.length > 0) {
                    for (const group of modifierGroups) {
                        await tx.modifierGroup.create({
                            data: {
                                tenantId,
                                productId: id,
                                name: group.name,
                                minSelect: group.minSelect ?? 0,
                                maxSelect: group.maxSelect ?? 1,
                                modifiers: {
                                    create: group.modifiers.map((mod) => ({
                                        tenantId,
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

    // ============ ACTUALIZAR DISPONIBILIDAD ============
    async updateAvailability(id: string, isAvailable: boolean, tenantId: string) {
        const existing = await this.prisma.product.findUnique({
            where: { id },
            select: { tenantId: true }
        });

        if (!existing || existing.tenantId !== tenantId) {
            throw new NotFoundException('Producto no encontrado en este tenant');
        }

        return this.prisma.product.update({
            where: { id },
            data: { isAvailable }
        });
    }

    // ============ DESCARGAS DIGITALES ============
    async getProductDownloadUrl(productId: string, userId: string) {
        // 1. Verify Active Subscription (Priority Access)
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });

        // If active subscription, allow access to all digital products (or custom logic)
        if (subscription?.status === 'ACTIVE') {
            // Pass through to download
        } else {
            // 2. Verify Purchase (if no subscription)
            const hasPurchased = await this.prisma.order.findFirst({
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
            const hasLegacyPurchase = !hasPurchased && await this.prisma.purchase.findFirst({
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
        const product = await this.prisma.product.findUnique({
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
        return await this.prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                variants: true,
                ...this.modifierGroupsInclude,
                categories: { include: { category: true } },
            },
        });
    }

    async findAllPublished(type?: ProductType, allVariants: boolean = false) {
        return await this.prisma.product.findMany({
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

    async findOnePublished(slug: string, tenantId: string) {
        const product = await this.prisma.product.findFirst({
            where: { tenantId, slug },
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
        const product = await this.prisma.product.findUnique({
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
