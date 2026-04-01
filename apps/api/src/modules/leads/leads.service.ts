import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto, LeadQueryDto } from './dto';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLeadDto, tenantId: string) {
    return this.prisma.lead.create({
      data: { ...dto, tenantId },
    });
  }

  async findAll(query: LeadQueryDto, tenantId: string) {
    const where: any = { tenantId };

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

    return this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.take ?? 50,
      skip: query.skip ?? 0,
    });
  }

  async getStats(tenantId: string) {
    const [total, bySource, recentLeads] = await Promise.all([
      this.prisma.lead.count({ where: { tenantId } }),
      this.prisma.lead.groupBy({
        by: ['source'],
        where: { tenantId },
        _count: { id: true },
      }),
      this.prisma.lead.findMany({
        where: { tenantId },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Leads últimos 7 días
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const thisWeek = await this.prisma.lead.count({
      where: { tenantId, createdAt: { gte: lastWeek } },
    });

    return {
      total,
      thisWeek,
      bySource: bySource.map((s) => ({ source: s.source, count: s._count.id })),
      recentLeads,
    };
  }

  async delete(id: string) {
    await this.prisma.lead.delete({ where: { id } });
    return { message: 'Lead eliminado' };
  }
}
