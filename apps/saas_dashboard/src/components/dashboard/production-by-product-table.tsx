"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@alvarosky/ui"
import { ChefHat } from "lucide-react"

export interface ProductionByProductData {
    productName: string
    avgMinutes: number
}

interface ProductionByProductTableProps {
    data: ProductionByProductData[]
}

export function ProductionByProductTable({ data }: ProductionByProductTableProps) {
    const hasData = data && data.length > 0

    return (
        <Card className="flex flex-col border border-border/50 shadow-sm col-span-1 lg:col-span-1 min-h-[350px]">
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-primary" />
                    Tiempos de Producción
                </CardTitle>
                <CardDescription>
                    Promedio cocina en minutos por producto (despacho)
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4 overflow-auto">
                {!hasData ? (
                    <div className="flex h-[200px] w-full items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md">
                        Ningún dato de producción para mostrar aún.
                    </div>
                ) : (
                    <div className="rounded-md border bg-card/40">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[60%]">Producto</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Promedio</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) => (
                                    <TableRow key={`${item.productName}-${index}`}>
                                        <TableCell className="font-medium">
                                            {item.productName}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-muted-foreground">
                                            {item.avgMinutes} min
                                        </TableCell>
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
