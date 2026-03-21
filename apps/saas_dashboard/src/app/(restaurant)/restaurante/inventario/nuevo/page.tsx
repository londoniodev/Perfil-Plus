"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@alvarosky/ui"
import { Input } from "@alvarosky/ui"
import { Label } from "@alvarosky/ui"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@alvarosky/ui"
import { AdminPageWrapper } from "@alvarosky/ui"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { createInventoryItem } from "@/actions/admin/inventory"

const UNITS = [
    { value: "KG", label: "Kilogramos (Kg)" },
    { value: "GR", label: "Gramos (Gr)" },
    { value: "LT", label: "Litros (Lt)" },
    { value: "ML", label: "Mililitros (Ml)" },
    { value: "UN", label: "Unidades (Un)" },
]

export default function NewInventoryItemPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [name, setName] = useState("")
    const [sku, setSku] = useState("")
    const [unit, setUnit] = useState("UN")
    const [minStock, setMinStock] = useState("")

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!name.trim()) {
            toast.error("El nombre es requerido")
            return
        }

        startTransition(async () => {
            const result = await createInventoryItem({
                name: name.trim(),
                sku: sku.trim() || undefined,
                unit,
                minStock: minStock ? parseFloat(minStock) : 0,
            })

            if (result.success) {
                toast.success("Ingrediente creado exitosamente")
                router.push("/restaurante/inventario")
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <AdminPageWrapper
            title="Nuevo Ingrediente"
            description="Registra un nuevo ingrediente o insumo"
            actions={
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="transition duration-200"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                    Volver
                </Button>
            }
        >
            <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="item-name">Nombre *</Label>
                    <Input
                        id="item-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Carne de res molida"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="item-sku">SKU / Código (opcional)</Label>
                    <Input
                        id="item-sku"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="Ej: CARN-001"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="item-unit">Unidad de Medida</Label>
                    <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger id="item-unit">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {UNITS.map((u) => (
                                <SelectItem key={u.value} value={u.value}>
                                    {u.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="item-min-stock">Stock Mínimo (alerta)</Label>
                    <Input
                        id="item-min-stock"
                        type="number"
                        min="0"
                        step="0.01"
                        value={minStock}
                        onChange={(e) => setMinStock(e.target.value)}
                        placeholder="Ej: 5"
                    />
                    <p className="text-xs text-muted-foreground">
                        Recibirás una alerta cuando el stock sea igual o menor a este valor
                    </p>
                </div>

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Creando..." : "Crear Ingrediente"}
                </Button>
            </form>
        </AdminPageWrapper>
    )
}
