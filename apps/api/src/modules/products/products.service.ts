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

    async create(data: CreateProductDto) {
        const { sku, stock, ...productData } = data;

        // Validar slug único
        const existing = await this.prisma.client.product.findUnique({
            where: { slug: data.slug },
        });

        if (existing) {
            throw new BadRequestException('El slug del producto ya existe');
        }

        // Transacción para crear producto + variante default
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

            return product;
        });
    }

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
            // We check existing Orders for this User that contain any Variant of this Product
            // AND the Order status is APPROVED/DELIVERED
            const hasPurchased = await this.prisma.client.order.findFirst({
                where: {
                    userId,
                    status: { in: ['APPROVED', 'DELIVERED', 'SHIPPED', 'PROCESSING'] }, // Any valid paid status
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
                    productId // Assuming we migrated data to this field or logic handles it
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
        const signedUrl = await this.storage.getSignedUrl(product.digitalFileUrl, 3600); // 1 hour validity
        return { downloadUrl: signedUrl };
    }

    async findAllAdmin() {
        return await this.prisma.client.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: { variants: true },
        });
    }

    async findOne(id: string) {
        const product = await this.prisma.client.product.findUnique({
            where: { id },
            include: { variants: true },
        });
        if (!product) throw new NotFoundException('Producto no encontrado');
        return product;
    }
}

