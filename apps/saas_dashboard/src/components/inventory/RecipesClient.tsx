"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@alvarosky/ui"
import { Badge } from "@alvarosky/ui"
import { Button } from "@alvarosky/ui"
import { Input } from "@alvarosky/ui"
import { Label } from "@alvarosky/ui"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@alvarosky/ui"
import { Card } from "@alvarosky/ui"
import { cn } from "@/lib/utils"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@alvarosky/ui"
import { Plus, Trash2, ChefHat, Edit, TrendingUp, TrendingDown, Percent } from "lucide-react"
import { toast } from "sonner"
import type { Recipe, InventoryItem, CostingData } from "@/actions/admin/inventory"
import {
    createRecipe,
    updateRecipe,
    deleteRecipe,
} from "@/actions/admin/inventory"

const UNIT_LABELS: Record<string, string> = { KG: "Kg", GR: "Gr", LT: "Lt", ML: "Ml", UN: "Un" }

type ProductOption = { id: string; name: string; basePrice: number; images: string[] }

export function RecipesClient({
    recipes,
    allProducts,
    inventoryItems,
    productsCost,
}: {
    recipes: Recipe[]
    allProducts: ProductOption[]
    inventoryItems: InventoryItem[]
    productsCost: CostingData[]
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<"create" | "edit">("create")
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)

    // Form State
    const [selectedProduct, setSelectedProduct] = useState("")
    const [recipeYield, setRecipeYield] = useState("1")
    const [notes, setNotes] = useState("")
    const [ingredients, setIngredients] = useState<Array<{
        inventoryItemId: string
        quantity: string
        wasteFactor: string
    }>>([{ inventoryItemId: "", quantity: "", wasteFactor: "1" }])

    // Costing Map for quick lookup
    const costingMap = new Map(productsCost.map(c => [c.productId, c]))

    function openCreateModal() {
        setModalMode("create")
        setSelectedRecipeId(null)
        setSelectedProduct("")
        setRecipeYield("1")
        setNotes("")
        setIngredients([{ inventoryItemId: "", quantity: "", wasteFactor: "1" }])
        setIsModalOpen(true)
    }

    function openEditModal(recipe: Recipe) {
        setModalMode("edit")
        setSelectedRecipeId(recipe.id)
        setSelectedProduct(recipe.productId)
        setRecipeYield(recipe.yield.toString())
        setNotes(recipe.notes || "")
        setIngredients(recipe.ingredients.map(ing => ({
            inventoryItemId: ing.inventoryItem.id,
            quantity: ing.quantity.toString(),
            wasteFactor: ing.wasteFactor.toString()
        })))
        setIsModalOpen(true)
    }

    function addIngredientRow() {
        setIngredients([...ingredients, { inventoryItemId: "", quantity: "", wasteFactor: "1" }])
    }

    function removeIngredientRow(index: number) {
        setIngredients(ingredients.filter((_, i) => i !== index))
    }

    function updateIngredient(index: number, field: string, value: string) {
        const updated = [...ingredients]
        updated[index] = { ...updated[index], [field]: value }
        setIngredients(updated)
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault()

        if (!selectedProduct) {
            toast.error("Selecciona un producto")
            return
        }

        const validIngredients = ingredients.filter((i) => i.inventoryItemId && i.quantity)
        if (validIngredients.length === 0) {
            toast.error("Agrega al menos un ingrediente")
            return
        }

        // Check if creating and product already has recipe
        if (modalMode === "create") {
            const hasRecipe = recipes.some(r => r.productId === selectedProduct)
            if (hasRecipe) {
                toast.error("Este producto ya tiene una receta asociada. Edítala en su lugar.")
                return
            }
        }

        startTransition(async () => {
            const mappedIngredients = validIngredients.map((i) => ({
                inventoryItemId: i.inventoryItemId,
                quantity: parseFloat(i.quantity),
                wasteFactor: parseFloat(i.wasteFactor) || 1,
            }))

            if (modalMode === "create") {
                const result = await createRecipe({
                    productId: selectedProduct,
                    yield: parseInt(recipeYield) || 1,
                    notes: notes || undefined,
                    ingredients: mappedIngredients,
                })

                if (result.success) {
                    toast.success("Receta creada exitosamente")
                    setIsModalOpen(false)
                } else {
                    toast.error(result.error)
                }
            } else if (modalMode === "edit" && selectedRecipeId) {
                const result = await updateRecipe(selectedRecipeId, {
                    yield: parseInt(recipeYield) || 1,
                    notes: notes || undefined,
                    ingredients: mappedIngredients,
                })

                if (result.success) {
                    toast.success("Receta actualizada exitosamente")
                    setIsModalOpen(false)
                } else {
                    toast.error(result.error)
                }
            }
        })
    }

    function handleDelete(id: string, name: string) {
        if (!confirm(`¿Eliminar la receta de "${name}"?`)) return
        startTransition(async () => {
            const result = await deleteRecipe(id)
            if (result.success) {
                toast.success("Receta eliminada")
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <section className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={openCreateModal} className="transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]">
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Nueva Receta
                </Button>
            </div>

            <div className="w-full overflow-hidden rounded-md border bg-card/40">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-4">Producto</TableHead>
                            <TableHead className="text-center">Porciones</TableHead>
                            <TableHead className="text-right">Costo Total</TableHead>
                            <TableHead className="text-right">Costo / Porción</TableHead>
                            <TableHead className="text-right">Precio Venta</TableHead>
                            <TableHead className="text-right">Utilidad Bruta</TableHead>
                            <TableHead className="text-right">Margen</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                            <TableHead className="text-right pr-4">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recipes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                                    No hay recetas creadas. Asocia ingredientes a tus platos del menú.
                                </TableCell>
                            </TableRow>
                        ) : (
                            recipes.map((recipe) => {
                                const costData = costingMap.get(recipe.productId)
                                const totalCost = costData?.totalCost || 0
                                const costPerPortion = costData?.costPerPortion || 0
                                const salePrice = Number(recipe.product.basePrice)
                                const profit = salePrice > 0 ? salePrice - costPerPortion : 0
                                const margin = costData?.margin || 0

                                let marginBadge = <Badge variant="secondary">Neutro</Badge>
                                if (margin >= 60) {
                                    marginBadge = <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">Excelente</Badge>
                                } else if (margin >= 40) {
                                    marginBadge = <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">Bueno</Badge>
                                } else if (margin > 0 && margin < 40) {
                                    marginBadge = <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">Bajo</Badge>
                                } else if (salePrice > 0) {
                                    marginBadge = <Badge variant="destructive">Pérdida</Badge>
                                }

                                return (
                                    <TableRow key={recipe.id} className="transition-colors hover:bg-muted/30">
                                        <TableCell className="font-medium whitespace-nowrap pl-4">{recipe.product.name}</TableCell>
                                        <TableCell className="text-center">{recipe.yield}</TableCell>
                                        <TableCell className="text-right font-mono text-muted-foreground">
                                            ${totalCost.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            ${costPerPortion.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-medium">
                                            ${salePrice.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                        </TableCell>
                                        <TableCell className={`text-right font-mono font-medium ${profit > 0 ? "text-emerald-500" : profit < 0 ? "text-red-500" : ""}`}>
                                            ${profit.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {margin > 0 ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : margin < 0 ? <TrendingDown className="h-3 w-3 text-red-500" /> : null}
                                                <span className="font-mono">{margin.toFixed(1)}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {marginBadge}
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 hover:bg-muted"
                                                    onClick={() => openEditModal(recipe)}
                                                    aria-label={`Editar receta ${recipe.product.name}`}
                                                >
                                                    <Edit className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 hover:bg-destructive/10"
                                                    onClick={() => handleDelete(recipe.id, recipe.product.name)}
                                                    aria-label={`Eliminar receta ${recipe.product.name}`}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ChefHat className="h-5 w-5" aria-hidden="true" />
                            {modalMode === "create" ? "Nueva Receta (BOM)" : "Editar Receta"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="space-y-6 pt-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="recipe-product">Producto del Menú</Label>
                                <Select
                                    value={selectedProduct}
                                    onValueChange={setSelectedProduct}
                                    disabled={modalMode === "edit"}
                                >
                                    <SelectTrigger id="recipe-product">
                                        <SelectValue placeholder="Seleccionar producto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allProducts.map((p) => {
                                            const hasRecipe = recipes.some(r => r.productId === p.id)
                                            return (
                                                <SelectItem key={p.id} value={p.id} disabled={modalMode === "create" && hasRecipe}>
                                                    {p.name} {hasRecipe && "(Ya tiene receta)"}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="recipe-yield">Porciones por receta</Label>
                                <Input
                                    id="recipe-yield"
                                    type="number"
                                    min="1"
                                    value={recipeYield}
                                    onChange={(e) => setRecipeYield(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="recipe-notes">Notas (Opcional)</Label>
                                <Input
                                    id="recipe-notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Instrucciones..."
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Lista de Ingredientes</Label>
                            <div className="rounded-md border p-4 bg-muted/10 space-y-3">
                                {ingredients.map((ing, idx) => (
                                    <div key={idx} className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            {idx === 0 && <Label className="text-xs text-muted-foreground mb-1 block">Ingrediente</Label>}
                                            <Select
                                                value={ing.inventoryItemId}
                                                onValueChange={(v) => updateIngredient(idx, "inventoryItemId", v)}
                                            >
                                                <SelectTrigger aria-label={`Ingrediente ${idx + 1}`}>
                                                    <SelectValue placeholder="Seleccionar" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {inventoryItems.map((item) => (
                                                        <SelectItem key={item.id} value={item.id}>
                                                            {item.name} ({UNIT_LABELS[item.unit] || item.unit}) - ${Number(item.avgCost).toLocaleString()}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-[100px]">
                                            {idx === 0 && <Label className="text-xs text-muted-foreground mb-1 block">Cant. Neta</Label>}
                                            <Input
                                                type="number"
                                                min="0.001"
                                                step="0.001"
                                                placeholder="0.00"
                                                value={ing.quantity}
                                                onChange={(e) => updateIngredient(idx, "quantity", e.target.value)}
                                                aria-label={`Cantidad ingrediente ${idx + 1}`}
                                            />
                                        </div>
                                        <div className="w-[100px]">
                                            {idx === 0 && <Label className="text-xs text-muted-foreground mb-1 block">Merma (e.g. 1.1)</Label>}
                                            <Input
                                                type="number"
                                                min="1"
                                                max="2"
                                                step="0.01"
                                                placeholder="1.0"
                                                value={ing.wasteFactor}
                                                onChange={(e) => updateIngredient(idx, "wasteFactor", e.target.value)}
                                                aria-label={`Factor merma ingrediente ${idx + 1}`}
                                            />
                                        </div>
                                        {ingredients.length > 1 && (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="mb-[2px] h-9 w-9"
                                                onClick={() => removeIngredientRow(idx)}
                                                aria-label={`Eliminar ingrediente ${idx + 1}`}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addIngredientRow}>
                                <Plus className="mr-2 h-3 w-3" aria-hidden="true" />
                                Agregar otro ingrediente
                            </Button>
                        </div>

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Guardando..." : "Guardar Receta"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </section>
    )
}
