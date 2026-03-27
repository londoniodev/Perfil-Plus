"use client"

import * as React from "react"
import { Pie, PieChart, Cell, Label } from "recharts"
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
    orders: {
        label: "Órdenes",
    },
    DINE_IN: {
        label: "Mesa",
        color: "hsl(var(--primary))",
    },
    TAKE_AWAY: {
        label: "Para Llevar",
        color: "hsl(var(--primary) / 0.60)",
    },
    DELIVERY: {
        label: "Domicilio",
        color: "hsl(var(--primary) / 0.35)",
    },
} satisfies ChartConfig


export interface OrderTypeData {
    type: string
    label: string
    count: number
    total: number
    fill: string
}

interface OrderTypeChartProps {
    data: OrderTypeData[]
    periodLabel?: string
}

export function OrderTypeChart({ data, periodLabel }: OrderTypeChartProps) {
    const totalOrders = React.useMemo(
        () => data.reduce((acc, curr) => acc + curr.count, 0),
        [data]
    )

    const hasData = data.length > 0 && totalOrders > 0

    // Sort by count descending and assign degraded colors
    const sortedData = React.useMemo(() => {
        const sorted = [...data].sort((a, b) => b.count - a.count)
        const colors = generateThemeColors(sorted.length)
        return sorted.map((item, i) => ({ ...item, fill: colors[i] }))
    }, [data])

    return (
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl flex flex-col">
            <CardHeader className="pb-0">
                <CardTitle className="text-base">Tipo de Orden</CardTitle>
                <CardDescription>Distribución de {periodLabel || "el período seleccionado"}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                {hasData ? (
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[280px]"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, name, item) => {
                                            const income = item?.payload?.total || 0;
                                            const formattedIncome = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(income);
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <span>{value} órdenes</span>
                                                    <span className="text-muted-foreground ml-2">({formattedIncome})</span>
                                                </div>
                                            )
                                        }}
                                        hideLabel
                                    />
                                }
                            />
                            <Pie
                                data={sortedData}
                                dataKey="count"
                                nameKey="label"
                                innerRadius={60}
                                strokeWidth={5}
                                paddingAngle={3}
                            >
                                {sortedData.map((entry) => (
                                    <Cell
                                        key={entry.type}
                                        fill={entry.fill}
                                    />
                                ))}
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {totalOrders}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground text-sm"
                                                    >
                                                        Órdenes
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-[280px] bg-card/40 rounded-xl border border-dashed border-border/50">
                        <p className="text-sm text-muted-foreground">
                            No hay órdenes registradas
                        </p>
                    </div>
                )}

                {/* Legend */}
                {hasData && (
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 pb-4 pt-2">
                        {sortedData.map((entry) => (
                            <div key={entry.type} className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full shrink-0"
                                    style={{ backgroundColor: entry.fill }}
                                    aria-hidden="true"
                                />
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span className="font-medium text-foreground">{entry.label}</span>
                                    <span>({entry.count})</span>
                                    <span>-</span>
                                    <span>{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(entry.total || 0)}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
