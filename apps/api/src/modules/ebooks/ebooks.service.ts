import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateEbookDto, UpdateEbookDto } from './dto';

@Injectable()
export class EbooksService {
    constructor(
        private prisma: PrismaService,
        private storage: StorageService,
    ) { }

    // ==================== PUBLIC ====================

    async findAllPublished() {
        return this.prisma.client.ebook.findMany({
            where: { published: true },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                coverImage: true,
                price: true,
                createdAt: true,
            },
        });
    }

    async findBySlug(slug: string) {
        const ebook = await this.prisma.client.ebook.findUnique({
            where: { slug },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                coverImage: true,
                price: true,
                createdAt: true,
                previewUrl: true,
                // NO incluir fileUrl para usuarios públicos
            },
        });

        if (!ebook) {
            throw new NotFoundException('E-book no encontrado');
        }

        return ebook;
    }

    async getDownloadUrl(ebookId: string, userId: string) {
        // 1. Verificar si tiene suscripción activa
        const subscription = await this.prisma.client.subscription.findUnique({
            where: { userId },
        });

        const hasActiveSubscription = subscription?.status === 'ACTIVE';

        // 2. Si no tiene suscripción, verificar si lo ha comprado
        if (!hasActiveSubscription) {
            const purchase = await this.prisma.client.purchase.findUnique({
                where: { userId_ebookId: { userId, ebookId } },
            });

            if (!purchase || purchase.status !== 'approved') {
                throw new ForbiddenException('No tienes acceso a este e-book');
            }
        }

        const ebook = await this.prisma.client.ebook.findUnique({
            where: { id: ebookId },
        });

        if (!ebook) {
            throw new NotFoundException('E-book no encontrado');
        }

        // Generar URL firmada para descarga (válida por 1 hora)
        const signedUrl = await this.storage.getSignedUrl(ebook.fileUrl, 3600);

        return { downloadUrl: signedUrl };
    }

    async getUserPurchases(userId: string) {
        return this.prisma.client.purchase.findMany({
            where: { userId, status: 'approved' },
            include: {
                ebook: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        coverImage: true,
                    },
                },
            },
            orderBy: { purchasedAt: 'desc' },
        });
    }

    async hasPurchased(ebookId: string, userId: string): Promise<boolean> {
        // Verificar suscripción primero
        const subscription = await this.prisma.client.subscription.findUnique({
            where: { userId },
        });

        if (subscription?.status === 'ACTIVE') {
            return true;
        }

        const purchase = await this.prisma.client.purchase.findUnique({
            where: { userId_ebookId: { userId, ebookId } },
        });
        return purchase?.status === 'approved';
    }

    // ==================== ADMIN ====================

    async findAll() {
        return this.prisma.client.ebook.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { purchases: true } },
            },
        });
    }

    async findById(id: string) {
        const ebook = await this.prisma.client.ebook.findUnique({
            where: { id },
            include: {
                _count: { select: { purchases: true } },
            },
        });

        if (!ebook) {
            throw new NotFoundException('E-book no encontrado');
        }

        return ebook;
    }

    async create(dto: CreateEbookDto) {
        const slug = this.generateSlug(dto.title);

        return this.prisma.client.ebook.create({
            data: {
                ...dto,
                slug,
            },
        });
    }

    async update(id: string, dto: UpdateEbookDto) {
        const ebook = await this.prisma.client.ebook.findUnique({ where: { id } });
        if (!ebook) {
            throw new NotFoundException('E-book no encontrado');
        }

        const data: any = { ...dto };
        if (dto.title) {
            data.slug = this.generateSlug(dto.title);
        }

        return this.prisma.client.ebook.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        const ebook = await this.prisma.client.ebook.findUnique({ where: { id } });
        if (!ebook) {
            throw new NotFoundException('E-book no encontrado');
        }

        await this.prisma.client.ebook.delete({ where: { id } });
        return { message: 'E-book eliminado correctamente' };
    }

    // ==================== HELPERS ====================

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            + '-' + Date.now().toString(36);
    }
}

