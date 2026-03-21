"use client"

import { useState, useTransition } from "react"
import { Button } from "@alvarosky/ui"
import { Input } from "@alvarosky/ui"
import { Label } from "@alvarosky/ui"
import { Badge } from "@alvarosky/ui"
import { Plus, Trash2, Star, Edit } from "lucide-react"
import { toast } from "sonner"
import type { Warehouse } from "@/actions/admin/inventory"
import { createWarehouse, deleteWarehouse, updateWarehouse } from "@/actions/admin/inventory"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@alvarosky/ui"

export function WarehousesClient({ warehouses }: { warehouses: Warehouse[] }) {
    const [isPending, startTransition] = useTransition()

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<"create" | "edit">("create")
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null)

    // Form State
    const [name, setName] = useState("")
    const [isDefault, setIsDefault] = useState(false)

    function openCreateModal() {
        setModalMode("create")
        setSelectedWarehouseId(null)
        setName("")
        setIsDefault(false)
        setIsModalOpen(true)
    }

    function openEditModal(warehouse: Warehouse) {
        setModalMode("edit")
        setSelectedWarehouseId(warehouse.id)
        setName(warehouse.name)
        setIsDefault(warehouse.isDefault)
        setIsModalOpen(true)
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) {
            toast.error("El nombre es requerido")
            return
        }

        startTransition(async () => {
            if (modalMode === "create") {
                const result = await createWarehouse({ name: name.trim(), isDefault })
                if (result.success) {
                    toast.success("Almacén creado exitosamente")
                    setIsModalOpen(false)
                } else {
                    toast.error(result.error)
                }
            } else if (modalMode === "edit" && selectedWarehouseId) {
                const result = await updateWarehouse(selectedWarehouseId, { name: name.trim(), isDefault })
                if (result.success) {
                    toast.success("Almacén actualizado exitosamente")
                    setIsModalOpen(false)
                } else {
                    toast.error(result.error)
                }
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
                    onClick={openCreateModal}
                    className="transition duration-200 hover:scale-[1.01] active:scale-[0.98]"
                >
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Nuevo Almacén
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {warehouses.map((w) => (
                    <article
                        key={w.id}
                        className="rounded-lg border border-border/40 p-4 flex flex-col gap-3 hover:border-primary/50 transition-colors bg-card"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{w.name}</h3>
                                {w.isDefault && (
                                    <Badge variant="default" className="text-xs">
                                        <Star className="mr-1 h-3 w-3" aria-hidden="true" />
                                        Principal
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 hover:bg-muted text-muted-foreground"
                                    onClick={() => openEditModal(w)}
                                    aria-label={`Editar ${w.name}`}
                                >
                                    <Edit className="h-4 w-4" aria-hidden="true" />
                                </Button>
                                {!w.isDefault && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(w.id, w.name)}
                                        disabled={isPending}
                                        aria-label={`Eliminar ${w.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
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

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {modalMode === "create" ? "Nuevo Almacén" : "Editar Almacén"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-6 pt-4">
                        <div className="space-y-4">
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
                            <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                    className="rounded border-input h-4 w-4 text-primary focus:ring-primary"
                                />
                                <span>Establecer como almacén principal</span>
                            </label>
                        </div>
                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Guardando..." : "Guardar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </section>
    )
}
