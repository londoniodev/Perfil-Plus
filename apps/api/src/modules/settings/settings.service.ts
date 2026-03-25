import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateTenantConfigDto } from './dto/update-tenant-config.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todas las configuraciones del sistema/tienda de un tenant en un objeto colapsado
   */
  async getTenantConfig(tenantId: string) {
    const tenant = await this.prisma.secure.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, slug: true },
    });

    const settings = await this.prisma.secure.systemSetting.findMany({
      where: {
        tenantId,
      },
    });

    // Colapsar en un solo objeto para el frontend
    const collapsed = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    // Obtener BrandSettings (Colores y Apariencia)
    const brandSettings = await this.prisma.secure.brandSettings.findUnique({
      where: { tenantId },
    });

    // Obtener StoreSettings para incluir campos específicos
    const storeSettings = await (
      this.prisma.secure as any
    ).storeSettings.findFirst({
      where: { tenantId },
    });

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
      // 'theme' en la UI es light/dark/auto, se saca de SystemSetting (collapsed)
      theme: collapsed['theme'] || '', 
      // Si el frontend llegara a usar layoutType, se expone como layout_type
      layout_type: brandSettings?.layoutType || 'CLASSIC',
      
      // 4. StoreSettings (Mapeo explícito)
      mp_public_key: storeSettings?.mpPublicKey || collapsed['mp_public_key'] || '',
      mp_access_token: storeSettings?.mpAccessToken || collapsed['mp_access_token'] || '',
      waPhoneNumberId: storeSettings?.waPhoneNumberId || collapsed['waPhoneNumberId'] || '',
      deliveryFee: storeSettings?.deliveryFee !== null ? Number(storeSettings?.deliveryFee) : (Number(collapsed['deliveryFee']) || 0),
    };

    return finalConfig;
  }

  /**
   * Actualiza masivamente los ajustes enviados protegiendo que solo se graben para el tenant y llaves permitidas.
   */
  async updateTenantConfig(tenantId: string, updateDto: UpdateTenantConfigDto) {
    if (!updateDto || Object.keys(updateDto).length === 0) {
      return { success: true }; 
    }

    // 1. Filtrar llaves que van a tablas específicas (Tenant, BrandSettings, StoreSettings)
    const storeAndBrandKeys = [
      'tenant_name',
      'primary_color',
      'secondary_color',
      // 'theme' NO va aquí, va a SystemSetting porque es light/dark
      'mp_public_key',
      'mp_access_token',
      'deliveryFee',
      'waPhoneNumberId',
      'tenant_slug',
      'layout_type',
    ];

    const operations = Object.entries(updateDto)
      .filter(([key, value]) => {
        // Solo guardamos en SystemSetting si:
        // 1. El valor no es undefined
        // 2. NO es una de las llaves que van a tablas específicas
        // 3. No es un objeto complejo que el frontend envía por error
        const isComplex = typeof value === 'object' && value !== null;
        return value !== undefined && !storeAndBrandKeys.includes(key) && !isComplex;
      })
      .map(([key, value]) => {
        return this.prisma.secure.systemSetting.upsert({
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
    if (updateDto.tenant_name) {
      await this.prisma.secure.tenant.update({
        where: { id: tenantId },
        data: { name: updateDto.tenant_name },
      });
    }

    // 3. Actualizar BrandSettings si hay cambios de apariencia
    // Aquí solo manejamos colores por ahora, theme va a SystemSetting
    if (updateDto.primary_color || updateDto.secondary_color) {
      await this.prisma.secure.brandSettings.upsert({
        where: { tenantId },
        update: {
          primaryColor: updateDto.primary_color,
          secondaryColor: updateDto.secondary_color,
        },
        create: {
          tenantId,
          primaryColor: updateDto.primary_color || '#09090b',
          secondaryColor: updateDto.secondary_color || '#f4f4f5',
          layoutType: 'CLASSIC',
        },
      });
    }

    // 4. Actualizar StoreSettings (MercadoPago y Delivery)
    if (
      updateDto.mp_public_key !== undefined ||
      updateDto.mp_access_token !== undefined ||
      updateDto.deliveryFee !== undefined ||
      updateDto.waPhoneNumberId !== undefined
    ) {
      const storeSettings = await (this.prisma.secure as any).storeSettings.findFirst({
        where: { tenantId }
      });

      // Normalizar campos únicos para evitar conflictos P2002 (PostgreSQL UNIQUE permite múltiples NULL pero solo un "")
      const waPhoneNumberId = updateDto.waPhoneNumberId !== undefined 
        ? (updateDto.waPhoneNumberId?.trim() || null) 
        : undefined;
      const wabaId = updateDto.wabaId !== undefined 
        ? (updateDto.wabaId?.trim() || null) 
        : undefined;

      if (storeSettings) {
        await (this.prisma.secure as any).storeSettings.update({
          where: { id: storeSettings.id },
          data: {
            mpPublicKey: updateDto.mp_public_key,
            mpAccessToken: updateDto.mp_access_token,
            deliveryFee: updateDto.deliveryFee !== undefined ? Number(updateDto.deliveryFee) : undefined,
            waPhoneNumberId,
            wabaId,
          },
        });
      } else {
        await (this.prisma.secure as any).storeSettings.create({
          data: {
            tenantId,
            mpPublicKey: updateDto.mp_public_key,
            mpAccessToken: updateDto.mp_access_token,
            deliveryFee: updateDto.deliveryFee !== undefined ? Number(updateDto.deliveryFee) : 0,
            waPhoneNumberId,
            wabaId,
          },
        });
      }
    }

    this.logger.log(
      `[Tenant ${tenantId}] Settings masivos actualizados (System + Brand + Store).`,
    );

    return { success: true };
  }
}
