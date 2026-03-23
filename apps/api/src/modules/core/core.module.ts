import { Global, Module } from '@nestjs/common';
import { CorsCacheService } from './cors-cache.service';
import { DokployService } from './dokploy.service';

@Global()
@Module({
  providers: [CorsCacheService, DokployService],
  exports: [CorsCacheService, DokployService],
})
export class CoreModule {}
