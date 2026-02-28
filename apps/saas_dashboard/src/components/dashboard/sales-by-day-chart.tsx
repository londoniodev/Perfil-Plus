"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
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
    sales: {
        label: "Ventas Diarias",
        color: "hsl(var(--chart-5))",
    },
} satisfies ChartConfig

export interface SalesByDayData {
    day: string
    sales: number
}

interface SalesByDayChartProps {
    data: SalesByDayData[]
}

export function SalesByDayChart({ data }: SalesByDayChartProps) {
    const hasData = data.length > 0

    return (
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Ventas por Día</CardTitle>
                <CardDescription>Promedio transversal de ventas semanales</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                {hasData ? (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full mt-4">
                        <BarChart
                            data={data}
                            margin={{ left: -10, right: 10, top: 0, bottom: 0 }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                hide={false}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent
                                    indicator="dashed"
                                    formatter={(value) => `$${Number(value).toLocaleString("es-CO")}`}
                                />}
                            />
                            <Bar
                                dataKey="sales"
                                fill="var(--color-sales)"
                                radius={[6, 6, 0, 0]}
                                barSize={30}
                            />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-[280px] bg-card/40 rounded-xl border border-dashed border-border/50">
                        <p className="text-sm text-muted-foreground">
                            No hay datos de ventas diarias todavía
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
