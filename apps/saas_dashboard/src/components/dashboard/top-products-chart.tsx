"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@alvarosky/ui"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
    cantidad: {
        label: "Platos",
        color: "hsl(var(--chart-3))",
    },
    ingresos: {
        label: "Ingresos",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export interface TopProductData {
    name: string
    cantidad: number
    ingresos: number
}

interface TopProductsChartProps {
    data: TopProductData[]
}

export function TopProductsChart({ data }: TopProductsChartProps) {
    const hasData = data.length > 0

    return (
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Productos Más Vendidos</CardTitle>
                <CardDescription>Top 5 del mes actual</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                {hasData ? (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ left: 10, right: 10, top: 5, bottom: 5 }}
                        >
                            <YAxis
                                dataKey="name"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                width={110}
                                tick={{ fontSize: 12 }}
                            />
                            <XAxis type="number" hide />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, name) => {
                                            if (name === "ingresos") {
                                                return `$${Number(value).toLocaleString("es-CO")}`
                                            }
                                            return `${value} unidades`
                                        }}
                                    />
                                }
                            />
                            <Bar
                                dataKey="cantidad"
                                fill="var(--color-cantidad)"
                                radius={[0, 6, 6, 0]}
                                barSize={24}
                            />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-[280px] bg-card/40 rounded-xl border border-dashed border-border/50">
                        <p className="text-sm text-muted-foreground">
                            No hay datos de ventas todavía
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
