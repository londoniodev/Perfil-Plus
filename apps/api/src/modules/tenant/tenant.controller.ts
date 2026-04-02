import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@alvarosky/database';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { UpdateBrandSettingsDto } from './dto/update-brand-settings.dto';
import { UpdateFeaturesDto } from './dto/update-features.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Public()
  @SkipThrottle()
  @Get('identify')
  async identifyTenant(
    @Query('domain') domain: string,
    @Headers('x-internal-token') token: string,
  ) {
    return this.tenantService.identifyTenant(domain, token);
  }

  // Endpoint de emergencia: Purga TODAS las claves de resolución de tenant en Redis
  @Public()
  @Post('flush-resolution-cache')
  async flushResolutionCache(
    @Headers('x-internal-token') token: string,
  ) {
    return this.tenantService.flushAllTenantResolutionCache(token);
  }

  // Endpoint SaaS the aprovisionamiento automático the Tenants
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN' as any) // Sólo administradores globales (SuperAdmin) del SaaS pueden crear inquilinos.
  async createTenant(@Body() createDto: CreateTenantDto) {
    return this.tenantService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN' as any)
  async findAll() {
    return this.tenantService.findAll();
  }

  @Public()
  @SkipThrottle()
  @Get('branding')
  async getTenantBranding(@CurrentTenant() tenantId: string) {
    return this.tenantService.getTenantBranding(tenantId);
  }

  @Public()
  @SkipThrottle()
  @Get('branding/:id')
  async getTenantBrandingById(@Param('id') tenantId: string) {
    return this.tenantService.getTenantBranding(tenantId);
  }

  // Endpoint público para obtener datos de marketing (Landing page)
  @Public()
  @SkipThrottle()
  @Get('marketing')
  async getTenantMarketing(@Query('tenant') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException(
        'El id del tenant es requerido (ej. ?tenant=...)',
      );
    }
    return this.tenantService.getTenantMarketing(tenantId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN' as any, Role.ADMIN)
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.tenantService.getTenantByIdOrSlug(id, tenantId);
  }

  // Uso estrictamente protegido por administradores para configurar el Theme
  @Patch('branding')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateTenantBranding(
    @CurrentTenant() tenantId: string,
    @Body() updateDto: UpdateBrandingDto,
  ) {
    return this.tenantService.updateTenantBranding(tenantId, updateDto);
  }

  // Endpoint para actualizar BrandSettings (Motor de Marca Blanca)
  @Patch('brand-settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateBrandSettings(
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateBrandSettingsDto,
  ) {
    return this.tenantService.updateBrandSettings(tenantId, dto);
  }

  // Provisioning: Actualizar los módulos/features habilitados de un tenant
  @Patch(':id/features')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN' as any)
  async updateFeatures(
    @Param('id') tenantId: string,
    @Body() dto: UpdateFeaturesDto,
  ) {
    return this.tenantService.updateFeatures(tenantId, dto.features);
  }

  // GET Settings for SuperAdmin (management)
  @Get(':id/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN' as any)
  async getSettings(@Param('id') tenantId: string) {
    return this.tenantService.getSettings(tenantId);
  }

  // PATCH Settings for SuperAdmin (management)
  @Patch(':id/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN' as any)
  async updateSettings(@Param('id') tenantId: string, @Body() dto: any) {
    return this.tenantService.updateSettings(tenantId, dto);
  }

  // ELIMINAR TENANT (Físico) - ¡CUIDADO!
  @Delete(':idOrSlug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN' as any)
  async deleteTenant(@Param('idOrSlug') idOrSlug: string) {
    return this.tenantService.deleteTenant(idOrSlug);
  }
}
