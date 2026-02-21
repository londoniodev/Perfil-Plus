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

    async getPublicMenu(slug: string) {
        // 0. Check Cache
        const cacheKey = `public_menu:${slug}`;
        // const cachedMenu = await this.cacheManager.get(cacheKey);
        // if (cachedMenu) {
        //     return cachedMenu;
        // }

        // 1. Find Tenant (from Master DB)
        const tenant = await this.prisma.getTenantBySlug(slug);

        if (!tenant) {
            throw new NotFoundException('Restaurant not found');
        }

        // 2. Connect to Tenant DB
        const tenantClient = await this.prisma.getTenantClient(slug);

        // 3. Find Categories (In Tenant DB)
        // Filter: Only categories that have at least one active product
        const categories = await tenantClient.category.findMany({
            where: {
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

        // 4. Find Products (In Tenant DB) — incluir categorías via pivot table
        const products = await tenantClient.product.findMany({
            where: {
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

        // 4b. Fetch Tenant Config (SystemSetting)
        const systemSetting = await tenantClient.systemSetting.findUnique({
            where: { key: 'TENANT_CONFIG' }
        });

        const tenantConfig = systemSetting?.value as any || {};
        const contact = tenantConfig.contact || {};

        // Debug: Inspect raw categories
        if (products.length > 0) {
            console.log("Raw Product Categories (Before Map):", JSON.stringify(products[0].categories, null, 2));
        }

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
                // We don't expose phone number
            })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }));

        // 5. Build Response
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
                    whatsapp: contact.whatsapp, // Frontend handles wa.me/
                    // twitter, tiktok, youtube if they exist in contact
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

        // 6. Set Cache (5 minutes)
        await this.cacheManager.set(cacheKey, response, 300000);

        return response;
    }

    async toggleLike(slug: string, productId: string, userPhone: string) {
        const tenantClient = await this.prisma.getTenantClient(slug);

        const existingLike = await tenantClient.productLike.findUnique({
            where: {
                productId_userPhone: {
                    productId,
                    userPhone
                }
            }
        });

        if (existingLike) {
            await tenantClient.productLike.delete({
                where: { id: existingLike.id }
            });
            return { liked: false };
        } else {
            await tenantClient.productLike.create({
                data: {
                    productId,
                    userPhone
                }
            });
            return { liked: true };
        }
    }

    async addComment(slug: string, productId: string, userPhone: string, content: string, userName?: string) {
        const tenantClient = await this.prisma.getTenantClient(slug);

        const comment = await tenantClient.productComment.create({
            data: {
                productId,
                userPhone,
                content,
                userName,
                isApproved: true // Auto-approve for now
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
        const tenantClient = await this.prisma.getTenantClient(slug);

        const count = await tenantClient.productLike.count({
            where: {
                productId,
                userPhone
            }
        });

        return { isLiked: count > 0 };
    }
}
