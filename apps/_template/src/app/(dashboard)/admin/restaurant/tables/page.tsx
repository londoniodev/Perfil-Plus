"use client"

import { useState } from "react"
import {
    PageHeader,
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    useToast
} from "@alvarosky/ui"
import { Plus } from "lucide-react"
import { TableCard } from "@/components/admin/restaurant/table-card"

// Mock Data Type
interface Table {
    id: string
    label: string
    status: 'active' | 'inactive'
}

// Initial Mock Data
const INITIAL_TABLES: Table[] = [
    { id: "1", label: "Mesa 1", status: "active" },
    { id: "2", label: "Mesa 2 (VIP)", status: "active" },
    { id: "3", label: "Barra 1", status: "active" },
    { id: "4", label: "Terraza 10", status: "inactive" },
]

export default function TablesPage() {
    const toast = useToast()
    const [tables, setTables] = useState<Table[]>(INITIAL_TABLES)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTable, setEditingTable] = useState<Table | null>(null)

    // Form State
    const [label, setLabel] = useState("")
    const [status, setStatus] = useState<'active' | 'inactive'>("active")

    // Handlers
    const handleOpenAdd = () => {
        setEditingTable(null)
        setLabel("")
        setStatus("active")
        setIsDialogOpen(true)
    }

    const handleEdit = (table: Table) => {
        setEditingTable(table)
        setLabel(table.label)
        setStatus(table.status)
        setIsDialogOpen(true)
    }

    const handleDelete = (id: string) => {
        if (confirm("¿Seguro que deseas eliminar esta mesa?")) {
            setTables(prev => prev.filter(t => t.id !== id))
            toast.success("Mesa eliminada", "La mesa ha sido eliminada correctamente.")
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!label.trim()) {
            toast.error("Error", "El nombre es requerido")
            return
        }

        if (editingTable) {
            // Update
            setTables(prev => prev.map(t =>
                t.id === editingTable.id ? { ...t, label, status } : t
            ))
            toast.success("Mesa actualizada", `Mesa "${label}" actualizada.`)
        } else {
            // Create
            const newTable: Table = {
                id: Math.random().toString(36).substr(2, 9),
                label,
                status
            }
            setTables(prev => [...prev, newTable])
            toast.success("Mesa creada", `Mesa "${label}" creada exitosamente.`)
        }
        setIsDialogOpen(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-background/95 backdrop-blur p-4 rounded-lg border">
                <PageHeader
                    title="Gestión de Mesas"
                    description="Administra los puntos de venta y genera los códigos QR para pedidos."
                />
                <Button onClick={handleOpenAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Mesa
                </Button>
            </div>

            {/* Códigos Generales */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Códigos Generales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <TableCard
                        tenantId="demo-tenant"
                        customLabel="Menú General / Domicilios"
                        customUrl={typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host.replace("admin.", "")}/menu` : undefined}
                        hideActions
                    />
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Mesas Registradas</h2>
            </div>

            {/* Grid de Mesas */}
            {tables.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">No hay mesas registradas.</p>
                    <Button variant="link" onClick={handleOpenAdd}>Crear la primera mesa</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {tables.map(table => (
                        <TableCard
                            key={table.id}
                            table={table}
                            tenantId="demo-tenant" // TODO: Get real tenant from context/auth
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Dialogo de Creación/Edición */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTable ? "Editar Mesa" : "Nueva Mesa"}</DialogTitle>
                        <DialogDescription>
                            Configura el nombre y estado de la mesa. El código QR se generará automáticamente.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="label">Nombre / Número</Label>
                            <Input
                                id="label"
                                value={label}
                                onChange={e => setLabel(e.target.value)}
                                placeholder="Ej: Mesa 5"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Estado</Label>
                            <Select
                                value={status}
                                onValueChange={(val: 'active' | 'inactive') => setStatus(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Activa</SelectItem>
                                    <SelectItem value="inactive">Inactiva (Mantenimiento)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit">{editingTable ? "Guardar Cambios" : "Crear Mesa"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
