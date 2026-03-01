"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@alvarosky/ui"
import { Timer } from "lucide-react"

export interface ProductionTimeData {
    step: string
    time: number
}

interface ProductionTimeChartProps {
    data: ProductionTimeData[]
}

export function ProductionTimeChart({ data }: ProductionTimeChartProps) {
    const hasData = data.length > 0 && data.some((d) => d.time > 0)

    return (
        <Card className="flex flex-col border border-border/50 shadow-sm col-span-1 lg:col-span-1">
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Timer className="h-4 w-4 text-primary" />
                    Tiempos de Entrega (Promedios)
                </CardTitle>
                <CardDescription>Tiempo promedio en minutos por etapa</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
                {!hasData ? (
                    <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md">
                        No hay datos de tiempos para mostrar.
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Etapa</TableHead>
                                    <TableHead className="text-right">Tiempo Promedio</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) => (
                                    <TableRow key={`${item.step}-${index}`}>
                                        <TableCell className="font-medium">{item.step}</TableCell>
                                        <TableCell className="text-right">{item.time.toFixed(1)} min</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
