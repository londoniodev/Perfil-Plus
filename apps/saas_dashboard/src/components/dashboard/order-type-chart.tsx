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

const chartConfig = {
    orders: {
        label: "Órdenes",
    },
    DINE_IN: {
        label: "Mesa",
        theme: {
            light: "hsl(12, 76%, 61%)",
            dark: "hsl(220, 70%, 50%)"
        }
    },
    TAKE_AWAY: {
        label: "Para Llevar",
        theme: {
            light: "hsl(173, 58%, 39%)",
            dark: "hsl(160, 60%, 45%)"
        }
    },
    DELIVERY: {
        label: "Domicilio",
        theme: {
            light: "hsl(197, 37%, 24%)",
            dark: "hsl(30, 80%, 55%)"
        }
    },
} satisfies ChartConfig


export interface OrderTypeData {
    type: string
    label: string
    count: number
    fill: string
}

interface OrderTypeChartProps {
    data: OrderTypeData[]
}

export function OrderTypeChart({ data }: OrderTypeChartProps) {
    const totalOrders = React.useMemo(
        () => data.reduce((acc, curr) => acc + curr.count, 0),
        [data]
    )

    const hasData = data.length > 0 && totalOrders > 0

    return (
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl flex flex-col">
            <CardHeader className="pb-0">
                <CardTitle className="text-base">Tipo de Orden</CardTitle>
                <CardDescription>Distribución del mes actual</CardDescription>
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
                                        formatter={(value) => `${value} órdenes`}
                                        hideLabel
                                    />
                                }
                            />
                            <Pie
                                data={data}
                                dataKey="count"
                                nameKey="label"
                                innerRadius={60}
                                strokeWidth={5}
                                paddingAngle={3}
                            >
                                {data.map((entry) => (
                                    <Cell
                                        key={entry.type}
                                        fill={`var(--color-${entry.type})`}
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
                    <div className="flex justify-center gap-6 pb-4 pt-2">
                        {data.map((entry, index) => (
                            <div key={entry.type} className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full shrink-0"
                                    style={{ backgroundColor: `var(--color-${entry.type})` }}
                                    aria-hidden="true"
                                />
                                <span className="text-xs text-muted-foreground">
                                    {entry.label} ({entry.count})
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
