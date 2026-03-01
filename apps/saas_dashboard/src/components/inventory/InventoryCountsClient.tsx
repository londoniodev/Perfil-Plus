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
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@alvarosky/ui"
import { Plus, ClipboardCheck, Eye, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import type { InventoryCount, Warehouse } from "@/actions/admin/inventory"
import {
    createInventoryCount,
    completeInventoryCount,
    getInventoryCount,
} from "@/actions/admin/inventory"

const UNIT_LABELS: Record<string, string> = { KG: "Kg", GR: "Gr", LT: "Lt", ML: "Ml", UN: "Un" }

export function InventoryCountsClient({
    counts,
    warehouses,
}: {
    counts: InventoryCount[]
    warehouses: Warehouse[]
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouses[0]?.id || "")
    const [notes, setNotes] = useState("")

    // Count form state
    const [countDialogOpen, setCountDialogOpen] = useState(false)
    const [activeCount, setActiveCount] = useState<InventoryCount | null>(null)
    const [countLines, setCountLines] = useState<Array<{
        inventoryItemId: string
        itemName: string
        unit: string
        systemStock: number
        countedStock: string
        adjustmentType: string
    }>>([])

    function handleCreate() {
        if (!selectedWarehouse) {
            toast.error("Selecciona un almacén")
            return
        }

        startTransition(async () => {
            const result = await createInventoryCount({
                warehouseId: selectedWarehouse,
                notes: notes || undefined,
            })

            if (result.success && result.data) {
                toast.success("Conteo creado. Ingresa las cantidades contadas.")
                setCreateDialogOpen(false)
                // Open the count directly
                openCountForm(result.data)
            } else {
                toast.error(result.error)
            }
        })
    }

    async function openCountForm(count: InventoryCount) {
        try {
            // Get full count with lines
            let fullCount = count
            if (!count.lines) {
                fullCount = await getInventoryCount(count.id)
            }
            setActiveCount(fullCount)
            setCountLines(
                (fullCount.lines || []).map((line) => ({
                    inventoryItemId: line.inventoryItem.id,
                    itemName: line.inventoryItem.name,
                    unit: line.inventoryItem.unit,
                    systemStock: Number(line.systemStock),
                    countedStock: "",
                    adjustmentType: "MERMA",
                }))
            )
            setCountDialogOpen(true)
        } catch (error) {
            toast.error("Error al cargar el conteo")
        }
    }

    function updateCountLine(index: number, field: string, value: string) {
        const updated = [...countLines]
        updated[index] = { ...updated[index], [field]: value }
        setCountLines(updated)
    }

    function handleComplete() {
        if (!activeCount) return

        const filledLines = countLines.filter((l) => l.countedStock !== "")
        if (filledLines.length === 0) {
            toast.error("Ingresa al menos una cantidad contada")
            return
        }

        startTransition(async () => {
            const result = await completeInventoryCount(activeCount.id, {
                lines: filledLines.map((l) => ({
                    inventoryItemId: l.inventoryItemId,
                    countedStock: parseFloat(l.countedStock),
                    adjustmentType: parseFloat(l.countedStock) !== l.systemStock
                        ? l.adjustmentType
                        : undefined,
                })),
            })

            if (result.success) {
                toast.success("Conteo completado. Stock ajustado.")
                setCountDialogOpen(false)
                setActiveCount(null)
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <section className="space-y-6">
            {/* Create button */}
            <div className="flex justify-end">
                <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
                >
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Nuevo Conteo
                </Button>
            </div>

            {/* Counts list */}
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Almacén</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                            <TableHead className="text-center">Líneas</TableHead>
                            <TableHead>Notas</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {counts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No hay conteos registrados. Realiza tu primer conteo de inventario.
                                </TableCell>
                            </TableRow>
                        ) : (
                            counts.map((count) => (
                                <TableRow key={count.id}>
                                    <TableCell className="font-mono text-sm">
                                        {new Date(count.createdAt).toLocaleDateString("es-CO", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </TableCell>
                                    <TableCell>{count.warehouse.name}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={count.status === "COMPLETED" ? "default" : "secondary"}>
                                            {count.status === "COMPLETED"
                                                ? "Completado"
                                                : "Borrador"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">{count._count?.lines ?? "—"}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                        {count.notes || "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {count.status === "DRAFT" ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openCountForm(count)}
                                                disabled={isPending}
                                            >
                                                <ClipboardCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                                                Contar
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openCountForm(count)}
                                            >
                                                <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                                                Ver
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create count dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nuevo Conteo Físico</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="count-warehouse">Almacén</Label>
                            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                                <SelectTrigger id="count-warehouse">
                                    <SelectValue placeholder="Seleccionar almacén" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map((w) => (
                                        <SelectItem key={w.id} value={w.id}>
                                            {w.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="count-notes">Notas (opcional)</Label>
                            <Input
                                id="count-notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ej: Conteo semanal"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreate} disabled={isPending}>
                            {isPending ? "Creando..." : "Iniciar Conteo"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Count form dialog */}
            <Dialog open={countDialogOpen} onOpenChange={setCountDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Conteo Físico — {activeCount?.warehouse.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        {countLines.map((line, idx) => {
                            const diff = line.countedStock
                                ? parseFloat(line.countedStock) - line.systemStock
                                : null

                            return (
                                <div
                                    key={line.inventoryItemId}
                                    className={`grid gap-2 grid-cols-[1fr_80px_80px_80px_100px] items-center py-2 px-3 rounded-md ${diff !== null && diff !== 0 ? "bg-orange-500/10" : ""
                                        }`}
                                >
                                    <div>
                                        <p className="font-medium text-sm">{line.itemName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Sistema: {line.systemStock} {UNIT_LABELS[line.unit] || line.unit}
                                        </p>
                                    </div>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Real"
                                        value={line.countedStock}
                                        onChange={(e) => updateCountLine(idx, "countedStock", e.target.value)}
                                        disabled={activeCount?.status === "COMPLETED"}
                                        aria-label={`Conteo real de ${line.itemName}`}
                                        className="text-center"
                                    />
                                    <div className="text-center text-sm font-mono">
                                        {diff !== null ? (
                                            <span className={diff === 0 ? "text-muted-foreground" : diff > 0 ? "text-emerald-500" : "text-red-500"}>
                                                {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                                            </span>
                                        ) : "—"}
                                    </div>
                                    <div className="text-center">
                                        {diff !== null && diff !== 0 && (
                                            <AlertTriangle className="h-4 w-4 text-orange-500 mx-auto" aria-label="Diferencia detectada" />
                                        )}
                                    </div>
                                    {diff !== null && diff < 0 && (
                                        <Select
                                            value={line.adjustmentType}
                                            onValueChange={(v) => updateCountLine(idx, "adjustmentType", v)}
                                            disabled={activeCount?.status === "COMPLETED"}
                                        >
                                            <SelectTrigger aria-label={`Tipo ajuste ${line.itemName}`} className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MERMA">Merma</SelectItem>
                                                <SelectItem value="FUGA">Fuga</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    {activeCount?.status === "DRAFT" && (
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCountDialogOpen(false)}>
                                Guardar Borrador
                            </Button>
                            <Button onClick={handleComplete} disabled={isPending}>
                                {isPending ? "Procesando..." : "Completar Conteo"}
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    )
}
