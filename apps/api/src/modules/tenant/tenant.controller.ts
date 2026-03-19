import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
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

  // Endpoint SaaS the aprovisionamiento automático the Tenants
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN as any) // Sólo administradores globales (SuperAdmin) del SaaS pueden crear inquilinos.
  async createTenant(@Body() createDto: CreateTenantDto) {
    return this.tenantService.create(createDto);
  }

  // Este endpoint es DE USO PÚBLICO y no requiere JWT. Su función es inicializar la UI pública desde layout.tsx.
  @Public()
  @SkipThrottle()
  @Get('branding')
  async getTenantBranding(@CurrentTenant() tenantId: string) {
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
}
