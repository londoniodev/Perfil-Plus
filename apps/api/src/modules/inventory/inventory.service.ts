import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, MovementType } from '@alvarosky/database';
import { ClsService } from 'nestjs-cls';
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

  constructor(
    private prisma: PrismaService,
    private cls: ClsService,
  ) {}

  /** Lee el tenantId del contexto CLS (AsyncLocalStorage). */
  private getTenantId(): string {
    return this.cls.get<string>('tenantId') ?? '';
  }

  // ================================================================
  // WAREHOUSES
  // ================================================================

  // ✅ tenantId eliminado de todas las firmas públicas — .secure lo inyecta
  async createWarehouse(dto: CreateWarehouseDto) {
    if (dto.isDefault) {
      await this.prisma.secure.warehouse.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.secure.warehouse.create({
      data: {
        tenantId: this.getTenantId(),
        name: dto.name,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async findAllWarehouses() {
    return this.prisma.secure.warehouse.findMany({
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      include: { _count: { select: { stock: true } } },
    });
  }

  async getDefaultWarehouse() {
    let warehouse = await this.prisma.secure.warehouse.findFirst({
      where: { isDefault: true },
    });

    if (!warehouse) {
      warehouse = await this.prisma.secure.warehouse.create({
        data: {
          tenantId: this.getTenantId(),
          name: 'Cocina Principal',
          isDefault: true,
        },
      });
      this.logger.log(
        `Auto-created default warehouse for tenant ${this.getTenantId()}`,
      );
    }

    return warehouse;
  }

  async updateWarehouse(id: string, dto: CreateWarehouseDto) {
    const warehouse = await this.prisma.secure.warehouse.findUnique({
      where: { id },
    });
    if (!warehouse) throw new NotFoundException('Almacén no encontrado');

    if (dto.isDefault) {
      await this.prisma.secure.warehouse.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.secure.warehouse.update({
      where: { id },
      data: { name: dto.name, isDefault: dto.isDefault },
    });
  }

  async deleteWarehouse(id: string) {
    const warehouse = await this.prisma.secure.warehouse.findUnique({
      where: { id },
      include: { _count: { select: { stock: true, movements: true } } },
    });
    if (!warehouse) throw new NotFoundException('Almacén no encontrado');
    if (warehouse.isDefault) {
      throw new BadRequestException(
        'No se puede eliminar el almacén por defecto',
      );
    }
    if (warehouse._count.stock > 0) {
      throw new BadRequestException(
        'El almacén tiene stock. Transfiera los ingredientes primero.',
      );
    }

    return this.prisma.secure.warehouse.delete({ where: { id } });
  }

  // ================================================================
  // INVENTORY ITEMS (Ingredientes)
  // ================================================================

  async createItem(dto: CreateInventoryItemDto) {
    return this.prisma.secure.inventoryItem.create({
      data: {
        tenantId: this.getTenantId(),
        name: dto.name,
        sku: dto.sku,
        unit: dto.unit ?? 'UN',
        minStock: dto.minStock ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAllItems(includeInactive = false, take = 100, skip = 0) {
    return this.prisma.secure.inventoryItem.findMany({
      where: { ...(includeInactive ? {} : { isActive: true }) },
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

  async findOneItem(id: string) {
    const item = await this.prisma.secure.inventoryItem.findUnique({
      where: { id },
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

  async updateItem(id: string, dto: UpdateInventoryItemDto) {
    const item = await this.prisma.secure.inventoryItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Ingrediente no encontrado');

    return this.prisma.secure.inventoryItem.update({
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

  async deleteItem(id: string) {
    const item = await this.prisma.secure.inventoryItem.findUnique({
      where: { id },
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

    return this.prisma.secure.inventoryItem.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ================================================================
  // STOCK MOVEMENTS
  // ================================================================

  async addStockEntry(userId: string, dto: StockEntryDto) {
    // ✅ secure.$transaction — propaga tenant context al tx interno
    return this.prisma.secure.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({
        where: { id: dto.inventoryItemId },
      });
      if (!item) throw new NotFoundException('Ingrediente no encontrado');

      const warehouse = await tx.warehouse.findUnique({
        where: { id: dto.warehouseId },
      });
      if (!warehouse) throw new NotFoundException('Almacén no encontrado');

      // 1. Crear registro de movimiento
      await tx.inventoryMovement.create({
        data: {
          tenantId: this.getTenantId(),
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
        update: { currentStock: { increment: dto.quantity } },
      });

      // 3. Recalcular costo promedio ponderado
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

  async addStockExit(userId: string, dto: StockExitDto) {
    return this.prisma.secure.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({
        where: { id: dto.inventoryItemId },
      });
      if (!item) throw new NotFoundException('Ingrediente no encontrado');

      const warehouseStock = await tx.warehouseStock.findUnique({
        where: {
          warehouseId_inventoryItemId: {
            warehouseId: dto.warehouseId,
            inventoryItemId: dto.inventoryItemId,
          },
        },
      });

      if (
        !warehouseStock ||
        Number(warehouseStock.currentStock) < dto.quantity
      ) {
        throw new BadRequestException(
          `Stock insuficiente de "${item.name}" en este almacén. Disponible: ${warehouseStock?.currentStock ?? 0}`,
        );
      }

      await tx.inventoryMovement.create({
        data: {
          tenantId: this.getTenantId(),
          inventoryItemId: dto.inventoryItemId,
          warehouseId: dto.warehouseId,
          type: MovementType.EXIT,
          quantity: -dto.quantity,
          reason: dto.reason || 'Salida manual',
          createdBy: userId,
        },
      });

      await tx.warehouseStock.update({
        where: {
          warehouseId_inventoryItemId: {
            warehouseId: dto.warehouseId,
            inventoryItemId: dto.inventoryItemId,
          },
        },
        data: { currentStock: { decrement: dto.quantity } },
      });

      this.logger.log(
        `Stock exit: -${dto.quantity} ${item.unit} of "${item.name}"`,
      );
      return { success: true };
    });
  }

  async transferStock(userId: string, dto: StockTransferDto) {
    if (dto.fromWarehouseId === dto.toWarehouseId) {
      throw new BadRequestException(
        'Los almacenes de origen y destino deben ser diferentes',
      );
    }

    return this.prisma.secure.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({
        where: { id: dto.inventoryItemId },
      });
      if (!item) throw new NotFoundException('Ingrediente no encontrado');

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

      await tx.inventoryMovement.createMany({
        data: [
          {
            tenantId: this.getTenantId(),
            inventoryItemId: dto.inventoryItemId,
            warehouseId: dto.fromWarehouseId,
            type: MovementType.TRANSFER,
            quantity: -dto.quantity,
            reason: dto.reason || 'Traspaso entre almacenes',
            createdBy: userId,
          },
          {
            tenantId: this.getTenantId(),
            inventoryItemId: dto.inventoryItemId,
            warehouseId: dto.toWarehouseId,
            type: MovementType.TRANSFER,
            quantity: dto.quantity,
            reason: dto.reason || 'Traspaso entre almacenes',
            createdBy: userId,
          },
        ],
      });

      await tx.warehouseStock.update({
        where: {
          warehouseId_inventoryItemId: {
            warehouseId: dto.fromWarehouseId,
            inventoryItemId: dto.inventoryItemId,
          },
        },
        data: { currentStock: { decrement: dto.quantity } },
      });

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
        update: { currentStock: { increment: dto.quantity } },
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
    orderId: string,
    items: Array<{ productId: string; quantity: number }>,
    tx?: any,
  ) {
    const tenantId = this.getTenantId();
    // Usar el tx seguro si viene de una transacción, o el cliente secure propio
    const prismaClient = tx || this.prisma.secure;
    const defaultWarehouse = await this.getDefaultWarehouseId(prismaClient);

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

    const recipes: RecipeWithIngredients[] = await prismaClient.recipe.findMany(
      {
        where: { productId: { in: productIds } },
        include: {
          ingredients: {
            include: {
              inventoryItem: { select: { name: true, minStock: true } },
            },
          },
        },
      },
    );

    const recipeMap = new Map<string, RecipeWithIngredients>(
      recipes.map((r) => [r.productId, r]),
    );

    const deductions: Array<{
      inventoryItemId: string;
      deductQty: number;
      itemName: string;
      minStock: number;
    }> = [];

    for (const orderItem of items) {
      const recipe = recipeMap.get(orderItem.productId);
      if (!recipe) continue;

      const portionMultiplier = orderItem.quantity / recipe.yield;

      for (const ing of recipe.ingredients) {
        // Guardián: Si no hay ID de item de inventario o no existe el objeto, se salta para evitar errores de Prisma
        if (!ing.inventoryItemId || !ing.inventoryItem) {
          this.logger.warn(
            `[DEDUCT_BY_ORDER] Receta para producto ${orderItem.productId} tiene un ingrediente incompleto (Item: ${ing.inventoryItemId || 'N/A'}). Ignorando deducción.`,
          );
          continue;
        }

        deductions.push({
          inventoryItemId: ing.inventoryItemId,
          deductQty:
            Number(ing.quantity) * Number(ing.wasteFactor) * portionMultiplier,
          itemName: ing.inventoryItem.name,
          minStock: Number(ing.inventoryItem.minStock),
        });
      }
    }

    if (deductions.length === 0) return { alerts: [] };

    // Doble filtrado defensivo: Asegurar que todo objeto en movementData tiene el ID requerido
    const movementData = deductions
      .filter(
        (d) =>
          d &&
          typeof d.inventoryItemId === 'string' &&
          d.inventoryItemId.trim() !== '',
      )
      .map((d) => ({
        tenantId,
        inventoryItemId: d.inventoryItemId,
        warehouseId: defaultWarehouse,
        type: MovementType.SALE,
        quantity: -d.deductQty,
        reason: `Venta orden ${orderId}`,
        reference: orderId,
      }));

    if (movementData.length > 0) {
      await prismaClient.inventoryMovement.createMany({ data: movementData });
    }

    // Batch upsert — Filtrar deducciones de nuevo para la agregación
    const validDeductions = deductions.filter(
      (d) =>
        d &&
        typeof d.inventoryItemId === 'string' &&
        d.inventoryItemId.trim() !== '',
    );
    if (validDeductions.length === 0) return { alerts: [] };

    const aggregated = new Map<string, number>();
    for (const d of validDeductions) {
      aggregated.set(
        d.inventoryItemId,
        (aggregated.get(d.inventoryItemId) || 0) + d.deductQty,
      );
    }

    const { randomUUID } = await import('crypto');
    const fragments = Array.from(aggregated.entries()).map(
      ([itemId, qty]) =>
        Prisma.sql`(${randomUUID()}, ${defaultWarehouse}, ${itemId}, ${-qty}, CURRENT_TIMESTAMP)`,
    );

    /* eslint-disable no-restricted-syntax */
    await prismaClient.$executeRaw`
      INSERT INTO "WarehouseStock" ("id", "warehouseId", "inventoryItemId", "currentStock", "updatedAt")
      VALUES ${Prisma.join(fragments)}
      ON CONFLICT ("warehouseId", "inventoryItemId")
      DO UPDATE SET
        "currentStock" = "WarehouseStock"."currentStock" + EXCLUDED."currentStock",
        "updatedAt" = CURRENT_TIMESTAMP
    `;
    /* eslint-enable no-restricted-syntax */

    // Low-stock check — HAVING sobre MAX/SUM en JOIN no disponible en Prisma ORM
    const uniqueItemIds = [
      ...new Set(deductions.map((d) => d.inventoryItemId)),
    ];

    /* eslint-disable no-restricted-syntax */
    const lowStockRows: Array<{
      id: string;
      name: string;
      total_stock: number;
      min_stock: number;
    }> = await prismaClient.$queryRaw`
      SELECT ii."id", ii."name",
             COALESCE(SUM(ws."currentStock"), 0)::float AS total_stock,
             ii."minStock"::float AS min_stock
      FROM "InventoryItem" ii
      LEFT JOIN "WarehouseStock" ws ON ws."inventoryItemId" = ii."id"
      WHERE ii."id" = ANY(${uniqueItemIds})
        AND ii."minStock" > 0
        AND ii."tenantId" = ${tenantId}
      GROUP BY ii."id", ii."name", ii."minStock"
      HAVING COALESCE(SUM(ws."currentStock"), 0) <= ii."minStock"
    `;
    /* eslint-enable no-restricted-syntax */

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

  async restoreByOrder(orderId: string, tx?: any) {
    const tenantId = this.getTenantId();
    const prismaClient = tx || this.prisma.secure;

    const movements = await prismaClient.inventoryMovement.findMany({
      where: { reference: orderId, type: MovementType.SALE },
    });

    if (movements.length === 0) return;

    await prismaClient.inventoryMovement.createMany({
      data: movements.map((m) => ({
        tenantId,
        inventoryItemId: m.inventoryItemId,
        warehouseId: m.warehouseId,
        type: MovementType.ADJUSTMENT,
        quantity: Math.abs(Number(m.quantity)),
        reason: `Cancelación orden ${orderId}`,
        reference: orderId,
      })),
    });

    await Promise.all(
      movements.map((m) => {
        const restoreQty = Math.abs(Number(m.quantity));
        return prismaClient.warehouseStock.upsert({
          where: {
            warehouseId_inventoryItemId: {
              warehouseId: m.warehouseId,
              inventoryItemId: m.inventoryItemId,
            },
          },
          create: {
            warehouseId: m.warehouseId,
            inventoryItemId: m.inventoryItemId,
            currentStock: restoreQty,
          },
          update: { currentStock: { increment: restoreQty } },
        });
      }),
    );

    this.logger.log(`Stock restaurado por cancelación de orden ${orderId}`);
  }

  // ================================================================
  // LOW STOCK ALERTS
  // ================================================================

  async getLowStockItems() {
    const tenantId = this.getTenantId();
    // SUM + LEFT JOIN + HAVING COALESCE — imposible en Prisma ORM (groupBy no soporta HAVING con aggregate)
    /* eslint-disable no-restricted-syntax */
    const result = await this.prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        unit: string;
        minStock: number;
        totalStock: number;
      }>
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
    /* eslint-enable no-restricted-syntax */
    return result;
  }

  // ================================================================
  // COSTING HELPERS
  // ================================================================

  async getRecipeCost(productId: string) {
    const recipe = await this.prisma.secure.recipe.findUnique({
      where: { productId },
      select: { id: true, yield: true },
    });
    if (!recipe) return null;

    // JOIN de 3 tablas con cálculo de línea de costo — no replicable en Prisma ORM
    /* eslint-disable no-restricted-syntax */
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
    /* eslint-enable no-restricted-syntax */

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

  async getAllProductsCostOptimized() {
    const tenantId = this.getTenantId();
    // SUM sobre JOIN + CASE + GROUP BY compuesto — requiere raw SQL
    /* eslint-disable no-restricted-syntax */
    const result = await this.prisma.$queryRaw<
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
    /* eslint-enable no-restricted-syntax */
    return result;
  }

  async getDashboardMetrics() {
    const tenantId = this.getTenantId();
    // Los tres queries usan CTE y HAVING que son irremplazables en Prisma ORM
    const [lowStockCount, avgMargin, topExpensiveIngredients] =
      /* eslint-disable no-restricted-syntax */
      await Promise.all([
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
        this.prisma.$queryRaw<
          Array<{
            name: string;
            unit: string;
            totalConsumed: number;
            totalValue: number;
          }>
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
    /* eslint-enable no-restricted-syntax */

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
    const oldTotalValue =
      (currentTotalStock - newQuantity) * Number(item.avgCost);
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

  private async getDefaultWarehouseId(prismaClient: any): Promise<string> {
    const warehouse = await prismaClient.warehouse.findFirst({
      where: { isDefault: true },
      select: { id: true },
    });

    if (!warehouse) {
      const created = await prismaClient.warehouse.create({
        data: {
          tenantId: this.getTenantId(),
          name: 'Cocina Principal',
          isDefault: true,
        },
      });
      return created.id;
    }

    return warehouse.id;
  }
}
