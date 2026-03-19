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
import { UpdateBrandSettingsDto } from './dto/update-brand-settings.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { StorageService } from '../storage/storage.service';

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
    private readonly storageService: StorageService,
  ) {}

  /**
   * Crea un nuevo Tenant asegurando los valores por defecto "Plug & Play",
   * y aprovisiona el usuario administrador inicial.
   */
  async create(createDto: CreateTenantDto) {
    const { adminPassword, ownerEmail, slug, domain, name, primaryColor, secondaryColor, borderRadius, fontFamily, layoutType } = createDto;
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

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Transacción Atómica para asegurar consistencia
    const newTenant = await this.prisma.$transaction(async (tx) => {
      // 1. Crear Tenant (Usando this.prisma regular, bypass .secure)
      const tenant = await tx.tenant.create({
        data: {
          slug: slug.toLowerCase(),
          domain: domain.toLowerCase(),
          name: name || slug,
          dbName: 'web-projects', // Estandarizado
          status: 'ACTIVE',
          plan: 'free',
          features: defaultFeatures,
          design: defaultDesign,
          ownerEmail: ownerEmail.toLowerCase(),
        },
      });

      // 2. Crear Usuario Administrador
      await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: ownerEmail.toLowerCase(),
          name: 'Administrador Inicial',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: true,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${tenant.slug}`,
        },
      });

      // 3. Crear StoreSettings
      await tx.storeSettings.create({
        data: {
          tenantId: tenant.id,
          storeName: name || tenant.slug,
          storeEmail: ownerEmail.toLowerCase(),
        },
      });

      // 4. Crear Warehouse por defecto
      await tx.warehouse.create({
        data: {
          tenantId: tenant.id,
          name: 'Principal',
          isDefault: true,
        },
      });

      // 5. Crear BrandSettings (Motor de Marca Blanca)
      await tx.brandSettings.create({
        data: {
          tenantId: tenant.id,
          ...(primaryColor && { primaryColor }),
          ...(secondaryColor && { secondaryColor }),
          ...(borderRadius !== undefined && { borderRadius }),
          ...(fontFamily && { fontFamily }),
          ...(layoutType && { layoutType: layoutType as any }),
        },
      });

      return tenant;
    });

    this.logger.log(
      `Nuevo Tenant creado exitosamente "Everything-as-Code": ${newTenant.slug} (${newTenant.domain})`,
    );

    // 5. Infraestructura Preventiva (Buckets MinIO)
    try {
      await this.storageService.provisionBuckets(newTenant.slug);
    } catch (error) {
      this.logger.error(
        `Error aprovisionando buckets para: ${newTenant.slug}: ${error.message}`,
      );
      // No fallamos el endpoint si el storage falla (ya la BD se guardó), 
      // pero debería estar aprovisionado.
    }

    // 6. Invalidar caché en Redis para el dominio
    const cacheKey = `tenant_resolve_${domain.toLowerCase()}`;
    await this.cacheManager.del(cacheKey);
    this.logger.log(`Caché de dominio invalidado para: ${domain}`);

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
        select: { id: true, design: true, name: true, features: true, ownerEmail: true, notes: true, brandSettings: true },
      });
      if (tenantById) {
        this.logger.log(`[BRANDING DEBUG] Found tenant by ID: ${tenantId}`);
        const menuSetting = await this.prisma.secure.systemSetting.findFirst({
          where: { tenantId: tenantById.id, key: 'menu' },
        });
        const whatsappSetting = await this.prisma.secure.systemSetting.findFirst({
          where: { tenantId: tenantById.id, key: 'whatsapp' },
        });
        const smtpSetting = await this.prisma.secure.systemSetting.findFirst({
          where: { tenantId: tenantById.id, key: 'smtp' },
        });
        
        const menuData = (menuSetting?.value as any) || {};
        const logo = tenantById.brandSettings?.logoUrl || menuData.logo || null;
        const headerLinks = menuData.headerLinks || null;
        const footerLinks = menuData.footerLinks || null;
        const tagline = tenantById.brandSettings?.tagline || menuData.tagline || tenantById.notes || 'Plataforma Profesional';
        
        const contactPhone = (whatsappSetting?.value as string) || menuData.contactPhone || null;
        const smtpData = (smtpSetting?.value as any) || {};
        const contactEmail = smtpData?.auth?.user || menuData.contactEmail || tenantById.ownerEmail || null;
        
        return { ...tenantById, logo, headerLinks, footerLinks, contactEmail, contactPhone, tagline, brandSettings: tenantById.brandSettings || null };
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
      select: { id: true, design: true, name: true, features: true, ownerEmail: true, notes: true, brandSettings: true },
    });

    if (tenantBySlug) {
      this.logger.log(`[BRANDING DEBUG] Found tenant by slug: ${tenantId}`);
      const menuSetting = await this.prisma.secure.systemSetting.findFirst({
        where: { tenantId: tenantBySlug.id, key: 'menu' },
      });
      const whatsappSetting = await this.prisma.secure.systemSetting.findFirst({
        where: { tenantId: tenantBySlug.id, key: 'whatsapp' },
      });
      const smtpSetting = await this.prisma.secure.systemSetting.findFirst({
        where: { tenantId: tenantBySlug.id, key: 'smtp' },
      });
      
      const menuData = (menuSetting?.value as any) || {};
      const logo = tenantBySlug.brandSettings?.logoUrl || menuData.logo || null;
      const headerLinks = menuData.headerLinks || null;
      const footerLinks = menuData.footerLinks || null;
      const tagline = tenantBySlug.brandSettings?.tagline || menuData.tagline || tenantBySlug.notes || 'Plataforma Profesional';
      
      const contactPhone = (whatsappSetting?.value as string) || menuData.contactPhone || null;
      const smtpData = (smtpSetting?.value as any) || {};
      const contactEmail = smtpData?.auth?.user || menuData.contactEmail || tenantBySlug.ownerEmail || null;
      
      return { ...tenantBySlug, logo, headerLinks, footerLinks, contactEmail, contactPhone, tagline, brandSettings: tenantBySlug.brandSettings || null };
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
              { domain: { contains: domain, mode: 'insensitive' } },
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
   * Actualiza el diseño estructurado del Tenant usando el motor BrandSettings.
   * Mapea los datos del DTO antiguo (design JSON) al modelo relacional nuevo.
   */
  async updateTenantBranding(tenantId: string, updateDto: UpdateBrandingDto) {
    const design = updateDto.design || {};
    
    // Mapeamos los datos que vienen del frontend antiguo (`primary`, `radius`) al nuevo modelo
    const primaryColor = design.primary || design.primaryColor || '#09090b';
    const secondaryColor = design.secondaryColor || '#f4f4f5';
    const borderRadius = design.radius !== undefined ? design.radius : (design.borderRadius || 0.5);
    const fontFamily = design.fontFamily || 'Inter, sans-serif';
    const layoutType = design.layoutType || 'CLASSIC';
    const logoUrl = design.logoUrl || null;
    const faviconUrl = design.faviconUrl || null;
    const tagline = design.tagline || null;
    const authBgUrl = design.authBgUrl || null;
    const authQuote = design.authQuote || null;

    const updatedSettings = await this.prisma.brandSettings.upsert({
      where: { tenantId },
      create: {
        tenantId,
        primaryColor,
        secondaryColor,
        borderRadius,
        fontFamily,
        layoutType,
        logoUrl,
        faviconUrl,
        tagline,
        authBgUrl,
        authQuote,
      },
      update: {
        primaryColor,
        secondaryColor,
        borderRadius,
        fontFamily,
        layoutType,
        logoUrl,
        faviconUrl,
        tagline,
        authBgUrl,
        authQuote,
      },
    });

    this.logger.log(
      `Branding (BrandSettings) actualizado de forma segura para Tenant ID: ${tenantId}`,
    );

    // Disparador On-Demand de la caché The Next.js
    this.triggerFrontendRevalidation([
      `tenant-branding-${tenantId}`,
      `tenant-marketing-${tenantId}`,
      `tenant-branding`,
      `tenant-marketing`,
    ]);

    return updatedSettings;
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

  /**
   * Actualiza o crea las BrandSettings del tenant (Motor de Marca Blanca).
   * Usa upsert para garantizar que siempre se cree si no existe.
   */
  async updateBrandSettings(tenantId: string, dto: UpdateBrandSettingsDto) {
    const updated = await this.prisma.brandSettings.upsert({
      where: { tenantId },
      create: {
        tenantId,
        ...dto,
      },
      update: {
        ...dto,
      },
    });

    this.logger.log(
      `BrandSettings actualizado para Tenant ID: ${tenantId}`,
    );

    // 1. Revalidar caché del Dashboard (saas_dashboard)
    this.triggerFrontendRevalidation([
      `tenant-branding-${tenantId}`,
      `tenant-branding`,
    ]);

    // 2. Revalidar caché del Storefront (apps/_template) — Cross-App
    this.triggerStorefrontRevalidation(tenantId);

    return updated;
  }

  /**
   * Webhook Cross-App: Invalida la caché ISR del Storefront (apps/_template)
   * para que los cambios en BrandSettings se reflejen instantáneamente.
   * Fire-and-forget: No bloquea la respuesta al cliente.
   */
  private triggerStorefrontRevalidation(tenantId: string) {
    const storefrontUrl = process.env.STOREFRONT_URL || process.env.INTERNAL_FRONTEND_URL;
    const revalidationSecret = process.env.REVALIDATION_SECRET;

    if (!revalidationSecret) {
      this.logger.warn(
        '[Cross-App Revalidation] REVALIDATION_SECRET no configurado. Revalidación abortada.',
      );
      return;
    }

    if (!storefrontUrl) {
      this.logger.error(
        '[Cross-App Revalidation] Error: Ni STOREFRONT_URL ni INTERNAL_FRONTEND_URL están definidos. No se pudo revalidar ISR.',
      );
      return;
    }

    const tags = [
      `tenant-brand-${tenantId}`,
      `tenant-branding-${tenantId}`,
      'tenant-branding',
    ];

    // Fire-and-forget — no bloquea la respuesta
    Promise.all(
      tags.map((tag) =>
        fetch(`${storefrontUrl}/api/revalidate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-revalidate-secret': revalidationSecret,
          },
          body: JSON.stringify({ tag }),
        })
          .then((res) => {
            if (res.ok) {
              this.logger.log(
                `[Cross-App Revalidation] Storefront invalidado: [${tag}]`,
              );
            } else {
              this.logger.warn(
                `[Cross-App Revalidation] Storefront respondió ${res.status} para tag [${tag}]`,
              );
            }
          })
          .catch((err) => {
            this.logger.error(
              `[Cross-App Revalidation] Error conectando con Storefront (${storefrontUrl}): ${err.message}`,
            );
          }),
      ),
    );
  }

  /**
   * Lista todos los tenants registrados en la plataforma.
   * Sólo para SuperAdmin.
   */
  async findAll() {
    return this.prisma.tenant.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
