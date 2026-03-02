import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { MovementType } from '@prisma/client';
import {
    CreateInventoryItemDto,
    UpdateInventoryItemDto,
    CreateWarehouseDto,
    StockEntryDto,
    StockExitDto,
    StockTransferDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name);

    constructor(private prisma: PrismaService) { }

    // ================================================================
    // WAREHOUSES
    // ================================================================

    async createWarehouse(tenantId: string, dto: CreateWarehouseDto) {
        // If setting as default, unset other defaults first
        if (dto.isDefault) {
            await this.prisma.warehouse.updateMany({
                where: { tenantId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return this.prisma.warehouse.create({
            data: {
                tenantId,
                name: dto.name,
                isDefault: dto.isDefault ?? false,
            },
        });
    }

    async findAllWarehouses(tenantId: string) {
        return this.prisma.warehouse.findMany({
            where: { tenantId },
            orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
            include: {
                _count: { select: { stock: true } },
            },
        });
    }

    async getDefaultWarehouse(tenantId: string) {
        let warehouse = await this.prisma.warehouse.findFirst({
            where: { tenantId, isDefault: true },
        });

        // Auto-create default warehouse if none exists
        if (!warehouse) {
            warehouse = await this.prisma.warehouse.create({
                data: {
                    tenantId,
                    name: 'Cocina Principal',
                    isDefault: true,
                },
            });
            this.logger.log(`Auto-created default warehouse for tenant ${tenantId}`);
        }

        return warehouse;
    }

    async updateWarehouse(id: string, tenantId: string, dto: CreateWarehouseDto) {
        const warehouse = await this.prisma.warehouse.findFirst({
            where: { id, tenantId },
        });
        if (!warehouse) throw new NotFoundException('Almacén no encontrado');

        if (dto.isDefault) {
            await this.prisma.warehouse.updateMany({
                where: { tenantId, isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }

        return this.prisma.warehouse.update({
            where: { id },
            data: { name: dto.name, isDefault: dto.isDefault },
        });
    }

    async deleteWarehouse(id: string, tenantId: string) {
        const warehouse = await this.prisma.warehouse.findFirst({
            where: { id, tenantId },
            include: { _count: { select: { stock: true, movements: true } } },
        });
        if (!warehouse) throw new NotFoundException('Almacén no encontrado');
        if (warehouse.isDefault) {
            throw new BadRequestException('No se puede eliminar el almacén por defecto');
        }
        if (warehouse._count.stock > 0) {
            throw new BadRequestException('El almacén tiene stock. Transfiera los ingredientes primero.');
        }

        return this.prisma.warehouse.delete({ where: { id } });
    }

    // ================================================================
    // INVENTORY ITEMS (Ingredientes)
    // ================================================================

    async createItem(tenantId: string, dto: CreateInventoryItemDto) {
        return this.prisma.inventoryItem.create({
            data: {
                tenantId,
                name: dto.name,
                sku: dto.sku,
                unit: dto.unit ?? 'UN',
                minStock: dto.minStock ?? 0,
                isActive: dto.isActive ?? true,
            },
        });
    }

    async findAllItems(tenantId: string, includeInactive = false, take = 100, skip = 0) {
        return this.prisma.inventoryItem.findMany({
            where: {
                tenantId,
                ...(includeInactive ? {} : { isActive: true }),
            },
            include: {
                stock: {
                    include: { warehouse: { select: { id: true, name: true } } },
                },
            },
            orderBy: { name: 'asc' },
            take,
            skip,
        });
    }

    async findOneItem(id: string, tenantId: string) {
        const item = await this.prisma.inventoryItem.findFirst({
            where: { id, tenantId },
            include: {
                stock: {
                    include: { warehouse: { select: { id: true, name: true } } },
                },
                movements: {
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                    include: { warehouse: { select: { id: true, name: true } } },
                },
            },
        });
        if (!item) throw new NotFoundException('Ingrediente no encontrado');
        return item;
    }

    async updateItem(id: string, tenantId: string, dto: UpdateInventoryItemDto) {
        const item = await this.prisma.inventoryItem.findFirst({
            where: { id, tenantId },
        });
        if (!item) throw new NotFoundException('Ingrediente no encontrado');

        return this.prisma.inventoryItem.update({
            where: { id },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.sku !== undefined ? { sku: dto.sku } : {}),
                ...(dto.unit !== undefined ? { unit: dto.unit } : {}),
                ...(dto.minStock !== undefined ? { minStock: dto.minStock } : {}),
                ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
            },
        });
    }

    async deleteItem(id: string, tenantId: string) {
        const item = await this.prisma.inventoryItem.findFirst({
            where: { id, tenantId },
            include: {
                stock: { where: { currentStock: { gt: 0 } } },
                ingredients: true,
            },
        });
        if (!item) throw new NotFoundException('Ingrediente no encontrado');
        if (item.ingredients.length > 0) {
            throw new BadRequestException(
                'Este ingrediente está asociado a recetas. Elimine las recetas primero.',
            );
        }

        // Soft-delete by deactivating
        return this.prisma.inventoryItem.update({
            where: { id },
            data: { isActive: false },
        });
    }

    // ================================================================
    // STOCK MOVEMENTS
    // ================================================================

    async addStockEntry(tenantId: string, userId: string, dto: StockEntryDto) {
        return this.prisma.$transaction(async (tx) => {
            const item = await tx.inventoryItem.findFirst({
                where: { id: dto.inventoryItemId, tenantId },
            });
            if (!item) throw new NotFoundException('Ingrediente no encontrado');

            const warehouse = await tx.warehouse.findFirst({
                where: { id: dto.warehouseId, tenantId },
            });
            if (!warehouse) throw new NotFoundException('Almacén no encontrado');

            // 1. Create movement record
            await tx.inventoryMovement.create({
                data: {
                    tenantId,
                    inventoryItemId: dto.inventoryItemId,
                    warehouseId: dto.warehouseId,
                    type: MovementType.ENTRY,
                    quantity: dto.quantity,
                    unitCost: dto.unitCost,
                    reason: dto.reason || 'Entrada manual',
                    createdBy: userId,
                },
            });

            // 2. Upsert warehouse stock
            await tx.warehouseStock.upsert({
                where: {
                    warehouseId_inventoryItemId: {
                        warehouseId: dto.warehouseId,
                        inventoryItemId: dto.inventoryItemId,
                    },
                },
                create: {
                    warehouseId: dto.warehouseId,
                    inventoryItemId: dto.inventoryItemId,
                    currentStock: dto.quantity,
                },
                update: {
                    currentStock: { increment: dto.quantity },
                },
            });

            // 3. Recalculate weighted average cost
            const updatedItem = await this.recalculateAvgCost(
                tx,
                dto.inventoryItemId,
                dto.quantity,
                dto.unitCost,
            );

            this.logger.log(
                `Stock entry: +${dto.quantity} ${item.unit} of "${item.name}" to ${warehouse.name}`,
            );

            return updatedItem;
        });
    }

    async addStockExit(tenantId: string, userId: string, dto: StockExitDto) {
        return this.prisma.$transaction(async (tx) => {
            const item = await tx.inventoryItem.findFirst({
                where: { id: dto.inventoryItemId, tenantId },
            });
            if (!item) throw new NotFoundException('Ingrediente no encontrado');

            // Verify stock availability
            const warehouseStock = await tx.warehouseStock.findUnique({
                where: {
                    warehouseId_inventoryItemId: {
                        warehouseId: dto.warehouseId,
                        inventoryItemId: dto.inventoryItemId,
                    },
                },
            });

            if (!warehouseStock || Number(warehouseStock.currentStock) < dto.quantity) {
                throw new BadRequestException(
                    `Stock insuficiente de "${item.name}" en este almacén. Disponible: ${warehouseStock?.currentStock ?? 0}`,
                );
            }

            // 1. Create movement
            await tx.inventoryMovement.create({
                data: {
                    tenantId,
                    inventoryItemId: dto.inventoryItemId,
                    warehouseId: dto.warehouseId,
                    type: MovementType.EXIT,
                    quantity: -dto.quantity, // Negative for exits
                    reason: dto.reason || 'Salida manual',
                    createdBy: userId,
                },
            });

            // 2. Decrement warehouse stock
            await tx.warehouseStock.update({
                where: {
                    warehouseId_inventoryItemId: {
                        warehouseId: dto.warehouseId,
                        inventoryItemId: dto.inventoryItemId,
                    },
                },
                data: {
                    currentStock: { decrement: dto.quantity },
                },
            });

            this.logger.log(
                `Stock exit: -${dto.quantity} ${item.unit} of "${item.name}"`,
            );

            return { success: true };
        });
    }

    async transferStock(tenantId: string, userId: string, dto: StockTransferDto) {
        if (dto.fromWarehouseId === dto.toWarehouseId) {
            throw new BadRequestException('Los almacenes de origen y destino deben ser diferentes');
        }

        return this.prisma.$transaction(async (tx) => {
            const item = await tx.inventoryItem.findFirst({
                where: { id: dto.inventoryItemId, tenantId },
            });
            if (!item) throw new NotFoundException('Ingrediente no encontrado');

            // Verify source stock
            const sourceStock = await tx.warehouseStock.findUnique({
                where: {
                    warehouseId_inventoryItemId: {
                        warehouseId: dto.fromWarehouseId,
                        inventoryItemId: dto.inventoryItemId,
                    },
                },
            });

            if (!sourceStock || Number(sourceStock.currentStock) < dto.quantity) {
                throw new BadRequestException(
                    `Stock insuficiente en el almacén de origen. Disponible: ${sourceStock?.currentStock ?? 0}`,
                );
            }

            // 1. Create movement records (EXIT from source, ENTRY to destination)
            await tx.inventoryMovement.createMany({
                data: [
                    {
                        tenantId,
                        inventoryItemId: dto.inventoryItemId,
                        warehouseId: dto.fromWarehouseId,
                        type: MovementType.TRANSFER,
                        quantity: -dto.quantity,
                        reason: dto.reason || 'Traspaso entre almacenes',
                        createdBy: userId,
                    },
                    {
                        tenantId,
                        inventoryItemId: dto.inventoryItemId,
                        warehouseId: dto.toWarehouseId,
                        type: MovementType.TRANSFER,
                        quantity: dto.quantity,
                        reason: dto.reason || 'Traspaso entre almacenes',
                        createdBy: userId,
                    },
                ],
            });

            // 2. Decrement source
            await tx.warehouseStock.update({
                where: {
                    warehouseId_inventoryItemId: {
                        warehouseId: dto.fromWarehouseId,
                        inventoryItemId: dto.inventoryItemId,
                    },
                },
                data: { currentStock: { decrement: dto.quantity } },
            });

            // 3. Upsert destination
            await tx.warehouseStock.upsert({
                where: {
                    warehouseId_inventoryItemId: {
                        warehouseId: dto.toWarehouseId,
                        inventoryItemId: dto.inventoryItemId,
                    },
                },
                create: {
                    warehouseId: dto.toWarehouseId,
                    inventoryItemId: dto.inventoryItemId,
                    currentStock: dto.quantity,
                },
                update: {
                    currentStock: { increment: dto.quantity },
                },
            });

            this.logger.log(
                `Stock transfer: ${dto.quantity} ${item.unit} of "${item.name}"`,
            );

            return { success: true };
        });
    }

    // ================================================================
    // DEDUCT BY ORDER (called from OrdersService)
    // ================================================================

    async deductByOrder(
        tenantId: string,
        orderId: string,
        items: Array<{ productId: string; quantity: number }>,
        tx?: any, // Prisma transaction client
    ) {
        const prisma = tx || this.prisma;
        const defaultWarehouse = await this.getDefaultWarehouseId(tenantId, prisma);

        // Batch: collect all productIds and fetch their recipes in one query
        const productIds = items.map((i) => i.productId);

        type RecipeWithIngredients = {
            productId: string;
            yield: number;
            ingredients: Array<{
                inventoryItemId: string;
                quantity: any;
                wasteFactor: any;
                inventoryItem: { name: string; minStock: any };
            }>;
        };

        const recipes: RecipeWithIngredients[] = await prisma.recipe.findMany({
            where: { productId: { in: productIds } },
            include: {
                ingredients: {
                    include: {
                        inventoryItem: { select: { name: true, minStock: true } },
                    },
                },
            },
        });

        // Index recipes by productId for O(1) lookup
        const recipeMap = new Map<string, RecipeWithIngredients>(
            recipes.map((r) => [r.productId, r]),
        );

        // Build flat array of deductions
        const deductions: Array<{
            inventoryItemId: string;
            deductQty: number;
            itemName: string;
            minStock: number;
        }> = [];

        for (const orderItem of items) {
            const recipe = recipeMap.get(orderItem.productId);
            if (!recipe) continue; // No recipe — skip

            const portionMultiplier = orderItem.quantity / recipe.yield;

            for (const ing of recipe.ingredients) {
                deductions.push({
                    inventoryItemId: ing.inventoryItemId,
                    deductQty:
                        Number(ing.quantity) *
                        Number(ing.wasteFactor) *
                        portionMultiplier,
                    itemName: ing.inventoryItem.name,
                    minStock: Number(ing.inventoryItem.minStock),
                });
            }
        }

        if (deductions.length === 0) return { alerts: [] };

        // Execute all movements + decrements atomically (already inside tx)
        // Group movements by inventoryItemId to batch create
        const movementData = deductions.map((d) => ({
            tenantId,
            inventoryItemId: d.inventoryItemId,
            warehouseId: defaultWarehouse,
            type: MovementType.SALE,
            quantity: -d.deductQty,
            reason: `Venta orden ${orderId}`,
            reference: orderId,
        }));

        await prisma.inventoryMovement.createMany({ data: movementData });

        // Atomic decrement per ingredient (Postgres handles concurrency at row level)
        for (const d of deductions) {
            await prisma.warehouseStock.upsert({
                where: {
                    warehouseId_inventoryItemId: {
                        warehouseId: defaultWarehouse,
                        inventoryItemId: d.inventoryItemId,
                    },
                },
                create: {
                    warehouseId: defaultWarehouse,
                    inventoryItemId: d.inventoryItemId,
                    currentStock: -d.deductQty,
                },
                update: {
                    currentStock: { decrement: d.deductQty },
                },
            });
        }

        // Low-stock check: delegated to Postgres in a single query
        // instead of N SELECTs per ingredient
        const uniqueItemIds = [...new Set(deductions.map((d) => d.inventoryItemId))];
        const lowStockRows: Array<{ id: string; name: string; total_stock: number; min_stock: number }> =
            await prisma.$queryRaw`
                SELECT ii."id", ii."name",
                       COALESCE(SUM(ws."currentStock"), 0)::float AS total_stock,
                       ii."minStock"::float AS min_stock
                FROM "InventoryItem" ii
                LEFT JOIN "WarehouseStock" ws ON ws."inventoryItemId" = ii."id"
                WHERE ii."id" = ANY(${uniqueItemIds})
                  AND ii."minStock" > 0
                GROUP BY ii."id", ii."name", ii."minStock"
                HAVING COALESCE(SUM(ws."currentStock"), 0) <= ii."minStock"
            `;

        const alerts = lowStockRows.map((r) => ({
            itemName: r.name,
            currentStock: r.total_stock,
            minStock: r.min_stock,
        }));

        if (alerts.length > 0) {
            this.logger.warn(
                `⚠️ Stock bajo: ${alerts.map((a) => `${a.itemName} (${a.currentStock}/${a.minStock})`).join(', ')}`,
            );
        }

        return { alerts };
    }

    // ================================================================
    // RESTORE STOCK (on order cancellation)
    // ================================================================

    async restoreByOrder(tenantId: string, orderId: string, tx?: any) {
        const prisma = tx || this.prisma;

        // Find all SALE movements for this order
        const movements = await prisma.inventoryMovement.findMany({
            where: {
                tenantId,
                reference: orderId,
                type: MovementType.SALE,
            },
        });

        for (const movement of movements) {
            const restoreQty = Math.abs(Number(movement.quantity));

            // Restore stock
            await prisma.warehouseStock.upsert({
                where: {
                    warehouseId_inventoryItemId: {
                        warehouseId: movement.warehouseId,
                        inventoryItemId: movement.inventoryItemId,
                    },
                },
                create: {
                    warehouseId: movement.warehouseId,
                    inventoryItemId: movement.inventoryItemId,
                    currentStock: restoreQty,
                },
                update: {
                    currentStock: { increment: restoreQty },
                },
            });

            // Create reverse movement
            await prisma.inventoryMovement.create({
                data: {
                    tenantId,
                    inventoryItemId: movement.inventoryItemId,
                    warehouseId: movement.warehouseId,
                    type: MovementType.ADJUSTMENT,
                    quantity: restoreQty,
                    reason: `Cancelación orden ${orderId}`,
                    reference: orderId,
                },
            });
        }

        this.logger.log(`Stock restaurado por cancelación de orden ${orderId}`);
    }

    // ================================================================
    // LOW STOCK ALERTS
    // ================================================================

    async getLowStockItems(tenantId: string) {
        // Delegated entirely to PostgreSQL — no .filter() in Node
        return this.prisma.$queryRaw<
            Array<{ id: string; name: string; unit: string; minStock: number; totalStock: number }>
        >`
            SELECT
                ii."id",
                ii."name",
                ii."unit",
                ii."minStock"::float AS "minStock",
                COALESCE(SUM(ws."currentStock"), 0)::float AS "totalStock"
            FROM "InventoryItem" ii
            LEFT JOIN "WarehouseStock" ws ON ws."inventoryItemId" = ii."id"
            WHERE ii."tenantId" = ${tenantId}
              AND ii."isActive" = true
              AND ii."minStock" > 0
            GROUP BY ii."id", ii."name", ii."unit", ii."minStock"
            HAVING COALESCE(SUM(ws."currentStock"), 0) <= ii."minStock"
            ORDER BY (COALESCE(SUM(ws."currentStock"), 0) / NULLIF(ii."minStock", 0)) ASC
            LIMIT 50
        `;
    }

    // ================================================================
    // COSTING HELPERS
    // ================================================================

    async getRecipeCost(productId: string) {
        const recipe = await this.prisma.recipe.findUnique({
            where: { productId },
            select: { id: true, yield: true },
        });
        if (!recipe) return null;

        // Delegate cost calculation to Postgres — no JS loop
        const breakdown = await this.prisma.$queryRaw<
            Array<{
                ingredient: string;
                quantity: number;
                unit: string;
                unitCost: number;
                lineCost: number;
            }>
        >`
            SELECT
                ii."name" AS "ingredient",
                ri."quantity"::float AS "quantity",
                ii."unit",
                ii."avgCost"::float AS "unitCost",
                (ri."quantity" * ri."wasteFactor" * ii."avgCost")::float AS "lineCost"
            FROM "RecipeIngredient" ri
            JOIN "InventoryItem" ii ON ii."id" = ri."inventoryItemId"
            WHERE ri."recipeId" = ${recipe.id}
        `;

        const totalCost = breakdown.reduce((sum, b) => sum + b.lineCost, 0);
        const costPerPortion = totalCost / recipe.yield;

        return {
            productId,
            yield: recipe.yield,
            totalCost,
            costPerPortion,
            breakdown,
        };
    }

    /**
     * Get costing for all products with recipes — single SQL query.
     * Delegates SUM and margin calculation to Postgres.
     */
    async getAllProductsCostOptimized(tenantId: string) {
        return this.prisma.$queryRaw<
            Array<{
                productId: string;
                productName: string;
                salePrice: number;
                totalCost: number;
                costPerPortion: number;
                margin: number;
                recipeYield: number;
            }>
        >`
            SELECT
                p."id" AS "productId",
                p."name" AS "productName",
                p."basePrice"::float AS "salePrice",
                SUM(ri."quantity" * ri."wasteFactor" * ii."avgCost")::float AS "totalCost",
                (SUM(ri."quantity" * ri."wasteFactor" * ii."avgCost") / r."yield")::float AS "costPerPortion",
                CASE
                    WHEN p."basePrice" > 0
                    THEN ((p."basePrice" - (SUM(ri."quantity" * ri."wasteFactor" * ii."avgCost") / r."yield"))
                          / p."basePrice" * 100)::float
                    ELSE 0
                END AS "margin",
                r."yield"::int AS "recipeYield"
            FROM "Recipe" r
            JOIN "Product" p ON p."id" = r."productId"
            JOIN "RecipeIngredient" ri ON ri."recipeId" = r."id"
            JOIN "InventoryItem" ii ON ii."id" = ri."inventoryItemId"
            WHERE p."tenantId" = ${tenantId}
            GROUP BY p."id", p."name", p."basePrice", r."yield"
            ORDER BY "margin" ASC
        `;
    }

    /**
     * Dashboard metrics — all computed in Postgres
     */
    async getDashboardMetrics(tenantId: string) {
        const [lowStockCount, avgMargin, topExpensiveIngredients] = await Promise.all([
            // Count of low-stock items (Postgres comparison)
            this.prisma.$queryRaw<[{ count: number }]>`
                SELECT COUNT(*)::int AS "count"
                FROM (
                    SELECT ii."id"
                    FROM "InventoryItem" ii
                    LEFT JOIN "WarehouseStock" ws ON ws."inventoryItemId" = ii."id"
                    WHERE ii."tenantId" = ${tenantId}
                      AND ii."isActive" = true
                      AND ii."minStock" > 0
                    GROUP BY ii."id"
                    HAVING COALESCE(SUM(ws."currentStock"), 0) <= ii."minStock"
                ) sub
            `,
            // Average margin across all products with recipes (CTE to avoid nested aggregates)
            this.prisma.$queryRaw<[{ avg_margin: number | null }]>`
                WITH product_margins AS (
                    SELECT
                        p."id",
                        CASE WHEN p."basePrice" > 0
                        THEN ((p."basePrice" - (SUM(ri."quantity" * ri."wasteFactor" * ii."avgCost") / r."yield"))
                              / p."basePrice" * 100)
                        ELSE 0 END AS margin
                    FROM "Recipe" r
                    JOIN "Product" p ON p."id" = r."productId"
                    JOIN "RecipeIngredient" ri ON ri."recipeId" = r."id"
                    JOIN "InventoryItem" ii ON ii."id" = ri."inventoryItemId"
                    WHERE p."tenantId" = ${tenantId}
                    GROUP BY p."id", p."basePrice", r."yield"
                )
                SELECT AVG(margin)::float AS "avg_margin"
                FROM product_margins
            `,
            // Top 5 most consumed ingredients by $ value (last 30 days)
            this.prisma.$queryRaw<
                Array<{ name: string; unit: string; totalConsumed: number; totalValue: number }>
            >`
                SELECT
                    ii."name",
                    ii."unit",
                    ABS(SUM(im."quantity"))::float AS "totalConsumed",
                    (ABS(SUM(im."quantity")) * ii."avgCost")::float AS "totalValue"
                FROM "InventoryMovement" im
                JOIN "InventoryItem" ii ON ii."id" = im."inventoryItemId"
                WHERE im."tenantId" = ${tenantId}
                  AND im."type" = 'SALE'
                  AND im."createdAt" >= NOW() - INTERVAL '30 days'
                GROUP BY ii."id", ii."name", ii."unit", ii."avgCost"
                ORDER BY "totalValue" DESC
                LIMIT 5
            `,
        ]);

        return {
            lowStockCount: lowStockCount[0]?.count ?? 0,
            avgMargin: avgMargin[0]?.avg_margin ?? 0,
            topExpensiveIngredients,
        };
    }

    // ================================================================
    // PRIVATE HELPERS
    // ================================================================

    private async recalculateAvgCost(
        tx: any,
        inventoryItemId: string,
        newQuantity: number,
        newUnitCost: number,
    ) {
        const item = await tx.inventoryItem.findUnique({
            where: { id: inventoryItemId },
            include: { stock: true },
        });

        if (!item) throw new NotFoundException('Item not found');

        const currentTotalStock = item.stock.reduce(
            (sum: number, s: any) => sum + Number(s.currentStock),
            0,
        );
        const oldTotalValue = (currentTotalStock - newQuantity) * Number(item.avgCost);
        const newTotalValue = newQuantity * newUnitCost;
        const newAvgCost =
            currentTotalStock > 0
                ? (oldTotalValue + newTotalValue) / currentTotalStock
                : newUnitCost;

        return tx.inventoryItem.update({
            where: { id: inventoryItemId },
            data: {
                avgCost: Math.round(newAvgCost * 10000) / 10000,
                lastCost: newUnitCost,
            },
        });
    }

    private async getDefaultWarehouseId(tenantId: string, prisma: any): Promise<string> {
        const warehouse = await prisma.warehouse.findFirst({
            where: { tenantId, isDefault: true },
            select: { id: true },
        });

        if (!warehouse) {
            // Auto-create
            const created = await prisma.warehouse.create({
                data: { tenantId, name: 'Cocina Principal', isDefault: true },
            });
            return created.id;
        }

        return warehouse.id;
    }
}
