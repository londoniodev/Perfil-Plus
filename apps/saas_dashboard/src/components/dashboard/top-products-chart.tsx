"use client"

import { Bar, BarChart, XAxis, YAxis, LabelList, Cell } from "recharts"
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
import { generateThemeColors } from "@/lib/chart-colors"

const chartConfig = {
    cantidad: {
        label: "Platos",
        color: "hsl(var(--primary))",
    },
    ingresos: {
        label: "Ingresos",
        color: "hsl(var(--primary) / 0.6)",
    },
} satisfies ChartConfig

export interface TopProductData {
    name: string
    cantidad: number
    ingresos: number
}

interface TopProductsChartProps {
    data: TopProductData[]
    periodLabel?: string
}

export function TopProductsChart({ data, periodLabel }: TopProductsChartProps) {
    const hasData = data.length > 0
    const colors = generateThemeColors(data.length)

    return (
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Productos Más Vendidos</CardTitle>
                <CardDescription>Top 5 de {periodLabel || "el período seleccionado"}</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                {hasData ? (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ left: 10, right: 40, top: 5, bottom: 5 }}
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
                                                return new Intl.NumberFormat("es-CO", {
                                                    style: "currency",
                                                    currency: "COP",
                                                    maximumFractionDigits: 0,
                                                }).format(Number(value))
                                            }
                                            return `${value} unidades`
                                        }}
                                    />
                                }
                            />
                            <Bar
                                dataKey="cantidad"
                                radius={[0, 6, 6, 0]}
                                barSize={24}
                            >
                                {data.map((_, index) => (
                                    <Cell key={index} fill={colors[index] || colors[0]} />
                                ))}
                                <LabelList
                                    dataKey="cantidad"
                                    position="right"
                                    className="fill-foreground text-xs font-medium"
                                />
                            </Bar>
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
