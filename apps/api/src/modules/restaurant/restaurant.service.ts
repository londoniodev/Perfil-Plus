import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RestaurantService {
    constructor(
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    private async getTenantIdBySlug(slug: string): Promise<string> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug },
            select: { id: true },
        });
        if (!tenant) {
            throw new NotFoundException('Restaurant not found');
        }
        return tenant.id;
    }

    async getPublicMenu(slugOrId: string) {
        // 0. Check Cache
        const cacheKey = `public_menu:${slugOrId}`;

        // 1. Find Tenant (Polymorphic: ID or Slug)
        let tenant = null;

        // Try lookup by ID first (likely coming from Edge Proxy via custom domain)
        try {
            tenant = await this.prisma.tenant.findUnique({
                where: { id: slugOrId }
            });
        } catch (e) {
            // Probably not a valid UUID, ignore and try slug
        }

        // Fallback to Slug lookup
        if (!tenant) {
            tenant = await this.prisma.tenant.findUnique({
                where: { slug: slugOrId },
            });
        }

        if (!tenant) {
            throw new NotFoundException('Restaurant not found');
        }

        const tenantId = tenant.id;

        // 2. Find Categories (filtered by tenant via products)
        const categories = await this.prisma.category.findMany({
            where: {
                tenantId,
                products: {
                    some: {
                        product: {
                            published: true,
                            isAvailable: true
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                slug: true,
            },
            orderBy: { name: 'asc' },
        });

        // 3. Find Products
        const products = await this.prisma.product.findMany({
            where: {
                tenantId,
                published: true,
                isAvailable: true,
            },
            include: {
                variants: true,
                modifierGroups: {
                    include: {
                        modifiers: true
                    }
                },
                categories: {
                    include: { category: true }
                },
                likes: true,
                comments: true
            },
        });

        // 4. Fetch Tenant Config (SystemSetting)
        const systemSetting = await this.prisma.systemSetting.findFirst({
            where: { tenantId, key: 'TENANT_CONFIG' }
        });

        const tenantConfig = systemSetting?.value as any || {};
        const contact = tenantConfig.contact || {};

        // 5. Transform Data for Public SDK
        const publicProducts = products.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            slug: product.slug,
            images: product.images,
            basePrice: Number(product.basePrice),
            categories: product.categories.map(c => ({
                id: c.category.id,
                name: c.category.name,
                slug: c.category.slug,
            })),
            variants: product.variants.map(v => ({
                id: v.id,
                name: v.name,
                price: Number(v.price)
            })),
            modifierGroups: product.modifierGroups.map(mg => ({
                id: mg.id,
                name: mg.name,
                minSelect: mg.minSelect,
                maxSelect: mg.maxSelect,
                modifiers: mg.modifiers.map(m => ({
                    id: m.id,
                    name: m.name,
                    price: Number(m.priceAdjustment),
                    maxQuantity: m.stock ?? 99
                }))
            })),
            // Social Features
            likesCount: product.likes.length,
            comments: product.comments.map(c => ({
                id: c.id,
                userName: c.userName || "Anónimo",
                content: c.content,
                createdAt: c.createdAt,
            })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }));

        // 6. Build Response
        const response = {
            restaurant: {
                name: tenant.name || "Restaurant",
                slug: tenant.slug,
                logo: tenantConfig.menu?.logo || (tenant.design as any)?.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${tenant.name}`,
                slogan: tenantConfig.menu?.slogan || (tenant.design as any)?.slogan || "Bienvenido a nuestro menú digital",
                coverVideo: (tenant.design as any)?.coverVideo || null,
                social: {
                    instagram: contact.instagram ? `https://instagram.com/${contact.instagram.replace('@', '')}` : undefined,
                    facebook: contact.facebook ? (contact.facebook.startsWith('http') ? contact.facebook : `https://facebook.com/${contact.facebook}`) : undefined,
                    whatsapp: contact.whatsapp,
                    twitter: contact.twitter ? `https://x.com/${contact.twitter.replace('@', '')}` : undefined,
                    tiktok: contact.tiktok ? `https://tiktok.com/@${contact.tiktok.replace('@', '')}` : undefined,
                    youtube: contact.youtube ? `https://youtube.com/${contact.youtube}` : undefined,
                },
                address: contact.address || null,
                phone: contact.whatsapp || null,
            },
            categories,
            products: publicProducts,
        };

        // 7. Set Cache (5 minutes)
        await this.cacheManager.set(cacheKey, response, 300000);

        return response;
    }

    async toggleLike(slug: string, productId: string, userPhone: string) {
        // slug is used for public API identification but we don't need tenantId here
        // since productLike is scoped by productId which already belongs to a tenant
        const existingLike = await this.prisma.productLike.findUnique({
            where: {
                productId_userPhone: {
                    productId,
                    userPhone
                }
            }
        });

        if (existingLike) {
            await this.prisma.productLike.delete({
                where: { id: existingLike.id }
            });
            return { liked: false };
        } else {
            await this.prisma.productLike.create({
                data: {
                    productId,
                    userPhone
                }
            });
            return { liked: true };
        }
    }

    async addComment(slug: string, productId: string, userPhone: string, content: string, userName?: string) {
        const comment = await this.prisma.productComment.create({
            data: {
                productId,
                userPhone,
                content,
                userName,
                isApproved: true
            }
        });

        return {
            id: comment.id,
            userName: comment.userName || "Anónimo",
            content: comment.content,
            createdAt: comment.createdAt
        };
    }

    async checkLikeStatus(slug: string, productId: string, userPhone: string) {
        const count = await this.prisma.productLike.count({
            where: {
                productId,
                userPhone
            }
        });

        return { isLiked: count > 0 };
    }
}
