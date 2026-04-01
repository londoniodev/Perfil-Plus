import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateOrderItemDto } from '../dto/create-order.dto';

export interface CalculatedOrderItems {
  totalAmount: Decimal;
  orderItemsData: Array<{
    variantId: string;
    quantity: number;
    price: Decimal;
    productName: string;
    variantName: string | null;
    notes: string | null;
    modifiers: Array<{
      modifierId: string;
      modifierName: string;
      priceAdjustment: Decimal;
      quantity: number;
      stock: number | null;
    }>;
    stockType: number;
    productId: string;
  }>;
}

@Injectable()
export class OrderPricingService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ tenantId eliminado de la firma — this.prisma inyecta el contexto automáticamente
  async calculate(items: CreateOrderItemDto[]): Promise<CalculatedOrderItems> {
    let totalAmount = new Decimal(0);
    const orderItemsData: any[] = [];

    // Pre-fetch all variants to avoid N+1 queries
    const variantIds = items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: {
          include: { modifierGroups: { include: { modifiers: true } } },
        },
      },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Pre-fetch fallback modifiers to avoid N+1 queries for modifiers not found in product groups
    const allModifierIds = items.flatMap((item) =>
      (item.modifiers || []).map((m) => m.modifierId),
    );
    let fallbackModifierMap = new Map();

    if (allModifierIds.length > 0) {
      const fallbackModifiers = await this.prisma.modifier.findMany({
        where: { id: { in: allModifierIds } },
      });
      fallbackModifierMap = new Map(fallbackModifiers.map((m) => [m.id, m]));
    }

    for (const item of items) {
      // ✅ Usar variante pre-cargada
      const variant = variantMap.get(item.variantId);

      if (!variant) {
        throw new NotFoundException(
          `Variante no encontrada: ${item.variantId}`,
        );
      }

      if (!variant.product.published || !variant.product.isAvailable) {
        throw new BadRequestException(
          `Producto no disponible: ${variant.product.name}`,
        );
      }

      let itemPrice = variant.price;
      const modifiersData: any[] = [];

      if (item.modifiers && item.modifiers.length > 0) {
        for (const mod of item.modifiers) {
          let dbModifier: any = null;

          for (const group of variant.product.modifierGroups) {
            const match = group.modifiers.find((m) => m.id === mod.modifierId);
            if (match) {
              dbModifier = match;
              break;
            }
          }

          if (!dbModifier) {
            // ✅ Usar fallback precargado
            dbModifier = fallbackModifierMap.get(mod.modifierId);
          }

          if (!dbModifier) continue;

          if (!dbModifier.isAvailable) {
            throw new BadRequestException(
              `Modificador no disponible: ${dbModifier.name}`,
            );
          }

          itemPrice = itemPrice.plus(
            dbModifier.priceAdjustment.times(mod.quantity),
          );
          modifiersData.push({
            modifierId: dbModifier.id,
            modifierName: dbModifier.name,
            priceAdjustment: dbModifier.priceAdjustment,
            quantity: mod.quantity,
            stock: dbModifier.stock,
          });
        }
      }

      // Validar constraints de selección por grupo
      for (const group of variant.product.modifierGroups) {
        const selectedInGroup =
          item.modifiers?.filter((m) =>
            group.modifiers.some((gm) => gm.id === m.modifierId),
          ) || [];

        const totalSelected = selectedInGroup.reduce(
          (sum, m) => sum + m.quantity,
          0,
        );

        if (totalSelected < group.minSelect) {
          throw new BadRequestException(
            `El grupo ${group.name} requiere mínimo ${group.minSelect} selecciones.`,
          );
        }
        if (totalSelected > group.maxSelect) {
          throw new BadRequestException(
            `El grupo ${group.name} permite máximo ${group.maxSelect} selecciones.`,
          );
        }
      }

      totalAmount = totalAmount.plus(itemPrice.times(item.quantity));

      orderItemsData.push({
        variantId: variant.id,
        quantity: item.quantity,
        price: itemPrice,
        productName: variant.product.name,
        variantName: variant.name,
        notes: item.notes || null,
        modifiers: modifiersData,
        stockType: variant.stock,
        productId: variant.product.id,
      });
    }

    return { totalAmount, orderItemsData };
  }
}
