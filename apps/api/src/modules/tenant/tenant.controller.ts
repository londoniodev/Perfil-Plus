import { Body, Controller, Get, Patch, Post, UseGuards, Query } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('tenant')
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Public()
    @SkipThrottle()
    @Get('identify')
    async identifyTenant(@Query('domain') domain: string) {
        return this.tenantService.identifyTenant(domain);
    }

    // Endpoint SaaS the aprovisionamiento automático the Tenants
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN) // Sólo administradores globales thel SaaS pueden crear inquilinos en producción.
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

