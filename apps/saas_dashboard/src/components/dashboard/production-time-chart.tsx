"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
    time: {
        label: "Minutos",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig

export interface ProductionTimeData {
    step: string
    time: number
}

interface ProductionTimeChartProps {
    data: ProductionTimeData[]
}

export function ProductionTimeChart({ data }: ProductionTimeChartProps) {
    const hasData = data.length > 0

    return (
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Tiempo de Producción</CardTitle>
                <CardDescription>Minutos desde orden hasta entrega</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                {hasData ? (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full mt-4">
                        <AreaChart
                            data={data}
                            margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="fillTime" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-time)"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-time)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                            <XAxis
                                dataKey="step"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                hide={false}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(val) => `${val}m`}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Area
                                type="monotone"
                                dataKey="time"
                                fill="url(#fillTime)"
                                stroke="var(--color-time)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-[280px] bg-card/40 rounded-xl border border-dashed border-border/50">
                        <p className="text-sm text-muted-foreground">
                            No hay datos de producción todavía
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
