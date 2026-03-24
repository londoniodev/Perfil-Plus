import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';

import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [AuthModule, StorageModule, SettingsModule],
  controllers: [TenantController],
  providers: [TenantService],
})
export class TenantModule {}
