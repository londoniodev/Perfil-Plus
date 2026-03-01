import { z } from "zod";

// ============================================================================
// ENUMS (Mirror Prisma enums)
// ============================================================================

export const InventoryUnitEnum = z.enum(["KG", "GR", "LT", "ML", "UN"]);
export type InventoryUnit = z.infer<typeof InventoryUnitEnum>;

export const UNIT_LABELS: Record<InventoryUnit, string> = {
    KG: "Kilogramos",
    GR: "Gramos",
    LT: "Litros",
    ML: "Mililitros",
    UN: "Unidades",
};

export const MovementTypeEnum = z.enum(["ENTRY", "EXIT", "SALE", "ADJUSTMENT", "TRANSFER"]);
export type MovementType = z.infer<typeof MovementTypeEnum>;

export const AdjustmentTypeEnum = z.enum(["MERMA", "FUGA"]);
export type AdjustmentType = z.infer<typeof AdjustmentTypeEnum>;

export const CountStatusEnum = z.enum(["DRAFT", "COMPLETED"]);
export type CountStatus = z.infer<typeof CountStatusEnum>;

// ============================================================================
// WAREHOUSE SCHEMAS
// ============================================================================

export const CreateWarehouseSchema = z.object({
    name: z.string().min(1, { message: "El nombre es requerido" }).max(100),
    isDefault: z.boolean().optional().default(false),
});

export type CreateWarehouseValues = z.infer<typeof CreateWarehouseSchema>;

// ============================================================================
// INVENTORY ITEM SCHEMAS
// ============================================================================

export const CreateInventoryItemSchema = z.object({
    name: z.string().min(1, { message: "El nombre es requerido" }).max(200),
    sku: z.string().optional(),
    unit: InventoryUnitEnum.optional().default("UN"),
    minStock: z.coerce.number().min(0).optional().default(0),
    isActive: z.boolean().optional().default(true),
});

export type CreateInventoryItemValues = z.infer<typeof CreateInventoryItemSchema>;

export const UpdateInventoryItemSchema = CreateInventoryItemSchema.partial();
export type UpdateInventoryItemValues = z.infer<typeof UpdateInventoryItemSchema>;

// ============================================================================
// STOCK ENTRY (Manual stock addition with cost)
// ============================================================================

export const StockEntrySchema = z.object({
    inventoryItemId: z.string().min(1, { message: "Ingrediente requerido" }),
    warehouseId: z.string().min(1, { message: "Almacén requerido" }),
    quantity: z.coerce.number().positive({ message: "La cantidad debe ser mayor a 0" }),
    unitCost: z.coerce.number().min(0, { message: "El costo debe ser mayor o igual a 0" }),
    reason: z.string().optional(),
});

export type StockEntryValues = z.infer<typeof StockEntrySchema>;

// ============================================================================
// STOCK EXIT (Manual stock removal)
// ============================================================================

export const StockExitSchema = z.object({
    inventoryItemId: z.string().min(1, { message: "Ingrediente requerido" }),
    warehouseId: z.string().min(1, { message: "Almacén requerido" }),
    quantity: z.coerce.number().positive({ message: "La cantidad debe ser mayor a 0" }),
    reason: z.string().optional(),
});

export type StockExitValues = z.infer<typeof StockExitSchema>;

// ============================================================================
// STOCK TRANSFER (Between warehouses)
// ============================================================================

export const StockTransferSchema = z.object({
    inventoryItemId: z.string().min(1, { message: "Ingrediente requerido" }),
    fromWarehouseId: z.string().min(1, { message: "Almacén de origen requerido" }),
    toWarehouseId: z.string().min(1, { message: "Almacén de destino requerido" }),
    quantity: z.coerce.number().positive({ message: "La cantidad debe ser mayor a 0" }),
    reason: z.string().optional(),
}).refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
    message: "Los almacenes de origen y destino deben ser diferentes",
    path: ["toWarehouseId"],
});

export type StockTransferValues = z.infer<typeof StockTransferSchema>;

// ============================================================================
// RECIPE SCHEMAS
// ============================================================================

export const RecipeIngredientSchema = z.object({
    inventoryItemId: z.string().min(1, { message: "Ingrediente requerido" }),
    quantity: z.coerce.number().positive({ message: "La cantidad debe ser mayor a 0" }),
    wasteFactor: z.coerce.number().min(1).max(2).optional().default(1),
});

export type RecipeIngredientValues = z.infer<typeof RecipeIngredientSchema>;

export const CreateRecipeSchema = z.object({
    productId: z.string().min(1, { message: "Producto requerido" }),
    yield: z.coerce.number().int().positive().optional().default(1),
    notes: z.string().optional(),
    ingredients: z.array(RecipeIngredientSchema).min(1, { message: "Debe tener al menos un ingrediente" }),
});

export type CreateRecipeValues = z.infer<typeof CreateRecipeSchema>;

export const UpdateRecipeSchema = CreateRecipeSchema.omit({ productId: true });
export type UpdateRecipeValues = z.infer<typeof UpdateRecipeSchema>;

// ============================================================================
// INVENTORY COUNT SCHEMAS
// ============================================================================

export const CreateInventoryCountSchema = z.object({
    warehouseId: z.string().min(1, { message: "Almacén requerido" }),
    notes: z.string().optional(),
});

export type CreateInventoryCountValues = z.infer<typeof CreateInventoryCountSchema>;

export const CountLineSchema = z.object({
    inventoryItemId: z.string().min(1),
    countedStock: z.coerce.number().min(0, { message: "El stock contado no puede ser negativo" }),
    adjustmentType: AdjustmentTypeEnum.optional(),
});

export type CountLineValues = z.infer<typeof CountLineSchema>;

export const CompleteInventoryCountSchema = z.object({
    lines: z.array(CountLineSchema).min(1, { message: "Debe contar al menos un ingrediente" }),
});

export type CompleteInventoryCountValues = z.infer<typeof CompleteInventoryCountSchema>;
