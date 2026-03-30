"use server"

import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"
import { revalidateTag } from "next/cache"

// --- TYPES ---

export type InventoryItem = {
    id: string
    name: string
    sku: string | null
    unit: string
    avgCost: number
    lastCost: number
    minStock: number
    isActive: boolean
    createdAt: string
    stock: Array<{
        id: string
        currentStock: number
        warehouse: { id: string; name: string }
    }>
}

export type Warehouse = {
    id: string
    name: string
    isDefault: boolean
    _count: { stock: number }
}

export type InventoryMovement = {
    id: string
    type: string
    quantity: number
    unitCost: number | null
    reason: string | null
    reference: string | null
    createdBy: string | null
    createdAt: string
    warehouse: { id: string; name: string }
}

export type Recipe = {
    id: string
    productId: string
    yield: number
    notes: string | null
    product: { id: string; name: string; basePrice: number; images?: string[] }
    ingredients: Array<{
        id: string
        quantity: number
        wasteFactor: number
        inventoryItem: { id: string; name: string; unit: string; avgCost: number }
    }>
}

export type CostingData = {
    productId: string
    productName: string
    salePrice: number
    totalCost: number
    costPerPortion: number
    margin: number
    recipeYield: number
}

export type CostingDetail = {
    productId: string
    yield: number
    totalCost: number
    costPerPortion: number
    breakdown: Array<{
        ingredient: string
        quantity: number
        unit: string
        unitCost: number
        lineCost: number
    }>
}

export type DashboardMetrics = {
    lowStockCount: number
    avgMargin: number
    topExpensiveIngredients: Array<{
        name: string
        unit: string
        totalConsumed: number
        totalValue: number
    }>
}

export type InventoryCount = {
    id: string
    status: string
    notes: string | null
    countedBy: string | null
    completedAt: string | null
    createdAt: string
    warehouse: { id: string; name: string }
    _count?: { lines: number }
    lines?: Array<{
        id: string
        systemStock: number
        countedStock: number | null
        difference: number | null
        adjustmentType: string | null
        inventoryItem: { id: string; name: string; unit: string }
    }>
}

export type LowStockAlert = {
    id: string
    name: string
    unit: string
    minStock: number
    totalStock: number
}

// --- WAREHOUSES ---

export async function getWarehouses(): Promise<Warehouse[]> {
    try {
        return await serverFetch<Warehouse[]>("/admin/inventory/warehouses")
    } catch (error) {
        console.error("Error fetching warehouses:", error)
        return []
    }
}

export async function createWarehouse(data: { name: string; isDefault?: boolean }) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return { success: false, error: "No autorizado" }

        await serverFetch("/admin/inventory/warehouses", {
            method: "POST",
            body: JSON.stringify(data),
        })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al crear almacén" }
    }
}

export async function updateWarehouse(id: string, data: { name: string; isDefault?: boolean }) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return { success: false, error: "No autorizado" }

        await serverFetch(`/admin/inventory/warehouses/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al actualizar almacén" }
    }
}

export async function deleteWarehouse(id: string) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return { success: false, error: "No autorizado" }

        await serverFetch(`/admin/inventory/warehouses/${id}`, { method: "DELETE" })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al eliminar almacén" }
    }
}

// --- INVENTORY ITEMS ---

export async function getInventoryItems(): Promise<InventoryItem[]> {
    try {
        return await serverFetch<InventoryItem[]>("/admin/inventory/items")
    } catch (error) {
        console.error("Error fetching inventory items:", error)
        return []
    }
}

export async function getInventoryItem(id: string): Promise<InventoryItem & { movements: InventoryMovement[] }> {
    return await serverFetch(`/admin/inventory/items/${id}`)
}

export async function createInventoryItem(data: {
    name: string
    sku?: string
    unit?: string
    minStock?: number
}) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return { success: false, error: "No autorizado" }

        await serverFetch("/admin/inventory/items", {
            method: "POST",
            body: JSON.stringify(data),
        })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al crear ingrediente" }
    }
}

export async function updateInventoryItem(id: string, data: {
    name?: string
    sku?: string
    unit?: string
    minStock?: number
    isActive?: boolean
}) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return { success: false, error: "No autorizado" }

        await serverFetch(`/admin/inventory/items/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al actualizar ingrediente" }
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return { success: false, error: "No autorizado" }

        await serverFetch(`/admin/inventory/items/${id}`, { method: "DELETE" })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al eliminar ingrediente" }
    }
}

// --- STOCK MOVEMENTS ---

export async function addStockEntry(data: {
    inventoryItemId: string
    warehouseId: string
    quantity: number
    unitCost: number
    reason?: string
}) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return { success: false, error: "No autorizado" }

        await serverFetch("/admin/inventory/stock/entry", {
            method: "POST",
            body: JSON.stringify(data),
        })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al agregar stock" }
    }
}

export async function addStockExit(data: {
    inventoryItemId: string
    warehouseId: string
    quantity: number
    reason?: string
}) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return { success: false, error: "No autorizado" }

        await serverFetch("/admin/inventory/stock/exit", {
            method: "POST",
            body: JSON.stringify(data),
        })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al retirar stock" }
    }
}

export async function transferStock(data: {
    inventoryItemId: string
    fromWarehouseId: string
    toWarehouseId: string
    quantity: number
    reason?: string
}) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return { success: false, error: "No autorizado" }

        await serverFetch("/admin/inventory/stock/transfer", {
            method: "POST",
            body: JSON.stringify(data),
        })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al transferir stock" }
    }
}

// --- ALERTS ---

export async function getLowStockAlerts(): Promise<LowStockAlert[]> {
    try {
        return await serverFetch<LowStockAlert[]>("/admin/inventory/alerts/low-stock")
    } catch (error) {
        console.error("Error fetching low stock alerts:", error)
        return []
    }
}

// --- RECIPES ---

export async function getRecipes(): Promise<Recipe[]> {
    try {
        return await serverFetch<Recipe[]>("/admin/inventory/recipes")
    } catch (error) {
        console.error("Error fetching recipes:", error)
        return []
    }
}

export async function getRecipe(id: string): Promise<Recipe> {
    return await serverFetch(`/admin/inventory/recipes/${id}`)
}

export async function getProductsWithoutRecipe() {
    try {
        return await serverFetch<Array<{ id: string; name: string; basePrice: number; images: string[] }>>(
            "/admin/inventory/recipes/products-without-recipe"
        )
    } catch (error) {
        console.error("Error:", error)
        return []
    }
}

// Added to allow admins to see ALL products in the modal, not just those without recipes
export async function getAllProductsForRecipe() {
    try {
        // We can reuse the products endpoint
        return await serverFetch<Array<{ id: string; name: string; basePrice: number; images: string[] }>>(
            "/admin/products?published=all" // Ensure we fetch all, or whatever the default is
        )
    } catch (error) {
        console.error("Error fetching all products for recipe:", error)
        return []
    }
}

export async function createRecipe(data: {
    productId: string
    yield?: number
    notes?: string
    ingredients: Array<{ inventoryItemId: string; quantity: number; wasteFactor?: number }>
}) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return { success: false, error: "No autorizado" }

        await serverFetch("/admin/inventory/recipes", {
            method: "POST",
            body: JSON.stringify(data),
        })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al crear receta" }
    }
}

export async function updateRecipe(id: string, data: {
    yield?: number
    notes?: string
    ingredients?: Array<{ inventoryItemId: string; quantity: number; wasteFactor?: number }>
}) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return { success: false, error: "No autorizado" }

        await serverFetch(`/admin/inventory/recipes/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al actualizar receta" }
    }
}

export async function deleteRecipe(id: string) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return { success: false, error: "No autorizado" }

        await serverFetch(`/admin/inventory/recipes/${id}`, { method: "DELETE" })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al eliminar receta" }
    }
}

// --- COSTING ---

export async function getAllProductsCost(): Promise<CostingData[]> {
    try {
        return await serverFetch<CostingData[]>("/admin/inventory/costing")
    } catch (error) {
        console.error("Error fetching costing data:", error)
        return []
    }
}

export async function getProductCostDetail(productId: string): Promise<CostingDetail | null> {
    try {
        return await serverFetch<CostingDetail>(`/admin/inventory/costing/${productId}`)
    } catch (error) {
        console.error("Error fetching cost detail:", error)
        return null
    }
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
        return await serverFetch<DashboardMetrics>("/admin/inventory/dashboard/metrics")
    } catch (error) {
        console.error("Error fetching dashboard metrics:", error)
        return { lowStockCount: 0, avgMargin: 0, topExpensiveIngredients: [] }
    }
}

// --- INVENTORY COUNTS ---

export async function getInventoryCounts(): Promise<InventoryCount[]> {
    try {
        return await serverFetch<InventoryCount[]>("/admin/inventory/counts")
    } catch (error) {
        console.error("Error fetching counts:", error)
        return []
    }
}

export async function getInventoryCount(id: string): Promise<InventoryCount> {
    return await serverFetch(`/admin/inventory/counts/${id}`)
}

export async function createInventoryCount(data: { warehouseId: string; notes?: string }) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return { success: false, error: "No autorizado" }

        const result = await serverFetch<InventoryCount>("/admin/inventory/counts", {
            method: "POST",
            body: JSON.stringify(data),
        })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true, data: result }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al crear conteo" }
    }
}

export async function completeInventoryCount(id: string, data: {
    lines: Array<{ inventoryItemId: string; countedStock: number; adjustmentType?: string }>
}) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return { success: false, error: "No autorizado" }

        await serverFetch(`/admin/inventory/counts/${id}/complete`, {
            method: "PATCH",
            body: JSON.stringify(data),
        })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al completar conteo" }
    }
}

export async function updateCostingMargins(marginGood: number, marginLow: number) {
    try {
        const user = await getSessionUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return { success: false, error: "No autorizado" }

        const newConfig = { costingMarginGood: marginGood, costingMarginLow: marginLow }

        await serverFetch('/settings/tenant-config', { method: 'PATCH', body: JSON.stringify(newConfig) })
        revalidateTag(`tenant-${user.tenantId}`, "default")

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al actualizar márgenes de costeo" }
    }
}
