"use client"

import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts"
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
        label: "Tiempo (min)",
        theme: {
            light: "hsl(27, 87%, 67%)",
            dark: "hsl(340, 75%, 55%)"
        }
    },
} satisfies ChartConfig

export interface TableTimeData {
    range: string
    time: number
}

interface TableTimeChartProps {
    data: TableTimeData[]
}

export function TableTimeChart({ data }: TableTimeChartProps) {
    const hasData = data.length > 0

    return (
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Tiempo Promedio en Mesa</CardTitle>
                <CardDescription>Por rango de precios</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                {hasData ? (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full mt-4">
                        <AreaChart
                            data={data}
                            margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="fillTableTime" x1="0" y1="0" x2="0" y2="1">
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
                                dataKey="range"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                hide={false}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => val === 0 ? "" : `${val}m`}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Area
                                type="monotone"
                                dataKey="time"
                                fill="url(#fillTableTime)"
                                stroke="var(--color-time)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-[280px] bg-card/40 rounded-xl border border-dashed border-border/50">
                        <p className="text-sm text-muted-foreground">
                            No hay datos de mesas todavía
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
