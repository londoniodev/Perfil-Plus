import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class WaCartCronService {
  private readonly logger = new Logger(WaCartCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecutar todos los días a las 3:00 AM.
   * Elimina los carritos (WaCart) cuya fecha de expiración haya sido hace más de 48 horas.
   * Esto evita que la tabla crezca infinitamente con carritos abandonados temporales.
   */
  @Cron('0 3 * * *')
  async cleanExpiredCarts() {
    this.logger.log('🧹 [CRON] Iniciando limpieza de carritos de WhatsApp antiguos...');
    
    try {
      // Calculamos la fecha límite (hace 48 horas exactas desde este momento)
      // Como el expiresAt ya se crea con +24h, restar 48h desde AHORA
      // significa que fueron creados hace 72h.
      // Para simplificar, buscaremos los que expiraron hace más de 24 horas a partir de ahora,
      // que sumando las 24h de validez darían exactamente 48h de antigüedad.
      const cutOffDate = new Date();
      cutOffDate.setHours(cutOffDate.getHours() - 24); // Expirados hace al menos 24 horas

      // No podemos usar this.prisma.secure aquí porque es un CRON global sin contexto de tenant
      const result = await (this.prisma.secure as any).waCart.deleteMany({
        where: {
          expiresAt: {
            lt: cutOffDate
          }
        }
      });

      this.logger.log(`✅ [CRON] Limpieza completada. ${result.count} carritos antiguos eliminados.`);
    } catch (error) {
      this.logger.error(`❌ [CRON] Fallo durante la limpieza de carritos: ${error.message}`);
    }
  }
}
