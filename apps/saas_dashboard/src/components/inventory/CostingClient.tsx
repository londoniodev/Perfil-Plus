"use client"

import { useState, useTransition } from "react"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card,
    Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
    Label, Input
} from "@alvarosky/ui"
import { Badge } from "@alvarosky/ui"
import { TrendingUp, TrendingDown, Minus, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { CostingData } from "@/actions/admin/inventory"
import { updateCostingMargins } from "@/actions/admin/inventory"

function getMarginColor(margin: number, good: number, low: number) {
    if (margin >= good) return "text-emerald-500"
    if (margin >= low) return "text-amber-500"
    return "text-red-500"
}

function getMarginBadge(margin: number, good: number, low: number) {
    if (margin >= good) return <Badge className="bg-emerald-600">Saludable</Badge>
    if (margin >= low) return <Badge className="bg-amber-600">Aceptable</Badge>
    return <Badge variant="destructive">Bajo</Badge>
}

function getMarginIcon(margin: number, good: number, low: number) {
    if (margin >= good) return <TrendingUp className="h-4 w-4 text-emerald-500" aria-hidden="true" />
    if (margin >= low) return <Minus className="h-4 w-4 text-amber-500" aria-hidden="true" />
    return <TrendingDown className="h-4 w-4 text-red-500" aria-hidden="true" />
}

export function CostingClient({ data, marginGood, marginLow }: { data: CostingData[], marginGood: number, marginLow: number }) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [goodVal, setGoodVal] = useState(marginGood.toString())
    const [lowVal, setLowVal] = useState(marginLow.toString())

    const avgMargin = data.length > 0
        ? data.reduce((sum, d) => sum + d.margin, 0) / data.length
        : 0

    function handleSaveConfig() {
        startTransition(async () => {
            const result = await updateCostingMargins(Number(goodVal), Number(lowVal))
            if (result.success) {
                toast.success("Márgenes actualizados correctamente")
                setOpen(false)
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <section className="space-y-6">
            {/* Header / Actions */}
            <div className="flex items-center justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Settings2 className="h-4 w-4" aria-hidden="true" />
                            Configurar Márgenes
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Márgenes de Costeo</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="marginGood">Porcentaje Saludable (%)</Label>
                                <Input 
                                    id="marginGood" 
                                    type="number" 
                                    value={goodVal} 
                                    onChange={(e) => setGoodVal(e.target.value)} 
                                    min="1" 
                                    max="100" 
                                />
                                <p className="text-xs text-muted-foreground">Margen a partir del cual se considera excelente o saludable.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="marginLow">Porcentaje Aceptable (%)</Label>
                                <Input 
                                    id="marginLow" 
                                    type="number" 
                                    value={lowVal} 
                                    onChange={(e) => setLowVal(e.target.value)} 
                                    min="1" 
                                    max="100" 
                                />
                                <p className="text-xs text-muted-foreground">Margen a partir del cual se considera aceptable (por debajo de este será crítico).</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSaveConfig} disabled={isPending}>
                                {isPending ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-xl shadow-sm border-border/50 bg-card/60 backdrop-blur-xl p-5 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-between">Productos Costeados</p>
                    <p className="text-3xl font-bold">{data.length}</p>
                </Card>
                <Card className="rounded-xl shadow-sm border-border/50 bg-card/60 backdrop-blur-xl p-5 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-between">Margen Promedio</p>
                    <p className={`text-3xl font-bold ${getMarginColor(avgMargin, marginGood, marginLow)}`}>
                        {avgMargin.toFixed(1)}%
                    </p>
                </Card>
                <Card className="rounded-xl shadow-sm border-border/50 bg-card/60 backdrop-blur-xl p-5 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-between">Alerta de Margen</p>
                    <p className="text-3xl font-bold text-red-500">
                        {data.filter((d) => d.margin < marginLow).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Productos por debajo del {marginLow}%</p>
                </Card>
            </div>

            {/* Costing table */}
            <div className="w-full">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-4">Producto</TableHead>
                            <TableHead className="text-right">Precio Venta</TableHead>
                            <TableHead className="text-right">Costo Producción</TableHead>
                            <TableHead className="text-right">Ganancia</TableHead>
                            <TableHead className="text-right">Margen</TableHead>
                            <TableHead className="text-center">Porciones</TableHead>
                            <TableHead className="text-center pr-4">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                    No hay productos costeados. Crea recetas con ingredientes primero.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => {
                                const profit = item.salePrice - item.costPerPortion

                                return (
                                    <TableRow key={item.productId} className="transition-colors hover:bg-muted/30">
                                        <TableCell className="font-medium pl-4">
                                            <div className="flex items-center gap-2">
                                                {getMarginIcon(item.margin, marginGood, marginLow)}
                                                {item.productName}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            ${item.salePrice.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            ${item.costPerPortion.toFixed(0)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            ${profit.toFixed(0)}
                                        </TableCell>
                                        <TableCell className={`text-right font-mono font-bold ${getMarginColor(item.margin, marginGood, marginLow)}`}>
                                            {item.margin.toFixed(1)}%
                                        </TableCell>
                                        <TableCell className="text-center font-mono">
                                            {item.recipeYield}
                                        </TableCell>
                                        <TableCell className="text-center pr-4">
                                            {getMarginBadge(item.margin, marginGood, marginLow)}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </section>
    )
}
