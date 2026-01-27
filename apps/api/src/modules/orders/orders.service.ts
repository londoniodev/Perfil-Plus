import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ProductType } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private storage: StorageService
    ) { }

    async findMyOrders(userId: string) {
        return await this.prisma.client.order.findMany({
            where: {
                userId,
                status: { in: ['APPROVED', 'DELIVERED', 'SHIPPED', 'PROCESSING'] }
            },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getDownloadUrl(userId: string, orderId: string, productId: string) {
        // 1. Verify that the order belongs to the user and is approved
        const order = await this.prisma.client.order.findFirst({
            where: {
                id: orderId,
                userId,
                status: { in: ['APPROVED', 'DELIVERED', 'SHIPPED', 'PROCESSING'] }
            },
            include: {
                items: {
                    where: {
                        variant: {
                            productId: productId
                        }
                    }
                }
            }
        });

        if (!order || order.items.length === 0) {
            throw new ForbiddenException('No tienes permiso para acceder a este producto o no has comprado este ítem.');
        }

        // 2. Get the product file URL
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

        // 3. Generate Signed URL
        const signedUrl = await this.storage.getSignedUrl(product.digitalFileUrl, 3600); // 1 hour
        return { downloadUrl: signedUrl };
    }
}
