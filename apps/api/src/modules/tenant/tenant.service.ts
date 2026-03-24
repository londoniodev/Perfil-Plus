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
import { CorsCacheService } from '../core/cors-cache.service';
import { DokployService } from '../core/dokploy.service';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';

import * as bcrypt from 'bcryptjs';

// Interface para parchar el tipado de Prisma si no se ha regenerado correctamente
interface BrandSettingsWithAssets {
  id: string;
  tenantId: string;
  primaryColor: string;
  secondaryColor: string;
  borderRadius: number;
  fontFamily: string;
  layoutType: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  tagline?: string | null;
  authBgUrl?: string | null;
  authQuote?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);
  private readonly nextjsRevalidationUrl = process.env.STOREFRONT_URL 
    ? `${process.env.STOREFRONT_URL}/api/revalidate` 
    : 'http://127.0.0.1:3000/api/revalidate';
  private readonly internalApiKey =
    process.env.INTERNAL_API_KEY || 'default_dev_secret_key';

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly storageService: StorageService,
    private readonly corsCacheService: CorsCacheService,
    private readonly dokployService: DokployService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
  ) {}

  /**
   * Crea un nuevo Tenant asegurando los valores por defecto "Plug & Play",
   * y aprovisiona el usuario administrador inicial.
   */
  async create(createDto: CreateTenantDto) {
    const {
      adminPassword,
      ownerEmail,
      slug,
      domain,
      name,
      primaryColor,
      secondaryColor,
      borderRadius,
      fontFamily,
      layoutType,
      ownerName,
      ownerRole,
      features,
    } = createDto;

    // Si no se envían features desde el DTO, usar los por defecto, incluyendo DASHBOARD.
    // Si se envían, asegurar que DASHBOARD esté presente para no bloquear el acceso.
    const finalFeatures =
      features && features.length > 0
        ? features
        : [
            'DASHBOARD',
            'RESTAURANT',
            'POS',
            'INVENTORY',
            'SHOP',
            'ANALYTICS',
            'SETTINGS',
          ];

    if (!finalFeatures.includes('DASHBOARD')) {
      finalFeatures.push('DASHBOARD');
    }

    const defaultDesign = {
      colors: { primary: '#000000', secondary: '#ffffff' },
      radius: 0.5,
    };

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Transacción Atómica para asegurar consistencia
    const newTenant = await this.prisma.$transaction(async (tx) => {
      // 1. Crear Tenant (Usando this.prisma regular, bypass .secure)
      // Se crea el usuario inicial de forma atómica usando un 'nested write'
      const tenant = await tx.tenant.create({
        data: {
          slug: slug.toLowerCase(),
          domain: domain.toLowerCase(),
          name: name || slug,
          dbName: 'web-projects', // Estandarizado
          status: 'ACTIVE',
          plan: 'free',
          features: finalFeatures,
          design: defaultDesign,
          ownerEmail: ownerEmail.toLowerCase(),
          users: {
            create: {
              email: ownerEmail.toLowerCase(),
              name: ownerName || 'Administrador Inicial',
              password: hashedPassword,
              role: ownerRole || 'ADMIN',
              emailVerified: true,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${slug.toLowerCase()}`,
            },
          },
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

    // 6. Invalidar caché en Redis (slug + dominio completo)
    await this.invalidateTenantCache(slug, domain);

    // 7. Actualizar caché CORS en Redis dinámicamente
    const baseDomain = this.corsCacheService.getBaseDomain();
    const subdomainOrigin = `https://${newTenant.slug}.${baseDomain}`;
    await this.corsCacheService.addOrigin(subdomainOrigin);
    if (newTenant.domain) {
      await this.corsCacheService.addOrigin(`https://${newTenant.domain}`);
    }

    // 8. Provisionar dominio en Dokploy (SSL + routing)
    const storefrontAppId = this.configService.get<string>(
      'STOREFRONT_DOKPLOY_APP_ID',
    );
    if (storefrontAppId) {
      // Provisionar el subdominio del slug
      this.dokployService
        .provisionDomain(`${newTenant.slug}.${baseDomain}`, storefrontAppId)
        .catch((err) =>
          this.logger.error(
            `Error provisionando dominio en Dokploy: ${err.message}`,
          ),
        );

      // Si tiene dominio custom, provisionarlo también
      if (
        newTenant.domain &&
        newTenant.domain !== `${newTenant.slug}.${baseDomain}`
      ) {
        this.dokployService
          .provisionDomain(newTenant.domain, storefrontAppId)
          .catch((err) =>
            this.logger.error(
              `Error provisionando dominio custom en Dokploy: ${err.message}`,
            ),
          );
      }
    } else {
      this.logger.warn(
        'STOREFRONT_DOKPLOY_APP_ID no configurado. Saltando provisionamiento de dominio en Dokploy.',
      );
    }

    return newTenant;
  }

  /**
   * Obtiene la apariencia del tenant para la inicialización pública de la aplicación (app/layout.tsx en frontend)
   * Ahora también incluye el logo desde SystemSettings.
   */
  async getTenantBranding(tenantId: string) {
    if (
      tenantId === 'default' ||
      tenantId === 'default_tenant' ||
      tenantId === 'admin_build' ||
      tenantId === 'template'
    ) {
      this.logger.log(
        `[BRANDING DEBUG] Ignorando búsqueda en BD para tenant '${tenantId}' (Next.js ISR Fallback)`,
      );
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
        tagline: 'Plataforma Profesional',
      };
    }

    this.logger.log(
      `[BRANDING DEBUG] getTenantBranding called with tenantId: "${tenantId}"`,
    );
    try {
      const tenantById = await this.prisma.secure.tenant.findFirst({
        where: { id: tenantId },
        select: {
          id: true,
          design: true,
          name: true,
          features: true,
          ownerEmail: true,
          notes: true,
          brandSettings: true,
        },
      });
      if (tenantById) {
        this.logger.log(`[BRANDING DEBUG] Found tenant by ID: ${tenantId}`);
        const menuSetting = await this.prisma.secure.systemSetting.findFirst({
          where: { tenantId: tenantById.id, key: 'menu' },
        });
        const whatsappSetting =
          await this.prisma.secure.systemSetting.findFirst({
            where: { tenantId: tenantById.id, key: 'whatsapp' },
          });
        const smtpSetting = await this.prisma.secure.systemSetting.findFirst({
          where: { tenantId: tenantById.id, key: 'smtp' },
        });

        const menuData = (menuSetting?.value as any) || {};
        const bs =
          (tenantById.brandSettings as unknown as BrandSettingsWithAssets) ||
          {};
        const logo = bs.logoUrl || menuData.logo || null;
        const headerLinks = menuData.headerLinks || null;
        const footerLinks = menuData.footerLinks || null;
        const tagline =
          bs.tagline ||
          menuData.tagline ||
          tenantById.notes ||
          'Plataforma Profesional';

        const contactPhone =
          (whatsappSetting?.value as string) || menuData.contactPhone || null;
        const smtpData = (smtpSetting?.value as any) || {};
        const contactEmail =
          smtpData?.auth?.user ||
          menuData.contactEmail ||
          tenantById.ownerEmail ||
          null;

        return {
          ...tenantById,
          logo,
          headerLinks,
          footerLinks,
          contactEmail,
          contactPhone,
          tagline,
          brandSettings: tenantById.brandSettings || null,
        };
      }
    } catch (error) {
      this.logger.warn(
        `[BRANDING DEBUG] findFirst by ID failed for "${tenantId}": ${error?.message || error}`,
      );
    }

    this.logger.log(
      `[BRANDING DEBUG] ID lookup failed, trying slug lookup for: "${tenantId}"`,
    );

    const tenantBySlug = await this.prisma.secure.tenant.findFirst({
      where: { slug: tenantId },
      select: {
        id: true,
        design: true,
        name: true,
        features: true,
        ownerEmail: true,
        notes: true,
        brandSettings: true,
      },
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
      const bs =
        (tenantBySlug.brandSettings as unknown as BrandSettingsWithAssets) ||
        {};
      const logo = bs.logoUrl || menuData.logo || null;
      const headerLinks = menuData.headerLinks || null;
      const footerLinks = menuData.footerLinks || null;
      const tagline =
        bs.tagline ||
        menuData.tagline ||
        tenantBySlug.notes ||
        'Plataforma Profesional';

      const contactPhone =
        (whatsappSetting?.value as string) || menuData.contactPhone || null;
      const smtpData = (smtpSetting?.value as any) || {};
      const contactEmail =
        smtpData?.auth?.user ||
        menuData.contactEmail ||
        tenantBySlug.ownerEmail ||
        null;

      return {
        ...tenantBySlug,
        logo,
        headerLinks,
        footerLinks,
        contactEmail,
        contactPhone,
        tagline,
        brandSettings: tenantBySlug.brandSettings || null,
      };
    }

    this.logger.error(
      `[BRANDING DEBUG] Tenant NOT FOUND for ID/Slug: "${tenantId}"`,
    );
    throw new NotFoundException(`Tenant con ID/Slug ${tenantId} no encontrado`);
  }

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

    const lowercaseDomain = domain.toLowerCase();
    const cacheKey = `tenant_resolve_${lowercaseDomain}`;

    const cachedResolution = await this.cacheManager.get(cacheKey);

    if (cachedResolution === 'NOT_FOUND') {
      throw new NotFoundException(`Dominio no registrado: ${domain}`);
    } else if (cachedResolution && (cachedResolution as any).slug) {
      return cachedResolution;
    }

    let tenant: any = null;
    const baseDomain =
      this.configService.get<string>('NEXT_PUBLIC_BASE_DOMAIN') ||
      'xn--alvarolondoo-khb.dev';
    const slugFromDomain = lowercaseDomain.endsWith(`.${baseDomain}`)
      ? lowercaseDomain.replace(`.${baseDomain}`, '')
      : lowercaseDomain;

    try {
      tenant = await this.prisma.secure.tenant.findFirst({
        where: {
          OR: [
            { domain: lowercaseDomain },
            { slug: lowercaseDomain },
            { slug: slugFromDomain },
          ],
        },
        select: { id: true, slug: true, name: true, status: true, features: true },
      });
    } catch (error) {
      this.logger.error(`Error en identifyTenant: ${error.message}`);
    }

    if (!tenant) {
      // Fallback a regex like search as requested in existing code
      try {
        tenant = await this.prisma.secure.tenant.findFirst({
          where: {
            OR: [
              { slug: { contains: domain, mode: 'insensitive' } },
              { name: { contains: domain, mode: 'insensitive' } },
              { domain: { contains: domain, mode: 'insensitive' } },
            ],
          },
          select: { id: true, slug: true, name: true, status: true, features: true },
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

    const resolvedTenant = {
      id: tenant.id,
      slug: tenant.slug,
      features: tenant.features || [],
    };
    this.logger.log(
      `[IDENTIFY DEBUG] Resolved tenant for domain "${domain}": id=${tenant.id}, features=${JSON.stringify(resolvedTenant.features)}`,
    );
    await this.cacheManager.set(cacheKey, resolvedTenant, 3600 * 1000);
    return resolvedTenant;
  }

  async updateTenantBranding(tenantId: string, updateDto: UpdateBrandingDto) {
    const design = updateDto.design || {};

    const primaryColor = design.primary || design.primaryColor || '#09090b';
    const secondaryColor = design.secondaryColor || '#f4f4f5';
    const borderRadius =
      design.radius !== undefined ? design.radius : design.borderRadius || 0.5;
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

    this.triggerFrontendRevalidation([
      `tenant-branding-${tenantId}`,
      `tenant-marketing-${tenantId}`,
      `tenant-branding`,
      `tenant-marketing`,
    ]);

    return updatedSettings;
  }

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

  async updateBrandSettings(tenantId: string, dto: UpdateBrandSettingsDto) {
    const updated = await this.prisma.brandSettings.upsert({
      where: { tenantId },
      create: {
        tenantId,
        ...(dto as any),
      },
      update: {
        ...(dto as any),
      },
    });

    this.logger.log(`BrandSettings actualizado para Tenant ID: ${tenantId}`);

    this.triggerFrontendRevalidation([
      `tenant-branding-${tenantId}`,
      `tenant-branding`,
    ]);

    this.triggerStorefrontRevalidation(tenantId);

    return updated;
  }

  private triggerStorefrontRevalidation(tenantId: string) {
    const storefrontUrl = process.env.STOREFRONT_URL;
    const revalidationSecret = process.env.REVALIDATION_SECRET;

    if (!revalidationSecret) {
      this.logger.warn(
        '[ISR Revalidation] REVALIDATION_SECRET no configurado. Abortando.',
      );
      return;
    }

    if (!storefrontUrl) {
      this.logger.error(
        '[ISR Revalidation] Error: STOREFRONT_URL no está definido. No se puede revalidar el caché del storefront.',
      );
      return;
    }

    const tags = [
      `tenant-brand-${tenantId}`,
      `tenant-branding-${tenantId}`,
      'tenant-branding',
    ];

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

  async findAll() {
    return this.prisma.raw.tenant.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getSettings(idOrSlug: string) {
    const tenant = await this.prisma.secure.tenant.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!tenant) {
      throw new NotFoundException('Inquilino no encontrado');
    }

    return this.settingsService.getTenantConfig(tenant.id);
  }

  async updateSettings(idOrSlug: string, dto: any) {
    const tenant = await this.prisma.secure.tenant.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!tenant) {
      throw new NotFoundException('Inquilino no encontrado');
    }

    return this.settingsService.updateTenantConfig(tenant.id, dto);
  }

  /**
   * Actualiza las features habilitadas de un tenant (Provisioning de módulos).
   * - Actualiza Tenant.features[] en la DB.
   * - Invalida la caché Redis del tenant para que el middleware refleje los cambios.
   * - Dispara revalidación ISR del storefront.
   */
  async updateFeatures(tenantIdOrSlug: string, features: string[]) {
    // 1. Verificar que el tenant existe buscando por ID o Slug (Contexto Global)
    const tenant = await this.prisma.raw.tenant.findFirst({
      where: {
        OR: [{ id: tenantIdOrSlug }, { slug: tenantIdOrSlug }],
      },
      select: { id: true, slug: true, domain: true },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant con identificador ${tenantIdOrSlug} no encontrado`,
      );
    }

    // 2. Actualizar features en la DB usando el ID real (Contexto Global)
    // 2. Actualizar features en la base de datos (Contexto Global)
    // Forzamos que DASHBOARD siempre esté presente para evitar bloqueos accidentales
    if (!features.includes('DASHBOARD')) {
      features.push('DASHBOARD');
    }

    const updated = await this.prisma.raw.tenant.update({
      where: { id: tenant.id },
      data: { features },
      select: { id: true, slug: true, features: true },
    });

    this.logger.log(
      `Features actualizadas para Tenant "${tenant.slug}" (${tenant.id}): [${features.join(', ')}]`,
    );

    // 3. Invalidar caché Redis (el middleware cachea la resolución del tenant)
    await this.invalidateTenantCache(tenant.slug, tenant.domain ?? undefined);

    // 4. Revalidación ISR del storefront
    this.triggerFrontendRevalidation([
      `tenant-branding-${tenant.id}`,
      `tenant-branding`,
    ]);

    return updated;
  }

  /**
   * Invalida todas las claves de caché Redis asociadas a un tenant.
   * Borra tanto la clave por slug (lo que envía el middleware) como la de dominio completo.
   */
  private async invalidateTenantCache(slug?: string, domain?: string) {
    const keys = new Set<string>();
    if (slug) keys.add(`tenant_resolve_${slug.toLowerCase()}`);
    if (domain) {
      keys.add(`tenant_resolve_${domain.toLowerCase()}`);
      // El middleware quita el TLD, así que también invalidamos sin él
      const withoutTld = domain.toLowerCase().split('.')[0];
      if (withoutTld) keys.add(`tenant_resolve_${withoutTld}`);
    }

    for (const key of keys) {
      await this.cacheManager.del(key);
      this.logger.log(`Caché de tenant invalidado: ${key}`);
    }
  }

  async getTenantByIdOrSlug(idOrSlug: string) {
    const tenant = await this.prisma.raw.tenant.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant con ID o Slug "${idOrSlug}" no encontrado`,
      );
    }

    return tenant;
  }
}
