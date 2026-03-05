import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateTenantConfigDto } from './dto/update-tenant-config.dto';

@Controller('settings/tenant-config')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getTenantConfig(@CurrentTenant() tenantId: string) {
    return this.settingsService.getTenantConfig(tenantId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateTenantConfig(
    @CurrentTenant() tenantId: string,
    @Body() updateDto: UpdateTenantConfigDto,
  ) {
    return this.settingsService.updateTenantConfig(tenantId, updateDto);
  }
}
