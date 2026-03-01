import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MovementType, AdjustmentType, CountStatus } from '@prisma/client';
import { CreateInventoryCountDto, CompleteInventoryCountDto } from './dto/inventory-count.dto';

@Injectable()
export class InventoryCountsService {
    private readonly logger = new Logger(InventoryCountsService.name);

    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, userId: string, dto: CreateInventoryCountDto) {
        // Verify warehouse
        const warehouse = await this.prisma.warehouse.findFirst({
            where: { id: dto.warehouseId, tenantId },
        });
        if (!warehouse) throw new NotFoundException('Almacén no encontrado');

        // Get all active inventory items and their current stock in this warehouse
        const items = await this.prisma.inventoryItem.findMany({
            where: { tenantId, isActive: true },
            include: {
                stock: {
                    where: { warehouseId: dto.warehouseId },
                },
            },
            orderBy: { name: 'asc' },
        });

        // Create count with pre-populated lines (system stock snapshot)
        return this.prisma.inventoryCount.create({
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
        return this.prisma.inventoryCount.findMany({
            where: { tenantId },
            include: {
                warehouse: { select: { id: true, name: true } },
                _count: { select: { lines: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, tenantId: string) {
        const count = await this.prisma.inventoryCount.findFirst({
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
        const count = await this.prisma.inventoryCount.findFirst({
            where: { id, tenantId, status: CountStatus.DRAFT },
            include: { lines: true },
        });
        if (!count) {
            throw new NotFoundException('Conteo no encontrado o ya fue completado');
        }

        return this.prisma.$transaction(async (tx) => {
            for (const lineDto of dto.lines) {
                const existingLine = count.lines.find(
                    (l) => l.inventoryItemId === lineDto.inventoryItemId,
                );
                if (!existingLine) continue;

                const difference = lineDto.countedStock - Number(existingLine.systemStock);

                // Update count line
                await tx.inventoryCountLine.update({
                    where: { id: existingLine.id },
                    data: {
                        countedStock: lineDto.countedStock,
                        difference,
                        adjustmentType: difference !== 0
                            ? (lineDto.adjustmentType || AdjustmentType.MERMA)
                            : null,
                    },
                });

                // If there's a difference, create adjustment movement and update stock
                if (difference !== 0) {
                    await tx.inventoryMovement.create({
                        data: {
                            tenantId,
                            inventoryItemId: lineDto.inventoryItemId,
                            warehouseId: count.warehouseId,
                            type: MovementType.ADJUSTMENT,
                            quantity: difference,
                            reason: `Ajuste por conteo físico (${difference > 0 ? 'sobrante' : lineDto.adjustmentType === 'FUGA' ? 'fuga' : 'merma'})`,
                            reference: id,
                            createdBy: userId,
                        },
                    });

                    // Update warehouse stock to match counted value
                    await tx.warehouseStock.upsert({
                        where: {
                            warehouseId_inventoryItemId: {
                                warehouseId: count.warehouseId,
                                inventoryItemId: lineDto.inventoryItemId,
                            },
                        },
                        create: {
                            warehouseId: count.warehouseId,
                            inventoryItemId: lineDto.inventoryItemId,
                            currentStock: lineDto.countedStock,
                        },
                        update: {
                            currentStock: lineDto.countedStock,
                        },
                    });
                }
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
        const count = await this.prisma.inventoryCount.findFirst({
            where: { id, tenantId, status: CountStatus.DRAFT },
        });
        if (!count) {
            throw new NotFoundException('Conteo no encontrado o ya fue completado');
        }

        return this.prisma.inventoryCount.delete({ where: { id } });
    }
}
