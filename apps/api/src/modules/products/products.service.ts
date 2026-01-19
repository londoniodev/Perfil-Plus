import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductType } from '@prisma/client';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(private prisma: PrismaService) { }

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

