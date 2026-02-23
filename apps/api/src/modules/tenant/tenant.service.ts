import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateBrandingDto } from './dto/update-branding.dto';

@Injectable()
export class TenantService {
    private readonly logger = new Logger(TenantService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Obtiene la apariencia del tenant para la inicialización pública de la aplicación (app/layout.tsx en frontend)
     */
    async getTenantBranding(tenantId: string) {
        // INFO: Prisma aun detecta id local como Number xq falta la migracion final a CUID(String). Convertimos cast aca temp:
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId as any },
            select: {
                design: true,
                name: true,
                features: true,
            },
        });

        if (!tenant) {
            throw new NotFoundException(`Tenant con ID ${tenantId} no encontrado`);
        }

        return tenant;
    }

    /**
     * Resuelve el TenantId dado un Hostname/Domain. Utilizado por NextJS Edge Middleware.
     */
    async identifyTenant(domain: string) {
        if (!domain) {
            throw new BadRequestException('Dominio requerido');
        }

        // Buscar por slug (dominio o subdominio)
        const tenant = await this.prisma.tenant.findFirst({
            where: { slug: domain },
            select: { id: true }
        });

        if (!tenant) {
            throw new NotFoundException(`Tenant no encontrado para el dominio: ${domain}`);
        }

        return { id: tenant.id };
    }

    /**
     * Actualiza EXCLUSIVAMENTE el campo de diseño del tenant. 
     * Previene "Mass Assignment Vulnerability" aislando los inputs del body.
     */
    async updateTenantBranding(tenantId: string, updateDto: UpdateBrandingDto) {
        const updatedTenant = await this.prisma.tenant.update({
            where: { id: tenantId as any },
            data: {
                design: updateDto.design !== undefined ? updateDto.design : undefined,
            },
            select: {
                design: true,
            },
        });

        this.logger.log(`Branding actualizado de forma segura para Tenant ID: ${tenantId}`);
        return updatedTenant;
    }
}
