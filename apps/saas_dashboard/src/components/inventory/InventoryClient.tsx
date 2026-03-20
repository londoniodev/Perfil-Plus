"use client"

import { useState, useTransition } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@alvarosky/ui"
import { Badge } from "@alvarosky/ui"
import { Card } from "@alvarosky/ui"
import { cn } from "@/lib/utils"
import { Button } from "@alvarosky/ui"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@alvarosky/ui"
import { Input } from "@alvarosky/ui"
import { Label } from "@alvarosky/ui"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@alvarosky/ui"
import { Plus, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, AlertTriangle, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { InventoryItem, Warehouse, LowStockAlert } from "@/actions/admin/inventory"
import {
    addStockEntry,
    addStockExit,
    transferStock,
    deleteInventoryItem,
    createInventoryItem, // Added import
} from "@/actions/admin/inventory"

const UNITS = [
    { value: "KG", label: "Kilogramos (Kg)" },
    { value: "GR", label: "Gramos (Gr)" },
    { value: "LT", label: "Litros (Lt)" },
    { value: "ML", label: "Mililitros (Ml)" },
    { value: "UN", label: "Unidades (Un)" },
]

const UNIT_LABELS: Record<string, string> = {
    KG: "Kg",
    GR: "Gr",
    LT: "Lt",
    ML: "Ml",
    UN: "Un",
}

export function InventoryClient({
    items,
    warehouses,
    alerts,
}: {
    items: InventoryItem[]
    warehouses: Warehouse[]
    alerts: LowStockAlert[]
}) {
    const [isPending, startTransition] = useTransition()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogType, setDialogType] = useState<"entry" | "exit" | "transfer" | "create">("entry")
    const [selectedItem, setSelectedItem] = useState<string>("")
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>(warehouses[0]?.id || "")
    const [toWarehouse, setToWarehouse] = useState<string>("")
    const [quantity, setQuantity] = useState("")
    const [unitCost, setUnitCost] = useState("")
    const [reason, setReason] = useState("")

    // Create Item State
    const [createName, setCreateName] = useState("")
    const [createSku, setCreateSku] = useState("")
    const [createUnit, setCreateUnit] = useState("UN")
    const [createMinStock, setCreateMinStock] = useState("")

    const alertItemIds = new Set(alerts.map((a) => a.id))

    function openDialog(type: "entry" | "exit" | "transfer" | "create", itemId?: string) {
        setDialogType(type)
        if (itemId) setSelectedItem(itemId)
        setQuantity("")
        setUnitCost("")
        setReason("")
        setCreateName("")
        setCreateSku("")
        setCreateUnit("UN")
        setCreateMinStock("")
        setDialogOpen(true)
    }

    function handleSubmit() {
        if (dialogType === "create") {
            if (!createName.trim()) {
                toast.error("El nombre es requerido")
                return
            }
            startTransition(async () => {
                const result = await createInventoryItem({
                    name: createName.trim(),
                    sku: createSku.trim() || undefined,
                    unit: createUnit,
                    minStock: createMinStock ? parseFloat(createMinStock) : 0,
                })
                if (result.success) {
                    toast.success("Ingrediente creado correctamente")
                    setDialogOpen(false)
                } else {
                    toast.error(result.error)
                }
            })
            return
        }

        if (!selectedItem || !quantity) {
            toast.error("Completa los campos requeridos")
            return
        }

        startTransition(async () => {
            let result
            if (dialogType === "entry") {
                result = await addStockEntry({
                    inventoryItemId: selectedItem,
                    warehouseId: selectedWarehouse,
                    quantity: parseFloat(quantity),
                    unitCost: parseFloat(unitCost || "0"),
                    reason: reason || undefined,
                })
            } else if (dialogType === "exit") {
                result = await addStockExit({
                    inventoryItemId: selectedItem,
                    warehouseId: selectedWarehouse,
                    quantity: parseFloat(quantity),
                    reason: reason || undefined,
                })
            } else {
                result = await transferStock({
                    inventoryItemId: selectedItem,
                    fromWarehouseId: selectedWarehouse,
                    toWarehouseId: toWarehouse,
                    quantity: parseFloat(quantity),
                    reason: reason || undefined,
                })
            }

            if (result.success) {
                toast.success(
                    dialogType === "entry"
                        ? "Stock agregado correctamente"
                        : dialogType === "exit"
                            ? "Salida registrada"
                            : "Traspaso realizado"
                )
                setDialogOpen(false)
            } else {
                toast.error(result.error)
            }
        })
    }

    function handleDelete(id: string, name: string) {
        if (!confirm(`¿Desactivar el ingrediente "${name}"?`)) return
        startTransition(async () => {
            const result = await deleteInventoryItem(id)
            if (result.success) {
                toast.success("Ingrediente desactivado")
            } else {
                toast.error(result.error)
            }
        })
    }

    const dialogTitles = {
        entry: "Agregar Stock",
        exit: "Registrar Salida",
        transfer: "Traspasar Stock",
        create: "Nuevo Ingrediente",
    }

    return (
        <section>
            {/* Alerts banner */}
            {alerts.length > 0 && (
                <div className="mb-6 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" aria-hidden="true" />
                        <h3 className="font-semibold text-orange-500">
                            Stock Bajo ({alerts.length} ingredientes)
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {alerts.map((alert) => (
                            <Badge key={alert.id} variant="outline" className="border-orange-500/50 text-orange-400">
                                {alert.name}: {alert.totalStock} {UNIT_LABELS[alert.unit] || alert.unit}
                                {" "}(mín: {alert.minStock})
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
                <Button
                    size="sm"
                    onClick={() => openDialog("create")}
                    className="bg-primary hover:bg-primary/90"
                >
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Nuevo Ingrediente
                </Button>
                <Button
                    size="sm"
                    onClick={() => openDialog("entry")}
                    className="bg-emerald-600 hover:bg-emerald-700"
                >
                    <ArrowUpCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    Entrada de Stock
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDialog("exit")}
                >
                    <ArrowDownCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    Salida de Stock
                </Button>
                {warehouses.length > 1 && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog("transfer")}
                    >
                        <ArrowRightLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                        Traspaso
                    </Button>
                )}
            </div>

            {/* Ingredients table */}
            <div className="w-full overflow-hidden rounded-md border bg-card/40">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-4">Ingrediente</TableHead>
                            <TableHead>Unidad</TableHead>
                            <TableHead className="text-right">Stock Total</TableHead>
                            <TableHead className="text-right">Costo Prom.</TableHead>
                            <TableHead className="text-right">Último Costo</TableHead>
                            <TableHead className="text-right">Mín. Stock</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                            <TableHead className="text-right pr-4">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                    No hay ingredientes registrados. Crea tu primer ingrediente.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => {
                                const totalStock = item.stock.reduce(
                                    (sum, s) => sum + Number(s.currentStock),
                                    0
                                )
                                const isLow = alertItemIds.has(item.id)

                                return (
                                    <TableRow key={item.id} className={cn(
                                        "transition-colors hover:bg-muted/30",
                                        isLow && "bg-orange-500/5 hover:bg-orange-500/10"
                                    )}>
                                        <TableCell className="font-medium pl-4">
                                            <div className="flex items-center gap-2">
                                                {isLow && (
                                                    <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" aria-label="Stock bajo" />
                                                )}
                                                {item.name}
                                                {item.sku && (
                                                    <span className="text-xs text-muted-foreground">
                                                        ({item.sku})
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{UNIT_LABELS[item.unit] || item.unit}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {totalStock.toFixed(totalStock % 1 === 0 ? 0 : 2)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            ${Number(item.avgCost).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            ${Number(item.lastCost).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {Number(item.minStock)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={item.isActive ? "default" : "secondary"}>
                                                {item.isActive ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 hover:bg-emerald-500/10"
                                                    onClick={() => openDialog("entry", item.id)}
                                                    aria-label={`Agregar stock a ${item.name}`}
                                                >
                                                    <ArrowUpCircle className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 hover:bg-destructive/10"
                                                    onClick={() => handleDelete(item.id, item.name)}
                                                    aria-label={`Desactivar ${item.name}`}
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

            {/* Stock Movement Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{dialogTitles[dialogType]}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {dialogType === "create" ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="create-name">Nombre *</Label>
                                    <Input
                                        id="create-name"
                                        value={createName}
                                        onChange={(e) => setCreateName(e.target.value)}
                                        placeholder="Ej: Carne de res molida"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create-sku">SKU / Código (opcional)</Label>
                                    <Input
                                        id="create-sku"
                                        value={createSku}
                                        onChange={(e) => setCreateSku(e.target.value)}
                                        placeholder="Ej: CARN-001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create-unit">Unidad de Medida</Label>
                                    <Select value={createUnit} onValueChange={setCreateUnit}>
                                        <SelectTrigger id="create-unit">
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
                                    <Label htmlFor="create-min-stock">Stock Mínimo (alerta)</Label>
                                    <Input
                                        id="create-min-stock"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={createMinStock}
                                        onChange={(e) => setCreateMinStock(e.target.value)}
                                        placeholder="Ej: 5"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Recibirás una alerta cuando el stock sea igual o menor a este valor
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="dialog-item">Ingrediente</Label>
                                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                                        <SelectTrigger id="dialog-item">
                                            <SelectValue placeholder="Seleccionar ingrediente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {items.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.name} ({UNIT_LABELS[item.unit] || item.unit})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dialog-warehouse">
                                        {dialogType === "transfer" ? "Almacén Origen" : "Almacén"}
                                    </Label>
                                    <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                                        <SelectTrigger id="dialog-warehouse">
                                            <SelectValue placeholder="Seleccionar almacén" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map((w) => (
                                                <SelectItem key={w.id} value={w.id}>
                                                    {w.name} {w.isDefault ? "(Principal)" : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {dialogType === "transfer" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="dialog-to-warehouse">Almacén Destino</Label>
                                        <Select value={toWarehouse} onValueChange={setToWarehouse}>
                                            <SelectTrigger id="dialog-to-warehouse">
                                                <SelectValue placeholder="Seleccionar destino" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {warehouses
                                                    .filter((w) => w.id !== selectedWarehouse)
                                                    .map((w) => (
                                                        <SelectItem key={w.id} value={w.id}>
                                                            {w.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="dialog-quantity">Cantidad</Label>
                                    <Input
                                        id="dialog-quantity"
                                        type="number"
                                        min="0.001"
                                        step="0.001"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="Ej: 10"
                                    />
                                </div>

                                {dialogType === "entry" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="dialog-cost">Costo Unitario ($)</Label>
                                        <Input
                                            id="dialog-cost"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={unitCost}
                                            onChange={(e) => setUnitCost(e.target.value)}
                                            placeholder="Ej: 5000"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="dialog-reason">Razón (opcional)</Label>
                                    <Input
                                        id="dialog-reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Ej: Compra semanal"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isPending}
                        >
                            {isPending ? "Procesando..." : "Confirmar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    )
}
