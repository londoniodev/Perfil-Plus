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
        return this.prisma.ebook.findMany({
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
        const ebook = await this.prisma.ebook.findUnique({
            where: { slug },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                coverImage: true,
                price: true,
                createdAt: true,
                // NO incluir fileUrl para usuarios públicos
            },
        });

        if (!ebook) {
            throw new NotFoundException('E-book no encontrado');
        }

        return ebook;
    }

    async getDownloadUrl(ebookId: string, userId: string) {
        // Verificar que el usuario ha comprado el e-book
        const purchase = await this.prisma.purchase.findUnique({
            where: { userId_ebookId: { userId, ebookId } },
        });

        if (!purchase || purchase.status !== 'approved') {
            throw new ForbiddenException('No has comprado este e-book');
        }

        const ebook = await this.prisma.ebook.findUnique({
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
        return this.prisma.purchase.findMany({
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
        const purchase = await this.prisma.purchase.findUnique({
            where: { userId_ebookId: { userId, ebookId } },
        });
        return purchase?.status === 'approved';
    }

    // ==================== ADMIN ====================

    async findAll() {
        return this.prisma.ebook.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { purchases: true } },
            },
        });
    }

    async findById(id: string) {
        const ebook = await this.prisma.ebook.findUnique({
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

        return this.prisma.ebook.create({
            data: {
                ...dto,
                slug,
            },
        });
    }

    async update(id: string, dto: UpdateEbookDto) {
        const ebook = await this.prisma.ebook.findUnique({ where: { id } });
        if (!ebook) {
            throw new NotFoundException('E-book no encontrado');
        }

        const data: any = { ...dto };
        if (dto.title) {
            data.slug = this.generateSlug(dto.title);
        }

        return this.prisma.ebook.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        const ebook = await this.prisma.ebook.findUnique({ where: { id } });
        if (!ebook) {
            throw new NotFoundException('E-book no encontrado');
        }

        await this.prisma.ebook.delete({ where: { id } });
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
