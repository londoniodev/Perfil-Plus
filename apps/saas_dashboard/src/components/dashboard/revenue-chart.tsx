"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useMobile } from "@/hooks/use-mobile"
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
        color: "var(--primary)",
    },
} satisfies ChartConfig

interface RevenueChartProps {
    data: { date: string; total: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    const isMobile = useMobile()
    const [timeRange, setTimeRange] = React.useState<"30d" | "7d">("30d")

    React.useEffect(() => {
        if (isMobile) {
            setTimeRange("7d")
        }
    }, [isMobile])

    const filteredData = React.useMemo(() => {
        if (!data || data.length === 0) return []

        const now = new Date()
        const daysToSubtract = timeRange === "7d" ? 7 : 30
        const startDate = new Date(now)
        startDate.setDate(startDate.getDate() - daysToSubtract)

        return data.filter((item) => {
            const date = new Date(item.date)
            return date >= startDate
        })
    }, [data, timeRange])

    const hasData = filteredData.length > 0 && filteredData.some((d) => d.total > 0)

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2">
                <div>
                    <CardTitle>Ingresos</CardTitle>
                    <CardDescription>
                        {timeRange === "7d" ? "Últimos 7 días" : "Últimos 30 días"}
                    </CardDescription>
                </div>
                <div className="flex gap-1 rounded-lg border p-1">
                    <button
                        onClick={() => setTimeRange("30d")}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${timeRange === "30d"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        30 días
                    </button>
                    <button
                        onClick={() => setTimeRange("7d")}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${timeRange === "7d"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        7 días
                    </button>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {hasData ? (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <AreaChart data={filteredData}>
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
                    <div className="flex items-center justify-center h-[250px] bg-muted/30 rounded-lg border-2 border-dashed">
                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                No hay datos de ingresos en este período
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Los ingresos aparecerán aquí cuando se registren ventas
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
