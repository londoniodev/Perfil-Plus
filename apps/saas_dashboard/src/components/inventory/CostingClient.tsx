"use client"

import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card
} from "@alvarosky/ui"
import { Badge } from "@alvarosky/ui"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CostingData } from "@/actions/admin/inventory"

function getMarginColor(margin: number) {
    if (margin >= 60) return "text-emerald-500"
    if (margin >= 40) return "text-amber-500"
    return "text-red-500"
}

function getMarginBadge(margin: number) {
    if (margin >= 60) return <Badge className="bg-emerald-600">Saludable</Badge>
    if (margin >= 40) return <Badge className="bg-amber-600">Aceptable</Badge>
    return <Badge variant="destructive">Bajo</Badge>
}

function getMarginIcon(margin: number) {
    if (margin >= 60) return <TrendingUp className="h-4 w-4 text-emerald-500" aria-hidden="true" />
    if (margin >= 40) return <Minus className="h-4 w-4 text-amber-500" aria-hidden="true" />
    return <TrendingDown className="h-4 w-4 text-red-500" aria-hidden="true" />
}

export function CostingClient({ data }: { data: CostingData[] }) {
    const avgMargin = data.length > 0
        ? data.reduce((sum, d) => sum + d.margin, 0) / data.length
        : 0

    return (
        <section className="space-y-6">
            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-xl shadow-sm border-border/50 bg-card/60 backdrop-blur-xl p-5 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-between">Productos Costeados</p>
                    <p className="text-3xl font-bold">{data.length}</p>
                </Card>
                <Card className="rounded-xl shadow-sm border-border/50 bg-card/60 backdrop-blur-xl p-5 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-between">Margen Promedio</p>
                    <p className={`text-3xl font-bold ${getMarginColor(avgMargin)}`}>
                        {avgMargin.toFixed(1)}%
                    </p>
                </Card>
                <Card className="rounded-xl shadow-sm border-border/50 bg-card/60 backdrop-blur-xl p-5 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-between">Alerta de Margen</p>
                    <p className="text-3xl font-bold text-red-500">
                        {data.filter((d) => d.margin < 40).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Productos por debajo del 40%</p>
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
                                                {getMarginIcon(item.margin)}
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
                                        <TableCell className={`text-right font-mono font-bold ${getMarginColor(item.margin)}`}>
                                            {item.margin.toFixed(1)}%
                                        </TableCell>
                                        <TableCell className="text-center font-mono">
                                            {item.recipeYield}
                                        </TableCell>
                                        <TableCell className="text-center pr-4">
                                            {getMarginBadge(item.margin)}
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
