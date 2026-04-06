import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductType } from '@alvarosky/database';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
    private storage: StorageService,
    private cls: ClsService,
  ) {}

  /** Helper para invalizar el caché del menú de forma segura sin tenantId manual. */
  private async invalidateMenuCache() {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) return;
    const patterns = [
      `menu:${tenantId}:all:false`,
      `menu:${tenantId}:all:true`,
      `menu:${tenantId}:DIGITAL:false`,
      `menu:${tenantId}:DIGITAL:true`,
      `menu:${tenantId}:PHYSICAL:false`,
      `menu:${tenantId}:PHYSICAL:true`,
      `menu:${tenantId}:SERVICE:false`,
      `menu:${tenantId}:SERVICE:true`,
      `menu:${tenantId}:RESTAURANT:false`,
      `menu:${tenantId}:RESTAURANT:true`,
      `tenant:${tenantId}:menu_context`,
      `tenant:${tenantId}:product_catalog`,
    ];
    await Promise.all(patterns.map((key) => this.cacheManager.del(key)));
  }

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
  // ✅ tenantId es inyectado automáticamente por this.prisma
  async create(data: CreateProductDto) {
    const { sku, stock, modifierGroups, categories, variants, ...productData } =
      data;

    // Validar slug único en el contexto del tenant actual (inyectado automáticamente por .secure)
    const existing = await this.prisma.product.findFirst({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new BadRequestException('El slug del producto ya existe');
    }

    // ✅ Usamos this.prisma.$transaction para que el cliente `tx`
    // interno propague el contexto de tenant automáticamente.
    return await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          tenantId: this.cls.get('tenantId'),
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
          categories:
            categories && categories.length > 0
              ? {
                  create: categories.map((categoryId) => ({
                    categoryId,
                  })),
                }
              : undefined,
        },
      });

      // Si envían array de variantes explícitas
      if (variants && variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v, i) => ({
            tenantId: this.cls.get('tenantId'),
            productId: product.id,
            sku:
              v.sku ||
              `${product.slug}-${Math.random().toString(36).substring(7)}`,
            name: v.name || 'Standard',
            price: v.price ?? productData.basePrice,
            stock: v.stock ?? 0,
            isDefault: v.isDefault ?? i === 0,
            attributes: v.attributes ?? undefined,
          })),
        });
      } else {
        // Variante default
        const defaultSku =
          sku || `${product.slug}-${Math.random().toString(36).substring(7)}`;

        await tx.productVariant.create({
          data: {
            tenantId: this.cls.get('tenantId'),
            productId: product.id,
            sku: defaultSku,
            price: productData.basePrice,
            stock:
              productData.productType === ProductType.DIGITAL ? -1 : stock || 0,
            isDefault: true,
            name: 'Standard',
          },
        });
      }

      // Crear modifier groups si se envían (restaurante)
      if (modifierGroups && modifierGroups.length > 0) {
        await Promise.all(
          modifierGroups.map((group) =>
            tx.modifierGroup.create({
              data: {
                tenantId: this.cls.get('tenantId'),
                productId: product.id,
                name: group.name,
                minSelect: group.minSelect ?? 0,
                maxSelect: group.maxSelect ?? 1,
                modifiers: {
                  create: group.modifiers.map((mod) => ({
                    tenantId: this.cls.get('tenantId'),
                    name: mod.name,
                    priceAdjustment: mod.priceAdjustment ?? 0,
                    stock: mod.stock ?? null,
                    isAvailable: mod.isAvailable ?? true,
                  })),
                },
              },
            }),
          ),
        );
      }

      const result = await tx.product.findFirst({
        where: { id: product.id },
        include: {
          variants: true,
          ...this.modifierGroupsInclude,
        },
      });

      await this.invalidateMenuCache();
      return result;
    });
  }

  // ============ ACTUALIZAR PRODUCTO ============
  async update(id: string, data: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Producto no encontrado');
    }

    const { sku, stock, modifierGroups, categories, variants, ...productData } = data;

    return await this.prisma.$transaction(async (tx) => {
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

      // Sync Variants
      if (variants !== undefined && Array.isArray(variants)) {
        const incomingIds = variants.map((v) => v.id).filter(Boolean);
        
        // Remove variants not in payload (only if not referenced by orders yet)
        try {
          await tx.productVariant.deleteMany({
            where: {
              productId: id,
              ...(incomingIds.length > 0 ? { id: { notIn: incomingIds as string[] } } : {}),
              orderItems: { none: {} }
            }
          });
        } catch (e) {
          // Ignore if foreign key constraint or other deletion error
        }

        for (const [index, v] of variants.entries()) {
          const skuVal = v.sku || `${productData.slug || existing.slug}-${Math.random().toString(36).substring(7)}`;
          
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                name: v.name || 'Standard',
                sku: skuVal,
                price: v.price ?? productData.basePrice,
                stock: v.stock ?? 0,
                isDefault: v.isDefault ?? index === 0,
                attributes: v.attributes ?? undefined,
              }
            });
          } else {
            await tx.productVariant.create({
              data: {
                tenantId: this.cls.get('tenantId'),
                productId: id,
                name: v.name || 'Standard',
                sku: skuVal,
                price: v.price ?? productData.basePrice,
                stock: v.stock ?? 0,
                isDefault: v.isDefault ?? index === 0,
                attributes: v.attributes ?? undefined,
              }
            });
          }
        }
      }

      // Sync Categories
      if (categories !== undefined) {
        await tx.categoriesOnProducts.deleteMany({
          where: { productId: id },
        });

        if (categories && categories.length > 0) {
          await tx.categoriesOnProducts.createMany({
            data: categories.map((catId) => ({
              productId: id,
              categoryId: catId,
            })),
          });
        }
      }

      // Sync modifier groups
      if (modifierGroups !== undefined) {
        const existingGroups = await tx.modifierGroup.findMany({
          where: { productId: id },
          select: { id: true, modifiers: { select: { id: true } } },
        });

        const modifierIds = existingGroups.flatMap((g) =>
          g.modifiers.map((m) => m.id),
        );

        if (modifierIds.length > 0) {
          await tx.orderItemModifier.deleteMany({
            where: { modifierId: { in: modifierIds } },
          });
          await tx.modifier.deleteMany({
            where: { id: { in: modifierIds } },
          });
        }

        await tx.modifierGroup.deleteMany({
          where: { productId: id },
        });

        if (modifierGroups && modifierGroups.length > 0) {
          await Promise.all(
            modifierGroups.map((group) =>
              tx.modifierGroup.create({
                data: {
                  tenantId: this.cls.get('tenantId'),
                  productId: id,
                  name: group.name,
                  minSelect: group.minSelect ?? 0,
                  maxSelect: group.maxSelect ?? 1,
                  modifiers: {
                    create: group.modifiers.map((mod) => ({
                      tenantId: this.cls.get('tenantId'),
                      name: mod.name,
                      priceAdjustment: mod.priceAdjustment ?? 0,
                      stock: mod.stock ?? null,
                      isAvailable: mod.isAvailable ?? true,
                    })),
                  },
                },
              }),
            ),
          );
        }
      }

      const result = await tx.product.findUnique({
        where: { id },
        include: {
          variants: true,
          ...this.modifierGroupsInclude,
        },
      });

      await this.invalidateMenuCache();
      return result;
    });
  }

  // ============ ACTUALIZAR DISPONIBILIDAD ============
  async updateAvailability(id: string, isAvailable: boolean) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Producto no encontrado en este tenant');
    }

    const result = await this.prisma.product.update({
      where: { id },
      data: { isAvailable },
    });

    await this.invalidateMenuCache();
    return result;
  }

  // ============ DESCARGAS DIGITALES ============
  async getProductDownloadUrl(productId: string, userId: string) {
    // 1. Verificar suscripción activa
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (subscription?.status !== 'ACTIVE') {
      // 2. Verificar compra
      const hasPurchased = await this.prisma.order.findFirst({
        where: {
          userId,
          status: { in: ['APPROVED', 'DELIVERED', 'SHIPPED', 'PROCESSING'] },
          items: {
            some: {
              variant: { productId },
            },
          },
        },
      });

      // Fallback tabla Purchase deprecada
      const hasLegacyPurchase =
        !hasPurchased &&
        (await this.prisma.purchase.findFirst({
          where: { userId, status: 'approved', productId },
        }));

      if (!hasPurchased && !hasLegacyPurchase) {
        throw new ForbiddenException(
          'No tienes acceso a este producto digital. Debes comprarlo primero.',
        );
      }
    }

    // 3. Obtener URL del archivo
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { digitalFileUrl: true, productType: true },
    });

    if (!product || product.productType !== ProductType.DIGITAL) {
      throw new NotFoundException('Producto no encontrado o no es digital');
    }

    if (!product.digitalFileUrl) {
      throw new NotFoundException(
        'Este producto no tiene archivo digital asociado',
      );
    }

    // 4. Generar Signed URL
    const signedUrl = await this.storage.getSignedUrl(
      product.digitalFileUrl,
      3600,
    );
    return { downloadUrl: signedUrl };
  }

  // ============ QUERIES ============
  async getLiveStatus() {
    const tenantId = this.cls.get('tenantId');
    let resolvedBranchId = this.cls.get('branchId');
    if (!resolvedBranchId) {
      const defaultBranch = await this.prisma.branch.findFirst({
        where: { tenantId, isDefault: true },
        select: { id: true },
      });
      resolvedBranchId = defaultBranch?.id;
    }

    const products = await this.prisma.product.findMany({
      where: { 
        published: true,
        ...(resolvedBranchId ? {
          branchProducts: {
            some: {
              branchId: resolvedBranchId,
              isAvailable: true,
            }
          }
        } : {})
      },
      select: {
        id: true,
        isAvailable: true,
        variants: { select: { stock: true } },
      },
    });

    const statusMap: Record<string, { isAvailable: boolean; likes: number }> =
      {};
    for (const p of products) {
      const hasStock = p.variants.some((v) => v.stock === -1 || v.stock > 0);
      const currentlyAvailable = p.isAvailable && hasStock;
      statusMap[p.id] = { isAvailable: currentlyAvailable, likes: 0 };
    }

    return statusMap;
  }

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

  async findAllPublished(
    type?: ProductType,
    allVariants: boolean = false,
    search?: string,
    limit?: number,
  ) {
    const tenantId = this.cls.get('tenantId');
    let resolvedBranchId = this.cls.get('branchId');
    if (!resolvedBranchId) {
      const defaultBranch = await this.prisma.branch.findFirst({
        where: { tenantId, isDefault: true },
        select: { id: true },
      });
      resolvedBranchId = defaultBranch?.id;
    }

    const safeLimit = limit || 100;
    const cacheKey = `menu:${tenantId}:${resolvedBranchId || 'default'}:${type || 'all'}:${allVariants}:${search || 'none'}:${safeLimit}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const result = await this.prisma.product.findMany({
      where: {
        published: true,
        ...(type ? { productType: type } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(resolvedBranchId ? {
          branchProducts: {
            some: {
              branchId: resolvedBranchId,
              isAvailable: true,
            }
          }
        } : {})
      },
      take: safeLimit,
      orderBy: { createdAt: 'desc' },
      include: {
        variants: allVariants ? true : { where: { isDefault: true } },
        ...this.modifierGroupsInclude,
        categories: { include: { category: true } },
        ...(resolvedBranchId ? { branchProducts: { where: { branchId: resolvedBranchId } } } : {})
      },
    });

    const mappedResult = result.map(p => {
      if ((p as any).branchProducts && (p as any).branchProducts.length > 0) {
        const bp = (p as any).branchProducts[0];
        if (bp.priceOverride !== null && bp.priceOverride !== undefined) {
          p.basePrice = bp.priceOverride;
        }
        delete (p as any).branchProducts;
      }
      return p;
    });

    await this.cacheManager.set(cacheKey, mappedResult, 300_000); // 5 min TTL
    return mappedResult;
  }

  async findOnePublished(slug: string) {
    const tenantId = this.cls.get('tenantId');
    let resolvedBranchId = this.cls.get('branchId');
    if (!resolvedBranchId) {
      const defaultBranch = await this.prisma.branch.findFirst({
        where: { tenantId, isDefault: true },
        select: { id: true },
      });
      resolvedBranchId = defaultBranch?.id;
    }

    const product = await this.prisma.product.findFirst({
      where: { 
        slug,
        ...(resolvedBranchId ? {
          branchProducts: {
            some: {
              branchId: resolvedBranchId,
              isAvailable: true,
            }
          }
        } : {})
      },
      include: {
        variants: true,
        ...this.modifierGroupsInclude,
        categories: { include: { category: true } },
        ...(resolvedBranchId ? { branchProducts: { where: { branchId: resolvedBranchId } } } : {})
      },
    });

    if (!product || !product.published) {
      throw new NotFoundException('Producto no encontrado o no disponible en esta sucursal');
    }

    if ((product as any).branchProducts && (product as any).branchProducts.length > 0) {
      const bp = (product as any).branchProducts[0];
      if (bp.priceOverride !== null && bp.priceOverride !== undefined) {
        product.basePrice = bp.priceOverride;
      }
      delete (product as any).branchProducts;
    }

    return product;

    return product;
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id },
      include: {
        variants: true,
        ...this.modifierGroupsInclude,
        categories: { include: { category: true } },
      },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  // ============ ELIMINAR PRODUCTO ============
  async remove(id: string) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Producto no encontrado en este tenant');
    }

    return await this.prisma.$transaction(async (tx) => {
      const mGroups = await tx.modifierGroup.findMany({
        where: { productId: id },
        select: { id: true, modifiers: { select: { id: true } } },
      });

      const modifierIds = mGroups.flatMap((g) => g.modifiers.map((m) => m.id));

      if (modifierIds.length > 0) {
        await tx.orderItemModifier.deleteMany({
          where: { modifierId: { in: modifierIds } },
        });
      }

      await tx.categoriesOnProducts.deleteMany({ where: { productId: id } });
      await tx.modifierGroup.deleteMany({ where: { productId: id } });
      await tx.recipe.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });

      await this.invalidateMenuCache();
      return { deleted: true };
    });
  }
}
