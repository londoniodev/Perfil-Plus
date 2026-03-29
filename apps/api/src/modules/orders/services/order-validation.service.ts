import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class OrderValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async validateAndDeductStock(orderItemsData: any[], tx: any) {
    const stockDeductions = new Map<string, number>();

    for (const item of orderItemsData) {
      // -1 indica stock ilimitado (infinito). Solo validamos y deducimos si es >= 0.
      if (item.stockType >= 0) {
        if (item.stockType < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para ${item.productName} (${item.variantName})`,
          );
        }

        // Agregar a las deducciones
        const currentDeduction = stockDeductions.get(item.variantId) || 0;
        stockDeductions.set(item.variantId, currentDeduction + item.quantity);
      }

      for (const mod of item.modifiers) {
        // -1 indica stock ilimitado en modificadores. Solo validamos si es >= 0.
        if (
          mod.stock !== null &&
          mod.stock !== -1 &&
          mod.stock < mod.quantity
        ) {
          throw new BadRequestException(
            `Stock insuficiente para modificador ${mod.modifierName}`,
          );
        }
      }
    }

    // Ejecutar todas las deducciones de stock de manera concurrente
    const updatePromises = Array.from(stockDeductions.entries()).map(
      ([variantId, quantity]) =>
        tx.productVariant.update({
          where: { id: variantId },
          data: { stock: { decrement: quantity } },
        }),
    );

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }
  }

  async validateRestaurantAvailability(tenantId: string) {
    const storeSettings = await (
      this.prisma.secure as any
    ).storeSettings.findFirst({
      where: { tenantId },
      select: { businessHours: true },
    });

    const businessHours = storeSettings?.businessHours;

    // Si no hay configuración o no está habilitada la restricción, permitir
    if (!businessHours || !businessHours.enforceRestriction) {
      return true;
    }

    const timezone = businessHours.timezone || 'America/Bogota';

    // Obtener fecha/hora actual en la zona horaria del tenant
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      weekday: 'short',
    });

    const parts = formatter.formatToParts(now);
    const hourPart = parts.find((p) => p.type === 'hour')?.value || '00';
    const minutePart = parts.find((p) => p.type === 'minute')?.value || '00';
    const currentTime = `${hourPart}:${minutePart}`;

    // Obtener el día de la semana en la zona horaria del tenant
    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'narrow',
    });
    const dayOfWeekStr = dayFormatter.format(now);
    const dayMap: Record<string, number> = {
      S: 0,
      M: 1,
      T: 2,
      W: 3,
      R: 4, // Se maneja con más precisión abajo
      F: 5,
    };

    // Usar un enfoque más preciso para obtener el día
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const dateStr = dateFormatter.format(now);
    const localDate = new Date(dateStr);
    const currentDay = localDate.getDay(); // 0=Domingo, 6=Sábado

    const schedule = businessHours.schedule;
    if (!Array.isArray(schedule)) return true;

    const todaySchedule = schedule.find((s: any) => s.day === currentDay);

    if (!todaySchedule || !todaySchedule.isOpen) {
      throw new BadRequestException(
        'El restaurante está cerrado hoy. Por favor intenta en nuestro horario de atención.',
      );
    }

    // Verificar si la hora actual cae dentro de algún rango horario (soporte para horarios partidos)
    const timeRanges = todaySchedule.timeRanges;
    if (!Array.isArray(timeRanges) || timeRanges.length === 0) {
      return true;
    }

    const isWithinAnyRange = timeRanges.some(
      (range: any) =>
        currentTime >= range.openTime && currentTime <= range.closeTime,
    );

    if (!isWithinAnyRange) {
      const rangesStr = timeRanges
        .map((r: any) => `${r.openTime} - ${r.closeTime}`)
        .join(' y ');
      throw new BadRequestException(
        `El restaurante está fuera de horario. Nuestro horario de hoy es: ${rangesStr}`,
      );
    }

    return true;
  }
}
