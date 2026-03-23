import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';

@Module({
  controllers: [MetricsController],
  providers: [
    {
      provide: 'PROM_CLIENT_REGISTRY',
      useValue: require('prom-client').register,
    },
    {
      provide: 'PROM_CLIENT_OPTIONS',
      useValue: { defaultMetrics: { enabled: true } },
    },
  ],
  exports: ['PROM_CLIENT_REGISTRY'],
})
export class MetricsModule {}
