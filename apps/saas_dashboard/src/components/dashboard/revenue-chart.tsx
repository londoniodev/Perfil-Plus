"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
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
    ingresos: {
        label: "Ingresos",
        theme: {
            light: "hsl(12, 76%, 61%)",
            dark: "hsl(220, 70%, 50%)"
        }
    },
} satisfies ChartConfig

interface RevenueChartProps {
    data: { date: string; total: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    const hasData = data && data.length > 0 && data.some((d) => d.total > 0)

    return (
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2">
                <div>
                    <CardTitle>Ingresos</CardTitle>
                    <CardDescription>
                        Flujo de ingresos en el período seleccionado
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {hasData ? (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="fillIngresos" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-ingresos)"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-ingresos)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleDateString("es-ES", {
                                        month: "short",
                                        day: "numeric",
                                    })
                                }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) => {
                                            return new Date(value).toLocaleDateString("es-ES", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                            })
                                        }}
                                        formatter={(value) => {
                                            return `$${Number(value).toLocaleString("es-ES", { minimumFractionDigits: 2 })}`
                                        }}
                                        indicator="dot"
                                    />
                                }
                            />
                            <Area
                                dataKey="total"
                                type="natural"
                                fill="url(#fillIngresos)"
                                stroke="var(--color-ingresos)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-[250px] bg-card/40 rounded-xl border border-dashed border-border/50">
                        <div className="text-center space-y-2 px-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                No hay datos de ingresos en este período
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                                Los ingresos aparecerán aquí cuando se registren ventas
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
