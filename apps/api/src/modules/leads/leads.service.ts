import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto, LeadQueryDto } from './dto';

@Injectable()
export class LeadsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateLeadDto) {
        return this.prisma.client.lead.create({
            data: dto,
        });
    }

    async findAll(query: LeadQueryDto) {
        const where: any = {};

        if (query.source) {
            where.source = query.source;
        }

        if (query.startDate || query.endDate) {
            where.createdAt = {};
            if (query.startDate) {
                where.createdAt.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.createdAt.lte = new Date(query.endDate);
            }
        }

        return this.prisma.client.lead.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async getStats() {
        const [total, bySource, recentLeads] = await Promise.all([
            this.prisma.client.lead.count(),
            this.prisma.client.lead.groupBy({
                by: ['source'],
                _count: { id: true },
            }),
            this.prisma.client.lead.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        // Leads últimos 7 días
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const thisWeek = await this.prisma.client.lead.count({
            where: { createdAt: { gte: lastWeek } },
        });

        return {
            total,
            thisWeek,
            bySource: bySource.map((s) => ({ source: s.source, count: s._count.id })),
            recentLeads,
        };
    }

    async delete(id: string) {
        await this.prisma.client.lead.delete({ where: { id } });
        return { message: 'Lead eliminado' };
    }
}

