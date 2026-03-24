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

    const finalConfig = {
      ...collapsed,
      tenant_name: tenant?.name || '',
      tenant_slug: tenant?.slug || '',
      // Mapeo de BrandSettings
      primary_color: brandSettings?.primaryColor || '#6366f1',
      secondary_color: brandSettings?.secondaryColor || '#a5a6f6',
      theme: brandSettings?.layoutType || '',
      
      // Mapeo de StoreSettings (MercadoPago y WhatsApp)
      mp_public_key: storeSettings?.mpPublicKey || '',
      mp_access_token: storeSettings?.mpAccessToken || '',
      waPhoneNumberId: storeSettings?.waPhoneNumberId || '',
      deliveryFee: storeSettings?.deliveryFee !== null ? Number(storeSettings?.deliveryFee) : 0,
    };

    return finalConfig;
  }

  /**
   * Actualiza masivamente los ajustes enviados protegiendo que solo se graben para el tenant y llaves permitidas.
   */
  async updateTenantConfig(tenantId: string, updateDto: UpdateTenantConfigDto) {
    // 1. Filtrar llaves que van a tablas específicas (Tenant, BrandSettings, StoreSettings)
    const systemSettingsKeys = [
      'tenant_name',
      'primary_color',
      'secondary_color',
      'theme',
      'mp_public_key',
      'mp_access_token',
      'deliveryFee',
      'waPhoneNumberId',
    ];

    const operations = Object.entries(updateDto)
      .filter(([key, value]) => value !== undefined && !systemSettingsKeys.includes(key))
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
    if (updateDto.primary_color || updateDto.secondary_color) {
      await this.prisma.secure.brandSettings.upsert({
        where: { tenantId },
        update: {
          primaryColor: updateDto.primary_color,
          secondaryColor: updateDto.secondary_color,
        },
        create: {
          tenantId,
          primaryColor: updateDto.primary_color || '#6366f1',
          secondaryColor: updateDto.secondary_color || '#a5a6f6',
        },
      });
    }

    // 3. Actualizar StoreSettings (MercadoPago y Delivery)
    if (
      updateDto.mp_public_key !== undefined ||
      updateDto.mp_access_token !== undefined ||
      updateDto.deliveryFee !== undefined ||
      updateDto.waPhoneNumberId !== undefined
    ) {
      const storeSettings = await (this.prisma.secure as any).storeSettings.findFirst({
        where: { tenantId }
      });

      if (storeSettings) {
        await (this.prisma.secure as any).storeSettings.update({
          where: { id: storeSettings.id },
          data: {
            mpPublicKey: updateDto.mp_public_key,
            mpAccessToken: updateDto.mp_access_token,
            deliveryFee: updateDto.deliveryFee !== undefined ? Number(updateDto.deliveryFee) : undefined,
            waPhoneNumberId: updateDto.waPhoneNumberId,
          },
        });
      } else {
        await (this.prisma.secure as any).storeSettings.create({
          data: {
            tenantId,
            mpPublicKey: updateDto.mp_public_key,
            mpAccessToken: updateDto.mp_access_token,
            deliveryFee: updateDto.deliveryFee !== undefined ? Number(updateDto.deliveryFee) : 0,
            waPhoneNumberId: updateDto.waPhoneNumberId,
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
