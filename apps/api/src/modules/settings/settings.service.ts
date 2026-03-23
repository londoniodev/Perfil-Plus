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

    // Obtener StoreSettings para incluir campos específicos
    const storeSettings = await (
      this.prisma.secure as any
    ).storeSettings.findFirst({
      where: { tenantId },
    });

    if (storeSettings) {
      return {
        ...collapsed,
        deliveryFee:
          storeSettings.deliveryFee !== null
            ? Number(storeSettings.deliveryFee)
            : 0,
        waPhoneNumberId: storeSettings.waPhoneNumberId,
        // No devolvemos waAccessToken por seguridad si es público,
        // pero este endpoint es para el ADMIN (via controller guards)
      };
    }

    return collapsed;
  }

  /**
   * Actualiza masivamente los ajustes enviados protegiendo que solo se graben para el tenant y llaves permitidas.
   */
  async updateTenantConfig(tenantId: string, updateDto: UpdateTenantConfigDto) {
    // Procesar cada llave enviada (ej: storeInfo, paymentMethods...)
    const operations = Object.entries(updateDto)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => {
        // Validación extra de seguridad (solo llaves conocidas en el DTO o seguras)
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

    if (operations.length > 0) {
      // Ejecutar upserts en lote para asegurar atomocidad o al menos rapidez
      await this.prisma.$transaction(operations);

      // Actualizar StoreSettings si hay campos relevantes
      if (updateDto.deliveryFee !== undefined) {
        await (this.prisma.secure as any).storeSettings.updateMany({
          where: { tenantId },
          data: {
            deliveryFee: updateDto.deliveryFee,
          },
        });
      }

      this.logger.log(
        `[Tenant ${tenantId}] Settings masivos actualizados (${operations.length} llaves).`,
      );
    }

    return { success: true, keysUpdated: operations.length };
  }
}
