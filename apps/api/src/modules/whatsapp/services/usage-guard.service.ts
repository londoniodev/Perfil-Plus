import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UsageGuardService {
  private readonly logger = new Logger(UsageGuardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkAiLimit(tenantId: string): Promise<boolean> {
    // 1. Obtener límite (aiMonthlyLimit) desde TenantSettings, por defecto 100
    const tenantSettings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    const monthlyLimit = (tenantSettings as any)?.aiMonthlyLimit ?? 100;

    // 2. Determinar inicio de mes y fin de mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(startOfMonth.getMonth() + 1);

    // 3. Contar mensajes respondidos por el bot (ASSISTANT) este mes
    const usageCount = await (this.prisma as any).waMessage.count({
      where: {
        role: 'ASSISTANT',
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
        conversation: {
          tenantId: tenantId,
        },
      },
    });

    if (usageCount >= monthlyLimit) {
      this.logger.warn(
        `[Tenant: ${tenantId}] Límite mensual de IA alcanzado (${usageCount}/${monthlyLimit})`,
      );
      return false; // NO permitir llamada a IA
    }

    this.logger.debug(
      `[Tenant: ${tenantId}] Consumo IA: ${usageCount}/${monthlyLimit}`,
    );
    return true; // OK permitir
  }
}
