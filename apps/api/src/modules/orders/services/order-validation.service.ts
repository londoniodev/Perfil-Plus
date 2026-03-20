import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class OrderValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async validateAndDeductStock(orderItemsData: any[], tx: any) {
    for (const item of orderItemsData) {
      if (item.stockType !== -1) {
        if (item.stockType < item.quantity) {
          throw new BadRequestException(`Stock insuficiente para ${item.productName} (${item.variantName})`);
        }
        // Deducción atómica dentro de la transacción
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      for (const mod of item.modifiers) {
        if (mod.stock !== null && mod.stock < mod.quantity) {
          throw new BadRequestException(`Stock insuficiente para modificador ${mod.modifierName}`);
        }
      }
    }
  }

  async validateRestaurantAvailability(tenantId: string) {
    // Espacio para futura validación de lógica de horarios de apertura y cierre
    // const settings = await this.prisma.storeSettings.findFirst({where: {tenantId}});
    return true;
  }
}
