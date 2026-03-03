import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('dashboard')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async getDashboard(
        @CurrentTenant() tenantId: string,
        @Query('period') period?: string
    ) {
        return this.analyticsService.getDashboardStats(tenantId, period);
    }

    @Get('z-report')
    @UseGuards(JwtAuthGuard, RolesGuard)
    // Permitir Cajeros extraer cierres de caja (CASHIER rol no está en DB native a veces, lo pasamos como or custom si tuvieramos)
    // Si Role.CASHIER no existe en el Enum d Prisma, requerimos solo ADMIN de momento, según tu logica the negocio
    @Roles(Role.ADMIN)
    async getZReport(
        @CurrentTenant() tenantId: string,
        @Query('date') dateParam?: string
    ) {
        // Retorna flat para encajar con el Front o desempaquetamos `data` en caso the que el Frontend espere el Response plano.
        // En `reports.ts` frontend espera todo the raíz o un `{ data: ZReport }`. Le devolveremos el objeto tal cual lo escupe Service.
        const res = await this.analyticsService.getZReport(tenantId, dateParam);
        // El frontend espera: const reportData = await serverFetch<any>(...)
        // if(reportData.date) { reportData.date = new Date(reportData.date) }
        // Asumiré que devuelve desestructurado en la red { success, data } the mi controller, pero el Frontend leía de la raiz en código viejo. Si leemos el Front nuevo, parsea `reportData.date`. 
        // Return the .data flatly mixed with status just in case:
        return {
            ...res.data,
            success: res.success
        };
    }
}
