import { Injectable, Logger, NotFoundException, BadRequestException, Inject, UnauthorizedException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';

import * as bcrypt from 'bcryptjs';

@Injectable()
export class TenantService {
    private readonly logger = new Logger(TenantService.name);
    // Asume INTERNAL_FRONTEND_URL = "http://localhost:3000/api/revalidate"
    private readonly nextjsRevalidationUrl = process.env.INTERNAL_FRONTEND_URL || 'http://127.0.0.1:3000/api/revalidate';
    private readonly internalApiKey = process.env.INTERNAL_API_KEY || 'default_dev_secret_key';

    constructor(
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

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
     * Resuelve el TenantId dado un Hostname/Domain mediante caché centralizada (Redis) 
     * Protegido por Token Interno para evitar escaneo de la infraestructura.
     */
    async identifyTenant(domain: string, internalToken: string) {
        if (!domain) {
            throw new BadRequestException('Dominio requerido');
        }

        const expectedToken = process.env.INTERNAL_API_KEY || 'default_dev_secret_key';
        if (internalToken !== expectedToken) {
            this.logger.warn(`Intento de acceso no autorizado a identifyTenant. Host: ${domain}`);
            throw new UnauthorizedException('Acceso denegado a resolución de tenants');
        }

        const cacheKey = `tenant_resolve_${domain}`;

        const cachedResolution = await this.cacheManager.get(cacheKey);

        if (cachedResolution === 'NOT_FOUND') {
            throw new NotFoundException(`Dominio no registrado: ${domain}`);
        } else if (cachedResolution) {
            return cachedResolution;
        }

        // Buscar por slug (dominio o subdominio) asegurando que el plan/status actúe si es necesario
        const tenant = await this.prisma.tenant.findFirst({
            where: { slug: domain, status: 'ACTIVE' },
            select: { id: true, name: true }
        });

        if (!tenant) {
            await this.cacheManager.set(cacheKey, 'NOT_FOUND', 3600 * 1000);
            throw new NotFoundException(`Tenant no encontrado para el dominio: ${domain}`);
        }

        await this.cacheManager.set(cacheKey, { id: tenant.id }, 3600 * 1000);
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

        // Disparador On-Demand de la caché The Next.js
        this.triggerFrontendRevalidation([`tenant-branding-${tenantId}`, `tenant-marketing-${tenantId}`, `tenant-branding`, `tenant-marketing`]);

        return updatedTenant;
    }

    /**
     * Webhook hacia el App Router de Next.js para forzar la revalidación On-Demand del caché (ISR)
     */
    private async triggerFrontendRevalidation(tags: string[]) {
        try {
            for (const tag of tags) {
                const response = await fetch(this.nextjsRevalidationUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-revalidate-secret': this.internalApiKey,
                    },
                    body: JSON.stringify({ tag }),
                });

                if (!response.ok) {
                    this.logger.error(`Revalidación Next.js falló para tag [${tag}]: ${response.statusText}`);
                } else {
                    this.logger.log(`Caché purgado exitosamente en Next.js para tag: [${tag}]`);
                }
            }
        } catch (error: any) {
            this.logger.error(`Error al conectar con el Webhook de Next.js en ${this.nextjsRevalidationUrl}:`, error.message);
        }
    }
}
