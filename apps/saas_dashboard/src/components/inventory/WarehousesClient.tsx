"use client"

import { useState, useTransition } from "react"
import { Button } from "@alvarosky/ui"
import { Input } from "@alvarosky/ui"
import { Label } from "@alvarosky/ui"
import { AdminPageWrapper } from "@alvarosky/ui"
import { Badge } from "@alvarosky/ui"
import { Plus, Trash2, Star } from "lucide-react"
import { toast } from "sonner"
import type { Warehouse } from "@/actions/admin/inventory"
import { createWarehouse, deleteWarehouse } from "@/actions/admin/inventory"

export function WarehousesClient({ warehouses }: { warehouses: Warehouse[] }) {
    const [isPending, startTransition] = useTransition()
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState("")
    const [isDefault, setIsDefault] = useState(false)

    function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) {
            toast.error("El nombre es requerido")
            return
        }

        startTransition(async () => {
            const result = await createWarehouse({ name: name.trim(), isDefault })
            if (result.success) {
                toast.success("Almacén creado")
                setName("")
                setShowForm(false)
            } else {
                toast.error(result.error)
            }
        })
    }

    function handleDelete(id: string, warehouseName: string) {
        if (!confirm(`¿Eliminar el almacén "${warehouseName}"?`)) return
        startTransition(async () => {
            const result = await deleteWarehouse(id)
            if (result.success) {
                toast.success("Almacén eliminado")
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <section className="space-y-6">
            <div className="flex justify-end">
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
                >
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Nuevo Almacén
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="max-w-md rounded-lg border p-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="warehouse-name">Nombre del Almacén</Label>
                        <Input
                            id="warehouse-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Bodega, Bar, Cocina Fría"
                            required
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="rounded border-input"
                        />
                        Establecer como almacén principal
                    </label>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isPending} size="sm">
                            {isPending ? "Creando..." : "Crear"}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {warehouses.map((w) => (
                    <article
                        key={w.id}
                        className="rounded-lg border p-4 flex flex-col gap-3 hover:border-primary/50 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{w.name}</h3>
                                {w.isDefault && (
                                    <Badge variant="default" className="text-xs">
                                        <Star className="mr-1 h-3 w-3" aria-hidden="true" />
                                        Principal
                                    </Badge>
                                )}
                            </div>
                            {!w.isDefault && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => handleDelete(w.id, w.name)}
                                    disabled={isPending}
                                    aria-label={`Eliminar ${w.name}`}
                                >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {w._count.stock} ingredientes registrados
                        </p>
                    </article>
                ))}
                {warehouses.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-8">
                        No hay almacenes. Al agregar tu primer ingrediente se creará automáticamente &quot;Cocina Principal&quot;.
                    </p>
                )}
            </div>
        </section>
    )
}
