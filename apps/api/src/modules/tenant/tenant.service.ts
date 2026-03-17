import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
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
  private readonly nextjsRevalidationUrl =
    process.env.INTERNAL_FRONTEND_URL || 'http://127.0.0.1:3000/api/revalidate';
  private readonly internalApiKey =
    process.env.INTERNAL_API_KEY || 'default_dev_secret_key';

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Crea un nuevo Tenant asegurando los valores por defecto "Plug & Play",
   * y opcionalmente aprovisiona el usuario administrador inicial.
   */
  async create(createDto: CreateTenantDto) {
    const { adminPassword, ...tenantData } = createDto;
    const defaultFeatures = [
      'RESTAURANT',
      'POS',
      'INVENTORY',
      'SHOP',
      'ANALYTICS',
      'SETTINGS',
    ];
    const defaultDesign = {
      colors: { primary: '#000000', secondary: '#ffffff' },
      radius: 0.5,
    };

    const newTenant = await this.prisma.secure.tenant.create({
      data: {
        ...tenantData,
        dbName: 'web-projects', // Estandarizado en Monorepo
        status: 'ACTIVE',
        plan: 'free',
        features: defaultFeatures,
        design: defaultDesign,
      },
    });

    this.logger.log(
      `Nuevo Tenant creado exitosamente "Plug & Play": ${newTenant.slug}`,
    );

    // Si se proveen email y password inicial, aprovisionar el usuario administrador
    if (tenantData.ownerEmail && adminPassword) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await this.prisma.secure.user.create({
        data: {
          tenantId: newTenant.id,
          email: tenantData.ownerEmail.toLowerCase(),
          name: 'Administrador Inicial',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: true,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ADMIN',
        },
      });
      this.logger.log(
        `Usuario administrador inicial auto-aprovisionado para: ${tenantData.ownerEmail}`,
      );
    }

    return newTenant;
  }

  /**
   * Obtiene la apariencia del tenant para la inicialización pública de la aplicación (app/layout.tsx en frontend)
   * Ahora también incluye el logo desde SystemSettings.
   */
  async getTenantBranding(tenantId: string) {
    if (tenantId === 'default' || tenantId === 'default_tenant') {
      this.logger.log(`[BRANDING DEBUG] Ignorando búsqueda en BD para tenant '${tenantId}' (Next.js ISR Fallback)`);
      return {
        id: 'default',
        name: 'SaaS Platform',
        features: ['dashboard'],
        design: {
          colors: { primary: '#09090b', secondary: '#ffffff' },
          radius: 0.5,
        },
        logo: null,
        headerLinks: null,
        footerLinks: null,
        contactEmail: null,
        contactPhone: null,
        tagline: 'Plataforma Profesional'
      };
    }

    this.logger.log(
      `[BRANDING DEBUG] getTenantBranding called with tenantId: "${tenantId}"`,
    );
    try {
      const tenantById = await this.prisma.secure.tenant.findFirst({
        where: { id: tenantId },
        select: { id: true, design: true, name: true, features: true, ownerEmail: true, notes: true },
      });
      if (tenantById) {
        this.logger.log(`[BRANDING DEBUG] Found tenant by ID: ${tenantId}`);
        const menuSetting = await this.prisma.secure.systemSetting.findFirst({
          where: { tenantId: tenantById.id, key: 'menu' },
        });
        
        const menuData = (menuSetting?.value as any) || {};
        const logo = menuData.logo || null;
        const headerLinks = menuData.headerLinks || null;
        const footerLinks = menuData.footerLinks || null;
        const contactEmail = menuData.contactEmail || tenantById.ownerEmail || null;
        const contactPhone = menuData.contactPhone || null;
        const tagline = menuData.tagline || tenantById.notes || 'Plataforma Profesional';
        
        return { ...tenantById, logo, headerLinks, footerLinks, contactEmail, contactPhone, tagline };
      }
    } catch (error) {
      this.logger.warn(
        `[BRANDING DEBUG] findFirst by ID failed for "${tenantId}": ${error?.message || error}`,
      );
      // Postgres throw 22P03 si el tenantId ('template') no coincide con el map de la columna (UUID/INT).
    }

    this.logger.log(
      `[BRANDING DEBUG] ID lookup failed, trying slug lookup for: "${tenantId}"`,
    );
    const tenantBySlug = await this.prisma.secure.tenant.findFirst({
      where: { slug: tenantId },
      select: { id: true, design: true, name: true, features: true, ownerEmail: true, notes: true },
    });

    if (tenantBySlug) {
      this.logger.log(`[BRANDING DEBUG] Found tenant by slug: ${tenantId}`);
      const menuSetting = await this.prisma.secure.systemSetting.findFirst({
        where: { tenantId: tenantBySlug.id, key: 'menu' },
      });
      
      const menuData = (menuSetting?.value as any) || {};
      const logo = menuData.logo || null;
      const headerLinks = menuData.headerLinks || null;
      const footerLinks = menuData.footerLinks || null;
      const contactEmail = menuData.contactEmail || tenantBySlug.ownerEmail || null;
      const contactPhone = menuData.contactPhone || null;
      const tagline = menuData.tagline || tenantBySlug.notes || 'Plataforma Profesional';
      
      return { ...tenantBySlug, logo, headerLinks, footerLinks, contactEmail, contactPhone, tagline };
    }

    this.logger.error(
      `[BRANDING DEBUG] Tenant NOT FOUND for ID/Slug: "${tenantId}"`,
    );
    throw new NotFoundException(`Tenant con ID/Slug ${tenantId} no encontrado`);
  }

  /**
   * Obtiene los datos de Marketing del tenant para la Landing Page pública
   */
  async getTenantMarketing(tenantId: string) {
    try {
      const tenantById = await this.prisma.secure.tenant.findUnique({
        where: { id: tenantId },
        select: { slug: true, name: true, notes: true },
      });
      if (tenantById) {
        return {
          tenantSlug: tenantById.slug,
          heroTitle: tenantById.name || 'Empresa Creciendo',
          heroSubtitle:
            tenantById.notes || 'Configurando soluciones digitales para ti...',
        };
      }
    } catch (error) {
      // Ignorar mismatch de tipo ID Postgres
    }

    const tenantBySlug = await this.prisma.secure.tenant.findUnique({
      where: { slug: tenantId },
      select: { slug: true, name: true, notes: true },
    });

    if (tenantBySlug) {
      return {
        tenantSlug: tenantBySlug.slug,
        heroTitle: tenantBySlug.name || 'Empresa Creciendo',
        heroSubtitle:
          tenantBySlug.notes || 'Configurando soluciones digitales para ti...',
      };
    }

    throw new NotFoundException(
      `Tenant con ID/Slug ${tenantId} no encontrado para marketing`,
    );
  }

  /**
   * Resuelve el TenantId dado un Hostname/Domain mediante caché centralizada (Redis)
   * Protegido por Token Interno para evitar escaneo de la infraestructura.
   */
  async identifyTenant(domain: string, internalToken: string) {
    if (!domain) {
      throw new BadRequestException('Dominio requerido');
    }

    const expectedToken =
      process.env.INTERNAL_API_KEY || 'default_dev_secret_key';
    if (internalToken !== expectedToken) {
      this.logger.warn(
        `Intento de acceso no autorizado a identifyTenant. Host: ${domain}`,
      );
      throw new UnauthorizedException(
        'Acceso denegado a resolución de tenants',
      );
    }

    const cacheKey = `tenant_resolve_${domain}`;

    const cachedResolution = await this.cacheManager.get(cacheKey);

    if (cachedResolution === 'NOT_FOUND') {
      throw new NotFoundException(`Dominio no registrado: ${domain}`);
    } else if (cachedResolution) {
      return cachedResolution;
    }

    // Buscar primero por coincidencia exacta relajando status ('ACTIVE' u otros)
    let tenant: any = null;
    try {
      tenant = await this.prisma.secure.tenant.findFirst({
        where: { slug: domain },
        select: { id: true, name: true, status: true, features: true },
      });
    } catch (error) {
      // Ignorar
    }

    // Si no lo encuentra, buscar con 'contains' (ej. Si la BD lo tiene guardado como mauromera.com o MauroMera)
    if (!tenant) {
      try {
        tenant = await this.prisma.secure.tenant.findFirst({
          where: {
            OR: [
              { slug: { contains: domain, mode: 'insensitive' } },
              { name: { contains: domain, mode: 'insensitive' } },
            ],
          },
          select: { id: true, name: true, status: true, features: true },
        });
      } catch (error) {
        // Ignorar
      }
    }

    if (!tenant) {
      await this.cacheManager.set(cacheKey, 'NOT_FOUND', 3600 * 1000);
      throw new NotFoundException(
        `Tenant no encontrado para el dominio: ${domain}`,
      );
    }

    const resolvedTenant = { id: tenant.id, features: tenant.features || [] };
    this.logger.log(
      `[IDENTIFY DEBUG] Resolved tenant for domain "${domain}": id=${tenant.id}, features=${JSON.stringify(resolvedTenant.features)}`,
    );
    await this.cacheManager.set(cacheKey, resolvedTenant, 3600 * 1000);
    return resolvedTenant;
  }

  /**
   * Actualiza EXCLUSIVAMENTE el campo de diseño del tenant.
   * Previene "Mass Assignment Vulnerability" aislando los inputs del body.
   */
  async updateTenantBranding(tenantId: string, updateDto: UpdateBrandingDto) {
    const updatedTenant = await this.prisma.secure.tenant.update({
      where: { id: tenantId },
      data: {
        design: updateDto.design !== undefined ? updateDto.design : undefined,
      },
      select: {
        design: true,
      },
    });

    this.logger.log(
      `Branding actualizado de forma segura para Tenant ID: ${tenantId}`,
    );

    // Disparador On-Demand de la caché The Next.js
    this.triggerFrontendRevalidation([
      `tenant-branding-${tenantId}`,
      `tenant-marketing-${tenantId}`,
      `tenant-branding`,
      `tenant-marketing`,
    ]);

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
          this.logger.error(
            `Revalidación Next.js falló para tag [${tag}]: ${response.statusText}`,
          );
        } else {
          this.logger.log(
            `Caché purgado exitosamente en Next.js para tag: [${tag}]`,
          );
        }
      }
    } catch (error: any) {
      this.logger.error(
        `Error al conectar con el Webhook de Next.js en ${this.nextjsRevalidationUrl}:`,
        error.message,
      );
    }
  }
}
