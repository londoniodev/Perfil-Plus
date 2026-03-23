import { Controller, Get, Header, Inject, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { Registry } from 'prom-client';

/**
 * MetricsController – Endpoint unificado para Prometheus.
 */
@Controller()
export class MetricsController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('PROM_CLIENT_REGISTRY') private readonly registry: Registry,
  ) {}

  @Get('metrics')
  @Public()
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', this.registry.contentType);
    
    // 1. Métricas de prom-client (Node.js + custom + HTTP interceptors)
    const defaultMetrics = await this.registry.metrics();

    // 2. Métricas de Prisma (pool connections, query durations, etc.)
    const prismaMetrics = await this.prisma.getPrometheusMetrics();

    // Concatenar ambas fuentes separadas por newline
    res.send(`# Health Check OK\n${defaultMetrics}\n${prismaMetrics}`);
  }
}
