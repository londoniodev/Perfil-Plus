import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';

import * as bcrypt from 'bcryptjs';

@Injectable()
export class TenantService {
    private readonly logger = new Logger(TenantService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Crea un nuevo Tenant asegurando los valores por defecto "Plug & Play",
     * y opcionalmente aprovisiona el usuario administrador inicial.
     */
    async create(createDto: CreateTenantDto) {
        const { adminPassword, ...tenantData } = createDto;
        const defaultFeatures = ['RESTAURANT', 'POS', 'INVENTORY', 'SHOP', 'ANALYTICS', 'SETTINGS'];
        const defaultDesign = {
            colors: { primary: "#000000", secondary: "#ffffff" },
            radius: 0.5
        };

        const newTenant = await this.prisma.tenant.create({
            data: {
                ...tenantData,
                dbName: 'web-projects', // Estandarizado en Monorepo
                status: 'ACTIVE',
                plan: 'free',
                features: defaultFeatures,
                design: defaultDesign
            }
        });

        this.logger.log(`Nuevo Tenant creado exitosamente "Plug & Play": ${newTenant.slug}`);

        // Si se proveen email y password inicial, aprovisionar el usuario administrador
        if (tenantData.ownerEmail && adminPassword) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await this.prisma.user.create({
                data: {
                    tenantId: newTenant.id,
                    email: tenantData.ownerEmail.toLowerCase(),
                    name: 'Administrador Inicial',
                    password: hashedPassword,
                    role: 'ADMIN',
                    emailVerified: true,
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ADMIN',
                }
            });
            this.logger.log(`Usuario administrador inicial auto-aprovisionado para: ${tenantData.ownerEmail}`);
        }

        return newTenant;
    }

    /**
     * Obtiene la apariencia del tenant para la inicialización pública de la aplicación (app/layout.tsx en frontend)
     */
    async getTenantBranding(tenantId: string) {
        const tenant = await this.prisma.tenant.findFirst({
            where: { slug: tenantId },
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
            where: { slug: tenantId },
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
