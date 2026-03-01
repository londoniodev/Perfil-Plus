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
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@alvarosky/ui"
import { Plus, Trash2, ChefHat, Edit } from "lucide-react"
import { toast } from "sonner"
import type { Recipe, InventoryItem } from "@/actions/admin/inventory"
import {
    createRecipe,
    deleteRecipe,
} from "@/actions/admin/inventory"

const UNIT_LABELS: Record<string, string> = { KG: "Kg", GR: "Gr", LT: "Lt", ML: "Ml", UN: "Un" }

type ProductOption = { id: string; name: string; basePrice: number; images: string[] }

export function RecipesClient({
    recipes,
    productsWithoutRecipe,
    inventoryItems,
}: {
    recipes: Recipe[]
    productsWithoutRecipe: ProductOption[]
    inventoryItems: InventoryItem[]
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showCreate, setShowCreate] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState("")
    const [recipeYield, setRecipeYield] = useState("1")
    const [notes, setNotes] = useState("")
    const [ingredients, setIngredients] = useState<Array<{
        inventoryItemId: string
        quantity: string
        wasteFactor: string
    }>>([{ inventoryItemId: "", quantity: "", wasteFactor: "1" }])

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

    function handleCreate(e: React.FormEvent) {
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

        startTransition(async () => {
            const result = await createRecipe({
                productId: selectedProduct,
                yield: parseInt(recipeYield) || 1,
                notes: notes || undefined,
                ingredients: validIngredients.map((i) => ({
                    inventoryItemId: i.inventoryItemId,
                    quantity: parseFloat(i.quantity),
                    wasteFactor: parseFloat(i.wasteFactor) || 1,
                })),
            })

            if (result.success) {
                toast.success("Receta creada exitosamente")
                setShowCreate(false)
                setSelectedProduct("")
                setIngredients([{ inventoryItemId: "", quantity: "", wasteFactor: "1" }])
                setNotes("")
            } else {
                toast.error(result.error)
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
            {/* Create button */}
            {productsWithoutRecipe.length > 0 && !showCreate && (
                <div className="flex justify-end">
                    <Button onClick={() => setShowCreate(true)} className="transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]">
                        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                        Nueva Receta
                    </Button>
                </div>
            )}

            {/* Create form */}
            {showCreate && (
                <form onSubmit={handleCreate} className="rounded-lg border p-6 space-y-5">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <ChefHat className="h-5 w-5" aria-hidden="true" />
                        Nueva Receta
                    </h3>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="recipe-product">Producto del Menú</Label>
                            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                <SelectTrigger id="recipe-product">
                                    <SelectValue placeholder="Seleccionar producto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {productsWithoutRecipe.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name} (${Number(p.basePrice).toLocaleString()})
                                        </SelectItem>
                                    ))}
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
                            <Label htmlFor="recipe-notes">Notas (opcional)</Label>
                            <Input
                                id="recipe-notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Instrucciones especiales"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Ingredientes</Label>
                        {ingredients.map((ing, idx) => (
                            <div key={idx} className="grid gap-2 grid-cols-[1fr_100px_100px_40px] items-end">
                                <Select
                                    value={ing.inventoryItemId}
                                    onValueChange={(v) => updateIngredient(idx, "inventoryItemId", v)}
                                >
                                    <SelectTrigger aria-label={`Ingrediente ${idx + 1}`}>
                                        <SelectValue placeholder="Ingrediente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {inventoryItems.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.name} ({UNIT_LABELS[item.unit] || item.unit})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    min="0.001"
                                    step="0.001"
                                    placeholder="Cant."
                                    value={ing.quantity}
                                    onChange={(e) => updateIngredient(idx, "quantity", e.target.value)}
                                    aria-label={`Cantidad ingrediente ${idx + 1}`}
                                />
                                <Input
                                    type="number"
                                    min="1"
                                    max="2"
                                    step="0.01"
                                    placeholder="Merma"
                                    value={ing.wasteFactor}
                                    onChange={(e) => updateIngredient(idx, "wasteFactor", e.target.value)}
                                    aria-label={`Factor merma ingrediente ${idx + 1}`}
                                />
                                {ingredients.length > 1 && (
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="h-10 w-10"
                                        onClick={() => removeIngredientRow(idx)}
                                        aria-label={`Eliminar ingrediente ${idx + 1}`}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addIngredientRow}>
                            <Plus className="mr-2 h-3 w-3" aria-hidden="true" />
                            Agregar Ingrediente
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Creando..." : "Crear Receta"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            )}

            {/* Recipes table */}
            <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden bg-card/60 backdrop-blur-xl">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-center">Ingredientes</TableHead>
                            <TableHead className="text-center">Porciones</TableHead>
                            <TableHead className="text-right">Precio Venta</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recipes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    No hay recetas creadas. Asocia ingredientes a tus platos del menú.
                                </TableCell>
                            </TableRow>
                        ) : (
                            recipes.map((recipe) => (
                                <TableRow key={recipe.id} className="transition-colors hover:bg-muted/30">
                                    <TableCell className="font-medium">{recipe.product.name}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {recipe.ingredients.map((ing) => (
                                                <Badge key={ing.id} variant="outline" className="text-xs">
                                                    {ing.inventoryItem.name}: {Number(ing.quantity)} {UNIT_LABELS[ing.inventoryItem.unit] || ing.inventoryItem.unit}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{recipe.yield}</TableCell>
                                    <TableCell className="text-right font-mono">
                                        ${Number(recipe.product.basePrice).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 hover:bg-destructive/10"
                                            onClick={() => handleDelete(recipe.id, recipe.product.name)}
                                            aria-label={`Eliminar receta ${recipe.product.name}`}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </section>
    )
}
