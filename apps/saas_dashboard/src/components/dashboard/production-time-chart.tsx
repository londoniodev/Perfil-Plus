"use client"

import { Bar, BarChart, XAxis, YAxis, LabelList } from "recharts"
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
        theme: {
            light: "hsl(12, 76%, 61%)",
            dark: "hsl(220, 70%, 50%)"
        }
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
    const hasData = data.length > 0 && data.some((d) => d.time > 0)

    return (
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Tiempos de Entrega</CardTitle>
                <CardDescription>Promedio por etapa (minutos)</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                {hasData ? (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ left: 10, right: 40, top: 5, bottom: 5 }}
                        >
                            <YAxis
                                dataKey="step"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                width={80}
                                tick={{ fontSize: 12 }}
                            />
                            <XAxis
                                type="number"
                                hide
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        formatter={(value) => `${value} min`}
                                    />
                                }
                            />
                            <Bar
                                dataKey="time"
                                fill="var(--color-time)"
                                radius={[0, 6, 6, 0]}
                                barSize={28}
                            >
                                <LabelList
                                    dataKey="time"
                                    position="right"
                                    formatter={(val: number) => `${val}m`}
                                    className="fill-foreground text-sm font-medium"
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-[220px] bg-card/40 rounded-xl border border-dashed border-border/50">
                        <p className="text-sm text-muted-foreground">
                            No hay datos de tiempos
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
