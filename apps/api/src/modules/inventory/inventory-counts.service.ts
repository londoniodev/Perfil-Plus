import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MovementType, AdjustmentType, CountStatus } from '@prisma/client';
import {
  CreateInventoryCountDto,
  CompleteInventoryCountDto,
} from './dto/inventory-count.dto';

@Injectable()
export class InventoryCountsService {
  private readonly logger = new Logger(InventoryCountsService.name);

  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateInventoryCountDto) {
    // Verify warehouse
    const warehouse = await this.prisma.secure.warehouse.findFirst({
      where: { id: dto.warehouseId, tenantId },
    });
    if (!warehouse) throw new NotFoundException('Almacén no encontrado');

    // Get all active inventory items and their current stock in this warehouse
    const items = await this.prisma.secure.inventoryItem.findMany({
      where: { tenantId, isActive: true },
      include: {
        stock: {
          where: { warehouseId: dto.warehouseId },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Create count with pre-populated lines (system stock snapshot)
    return this.prisma.secure.inventoryCount.create({
      data: {
        tenantId,
        warehouseId: dto.warehouseId,
        countedBy: userId,
        notes: dto.notes,
        status: CountStatus.DRAFT,
        lines: {
          create: items.map((item) => ({
            inventoryItemId: item.id,
            systemStock: item.stock[0]?.currentStock ?? 0,
          })),
        },
      },
      include: {
        warehouse: { select: { id: true, name: true } },
        lines: {
          include: {
            inventoryItem: { select: { id: true, name: true, unit: true } },
          },
          orderBy: { inventoryItem: { name: 'asc' } },
        },
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.secure.inventoryCount.findMany({
      where: { tenantId },
      include: {
        warehouse: { select: { id: true, name: true } },
        _count: { select: { lines: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const count = await this.prisma.secure.inventoryCount.findFirst({
      where: { id, tenantId },
      include: {
        warehouse: { select: { id: true, name: true } },
        lines: {
          include: {
            inventoryItem: { select: { id: true, name: true, unit: true } },
          },
          orderBy: { inventoryItem: { name: 'asc' } },
        },
      },
    });
    if (!count) throw new NotFoundException('Conteo no encontrado');
    return count;
  }

  async complete(
    id: string,
    tenantId: string,
    userId: string,
    dto: CompleteInventoryCountDto,
  ) {
    const count = await this.prisma.secure.inventoryCount.findFirst({
      where: { id, tenantId, status: CountStatus.DRAFT },
      include: { lines: true },
    });
    if (!count) {
      throw new NotFoundException('Conteo no encontrado o ya fue completado');
    }

    return this.prisma.$transaction(async (tx) => {
      // Paso 1: Preparar datos y calcular diferencias
      const updates: {
        lineId: string;
        inventoryItemId: string;
        countedStock: number;
        diff: number;
        adjustmentType?: AdjustmentType;
      }[] = [];

      for (const lineDto of dto.lines) {
        const existingLine = count.lines.find(
          (l) => l.inventoryItemId === lineDto.inventoryItemId,
        );
        if (!existingLine) continue;

        const diff = lineDto.countedStock - Number(existingLine.systemStock);
        updates.push({
          lineId: existingLine.id,
          inventoryItemId: lineDto.inventoryItemId,
          countedStock: lineDto.countedStock,
          diff,
          adjustmentType: lineDto.adjustmentType,
        });
      }

      // Paso 2: Batch update de countLines (paralelo)
      await Promise.all(
        updates.map((u) =>
          tx.inventoryCountLine.update({
            where: { id: u.lineId },
            data: {
              countedStock: u.countedStock,
              difference: u.diff,
              adjustmentType:
                u.diff !== 0 ? u.adjustmentType || AdjustmentType.MERMA : null,
            },
          }),
        ),
      );

      // Paso 3: Batch createMany para movements (1 query)
      const withDiff = updates.filter((u) => u.diff !== 0);
      if (withDiff.length > 0) {
        await tx.inventoryMovement.createMany({
          data: withDiff.map((u) => ({
            tenantId,
            inventoryItemId: u.inventoryItemId,
            warehouseId: count.warehouseId,
            type: MovementType.ADJUSTMENT,
            quantity: u.diff,
            reason: `Ajuste por conteo físico (${u.diff > 0 ? 'sobrante' : u.adjustmentType === 'FUGA' ? 'fuga' : 'merma'})`,
            reference: id,
            createdBy: userId,
          })),
        });

        // Paso 4: Batch upserts de stock (paralelo)
        await Promise.all(
          withDiff.map((u) =>
            tx.warehouseStock.upsert({
              where: {
                warehouseId_inventoryItemId: {
                  warehouseId: count.warehouseId,
                  inventoryItemId: u.inventoryItemId,
                },
              },
              create: {
                warehouseId: count.warehouseId,
                inventoryItemId: u.inventoryItemId,
                currentStock: u.countedStock,
              },
              update: {
                currentStock: u.countedStock,
              },
            }),
          ),
        );
      }

      // Mark count as completed
      const completed = await tx.inventoryCount.update({
        where: { id },
        data: {
          status: CountStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: {
          warehouse: { select: { id: true, name: true } },
          lines: {
            include: {
              inventoryItem: { select: { id: true, name: true, unit: true } },
            },
          },
        },
      });

      this.logger.log(`Conteo ${id} completado con ${dto.lines.length} líneas`);

      return completed;
    });
  }

  async delete(id: string, tenantId: string) {
    const count = await this.prisma.secure.inventoryCount.findFirst({
      where: { id, tenantId, status: CountStatus.DRAFT },
    });
    if (!count) {
      throw new NotFoundException('Conteo no encontrado o ya fue completado');
    }

    return this.prisma.secure.inventoryCount.delete({ where: { id } });
  }
}
