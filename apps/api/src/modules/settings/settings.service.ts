import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateTenantConfigDto } from './dto/update-tenant-config.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todas las configuraciones del sistema/tienda de un tenant en un objeto colapsado.
   * Ahora combina: SystemSetting + BrandSettings + TenantSettings (global) + BranchSettings (operativa).
   * @param tenantId - ID del tenant
   * @param branchId - ID de la sucursal (opcional, usa default si no se envía)
   */
  async getTenantConfig(tenantId: string, branchId?: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, slug: true },
    });

    const settings = await this.prisma.systemSetting.findMany({
      where: {
        tenantId,
        isPublic: true,
      },
    });

    // Colapsar en un solo objeto para el frontend
    const collapsed = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    // Obtener BrandSettings (Colores y Apariencia)
    const brandSettings = await this.prisma.brandSettings.findUnique({
      where: { tenantId },
    });

    // Obtener TenantSettings (Configuración Global: WABA, OpenAI, etc.)
    const tenantSettings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    // Resolver branchId: si no viene, usar la sucursal por defecto
    let resolvedBranchId = branchId;
    if (!resolvedBranchId) {
      const defaultBranch = await this.prisma.branch.findFirst({
        where: { tenantId, isDefault: true },
        select: { id: true },
      });
      resolvedBranchId = defaultBranch?.id;
    }

    // Obtener BranchSettings (Configuración Operativa: pagos, delivery, horarios)
    let branchSettings: any = null;
    if (resolvedBranchId) {
      branchSettings = await this.prisma.branchSettings.findUnique({
        where: { branchId: resolvedBranchId },
      });
    }

    // Combinar todo. Los campos de tablas específicas sobrescriben los genéricos si coinciden.
    const finalConfig = {
      // 1. Valores genéricos de SystemSetting
      ...collapsed,

      // 2. Información del Tenant
      tenant_name: tenant?.name || '',
      tenant_slug: tenant?.slug || '',

      // 3. BrandSettings (Mapeo explícito a snake_case para el frontend)
      primary_color: brandSettings?.primaryColor || '#6366f1',
      secondary_color: brandSettings?.secondaryColor || '#a5a6f6',
      theme: collapsed['theme'] || '',
      layout_type: brandSettings?.layoutType || 'CLASSIC',

      // 4. TenantSettings (Global: WhatsApp)
      waPhoneNumberId:
        tenantSettings?.waPhoneNumberId || collapsed['waPhoneNumberId'] || '',
      hero_image: brandSettings?.authBgUrl || '',

      // 5. BranchSettings (Operativa: pagos, delivery, horarios)
      mp_public_key:
        branchSettings?.mpPublicKey || collapsed['mp_public_key'] || '',
      mp_access_token:
        branchSettings?.mpAccessToken || collapsed['mp_access_token'] || '',
      deliveryFee:
        branchSettings?.deliveryFee !== null && branchSettings?.deliveryFee !== undefined
          ? Number(branchSettings.deliveryFee)
          : Number(collapsed['deliveryFee']) || 0,
      activePaymentProvider: branchSettings?.activePaymentProvider || 'NONE',
      boldApiKey: branchSettings?.boldApiKey || '',
      boldSecretKey: branchSettings?.boldSecretKey || '',

      // 6. Business Hours (Horarios de atención — por sucursal)
      businessHours: branchSettings?.businessHours || null,

      // 7. TikTok Tracking (Solo Pixel ID público — el token JAMÁS se expone en HTTP responses)
      tiktokPixelId: tenantSettings?.tiktokPixelId || '',

      // 8. Branch context
      branchId: resolvedBranchId || null,
    };

    return finalConfig;
  }

  /**
   * Actualiza masivamente los ajustes enviados protegiendo que solo se graben para el tenant y llaves permitidas.
   * Ahora escribe a TenantSettings (global) y BranchSettings (operativa) según la naturaleza del campo.
   */
  async updateTenantConfig(
    tenantId: string,
    updateDto: UpdateTenantConfigDto,
    branchId?: string,
  ) {
    if (!updateDto || Object.keys(updateDto).length === 0) {
      return { success: true };
    }

    // 1. Filtrar llaves que van a tablas específicas (Tenant, BrandSettings, TenantSettings, BranchSettings)
    const specificKeys = [
      'tenant_name',
      'primary_color',
      'secondary_color',
      'mp_public_key',
      'mp_access_token',
      'deliveryFee',
      'waPhoneNumberId',
      'tenant_slug',
      'layout_type',
      'hero_image',
      'activePaymentProvider',
      'boldApiKey',
      'boldSecretKey',
      'businessHours',
      'storeName',
      'storeEmail',
      'tiktokPixelId',
      'tiktokAccessToken',
    ];

    const operations = Object.entries(updateDto)
      .filter(([key, value]) => {
        const isComplex = typeof value === 'object' && value !== null;
        return (
          value !== undefined && !specificKeys.includes(key) && !isComplex
        );
      })
      .map(([key, value]) => {
        return this.prisma.systemSetting.upsert({
          where: {
            tenantId_key: {
              tenantId,
              key,
            },
          },
          update: {
            value: value,
          },
          create: {
            tenantId,
            key,
            value: value,
            isPublic: true,
          },
        });
      });

    // Ejecutar SystemSettings upserts
    if (operations.length > 0) {
      await this.prisma.$transaction(operations);
    }

    // 2. Actualizar tabla Tenant
    if (updateDto.tenant_name || updateDto.storeName || updateDto.hero_image) {
      const dataToUpdate: any = {};
      if (updateDto.tenant_name || updateDto.storeName) {
        dataToUpdate.name = updateDto.tenant_name || updateDto.storeName;
      }

      if (Object.keys(dataToUpdate).length > 0) {
        await this.prisma.tenant.update({
          where: { id: tenantId },
          data: dataToUpdate,
        });
      }
    }

    // 3. Actualizar BrandSettings si hay cambios de apariencia
    if (
      updateDto.primary_color ||
      updateDto.secondary_color ||
      updateDto.hero_image !== undefined
    ) {
      await this.prisma.brandSettings.upsert({
        where: { tenantId },
        update: {
          primaryColor: updateDto.primary_color,
          secondaryColor: updateDto.secondary_color,
          authBgUrl: updateDto.hero_image,
        },
        create: {
          tenantId,
          primaryColor: updateDto.primary_color || '#09090b',
          secondaryColor: updateDto.secondary_color || '#f4f4f5',
          authBgUrl: updateDto.hero_image || '',
          layoutType: 'CLASSIC',
        },
      });
    }

    // 4. Actualizar TenantSettings (Global: WABA, storeName, storeEmail)
    if (
      updateDto.waPhoneNumberId !== undefined ||
      updateDto.storeName !== undefined ||
      updateDto.storeEmail !== undefined ||
      updateDto.tiktokPixelId !== undefined ||
      updateDto.tiktokAccessToken !== undefined
    ) {
      const waPhoneNumberId =
        updateDto.waPhoneNumberId !== undefined
          ? updateDto.waPhoneNumberId?.trim() || null
          : undefined;

      await this.prisma.tenantSettings.upsert({
        where: { tenantId },
        update: {
          ...(waPhoneNumberId !== undefined && { waPhoneNumberId }),
          ...(updateDto.storeName !== undefined && { storeName: updateDto.storeName }),
          ...(updateDto.storeEmail !== undefined && { storeEmail: updateDto.storeEmail }),
          ...(updateDto.tiktokPixelId !== undefined && { tiktokPixelId: updateDto.tiktokPixelId?.trim() || null }),
          ...(updateDto.tiktokAccessToken !== undefined && { tiktokAccessToken: updateDto.tiktokAccessToken?.trim() || null }),
        },
        create: {
          tenantId,
          storeName: updateDto.storeName,
          storeEmail: updateDto.storeEmail,
          waPhoneNumberId,
          tiktokPixelId: updateDto.tiktokPixelId?.trim() || null,
          tiktokAccessToken: updateDto.tiktokAccessToken?.trim() || null,
        },
      });
    }

    // 5. Actualizar BranchSettings (Operativa: pasarelas de pago, delivery, horarios)
    if (
      updateDto.mp_public_key !== undefined ||
      updateDto.mp_access_token !== undefined ||
      updateDto.deliveryFee !== undefined ||
      updateDto.activePaymentProvider !== undefined ||
      updateDto.boldApiKey !== undefined ||
      updateDto.boldSecretKey !== undefined ||
      updateDto.businessHours !== undefined
    ) {
      // Resolver branchId
      let resolvedBranchId = branchId;
      if (!resolvedBranchId) {
        const defaultBranch = await this.prisma.branch.findFirst({
          where: { tenantId, isDefault: true },
          select: { id: true },
        });
        resolvedBranchId = defaultBranch?.id;
      }

      if (resolvedBranchId) {
        await this.prisma.branchSettings.upsert({
          where: { branchId: resolvedBranchId },
          update: {
            ...(updateDto.mp_public_key !== undefined && { mpPublicKey: updateDto.mp_public_key }),
            ...(updateDto.mp_access_token !== undefined && { mpAccessToken: updateDto.mp_access_token }),
            ...(updateDto.deliveryFee !== undefined && { deliveryFee: Number(updateDto.deliveryFee) }),
            ...(updateDto.activePaymentProvider !== undefined && { activePaymentProvider: updateDto.activePaymentProvider as any }),
            ...(updateDto.boldApiKey !== undefined && { boldApiKey: updateDto.boldApiKey }),
            ...(updateDto.boldSecretKey !== undefined && { boldSecretKey: updateDto.boldSecretKey }),
            ...(updateDto.businessHours !== undefined && { businessHours: updateDto.businessHours }),
          },
          create: {
            tenantId,
            branchId: resolvedBranchId,
            mpPublicKey: updateDto.mp_public_key,
            mpAccessToken: updateDto.mp_access_token,
            deliveryFee: updateDto.deliveryFee !== undefined ? Number(updateDto.deliveryFee) : 0,
            activePaymentProvider: updateDto.activePaymentProvider as any || 'NONE',
            boldApiKey: updateDto.boldApiKey,
            boldSecretKey: updateDto.boldSecretKey,
            ...(updateDto.businessHours !== undefined && { businessHours: updateDto.businessHours }),
          },
        });
      }
    }

    this.logger.log(
      `[Tenant ${tenantId}] Settings masivos actualizados (System + Brand + TenantSettings + BranchSettings).`,
    );

    return { success: true };
  }
}
