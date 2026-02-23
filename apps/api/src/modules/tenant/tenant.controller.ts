import { Body, Controller, Get, Patch, UseGuards, Query } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateBrandingDto } from './dto/update-branding.dto';

@Controller('tenant')
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Public()
    @Get('identify')
    async identifyTenant(@Query('domain') domain: string) {
        return this.tenantService.identifyTenant(domain);
    }

    // Este endpoint es DE USO PÚBLICO y no requiere JWT. Su función es inicializar la UI pública desde layout.tsx.
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

