import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { register } from 'prom-client';

/**
 * MetricsController – Endpoint unificado para Prometheus.
 *
 * Concatena:
 * 1. Métricas default de prom-client (Node.js internals: heap, GC, event loop lag)
 * 2. Métricas HTTP auto-instrumentadas por @willsoto/nestjs-prometheus
 * 3. Métricas de Prisma (connection pool, query durations, active connections)
 *
 * @Public() - Bypass del JwtAuthGuard para que Prometheus pueda scrapear sin token.
 */
@Controller()
export class MetricsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('metrics')
  @Public()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics(): Promise<string> {
    // 1. Métricas de prom-client (Node.js + custom + HTTP interceptors)
    const defaultMetrics = await register.metrics();

    // 2. Métricas de Prisma (pool connections, query durations, etc.)
    const prismaMetrics = await this.prisma.getPrometheusMetrics();

    // Concatenar ambas fuentes separadas por newline
    return `${defaultMetrics}\n${prismaMetrics}`;
  }
}
