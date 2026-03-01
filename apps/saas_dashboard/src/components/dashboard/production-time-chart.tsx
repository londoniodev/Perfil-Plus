"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@alvarosky/ui"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Timer } from "lucide-react"

export interface ProductionTimeData {
    step: string
    time: number
}

interface ProductionTimeChartProps {
    data: ProductionTimeData[]
}

const chartConfig = {
    time: {
        label: "Minutos",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig

export function ProductionTimeChart({ data }: ProductionTimeChartProps) {
    const hasData = data.length > 0 && data.some((d) => d.time > 0)

    // Reverse for horizontal chart rendering from top to bottom
    const chartData = [...data].reverse()

    return (
        <Card className="flex flex-col border border-border/50 shadow-sm col-span-1 lg:col-span-1">
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Timer className="h-4 w-4 text-primary" />
                    Tiempos de Entrega (Promedios)
                </CardTitle>
                <CardDescription>Tiempo promedio en minutos por etapa</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
                {!hasData ? (
                    <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md">
                        No hay datos de tiempos para mostrar.
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <BarChart
                            accessibilityLayer
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                        >
                            <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.3} />
                            <YAxis
                                dataKey="step"
                                type="category"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                width={80}
                            />
                            <XAxis
                                dataKey="time"
                                type="number"
                                hide
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" hideLabel />}
                            />
                            <Bar
                                dataKey="time"
                                fill="var(--color-time)"
                                radius={[0, 4, 4, 0]}
                                barSize={30}
                            >
                                <LabelList
                                    dataKey="time"
                                    position="right"
                                    offset={8}
                                    className="fill-foreground font-medium"
                                    fontSize={12}
                                    formatter={(value: number) => `${value} min`}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
