"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell } from "recharts"
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
    total: {
        label: "Ingresos",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig

export interface PaymentMethodData {
    method: string
    label: string
    total: number
    count: number
}

interface PaymentMethodsChartProps {
    data: PaymentMethodData[]
    periodLabel?: string
}

export function PaymentMethodsChart({ data, periodLabel }: PaymentMethodsChartProps) {
    const hasData = data.length > 0 && data.some((d) => d.total > 0)

    // Sort by total descending for color assignment
    const sortedData = [...data].sort((a, b) => b.total - a.total)
    const colors = generateThemeColors(sortedData.length)

    return (
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Métodos de Pago</CardTitle>
                <CardDescription>Distribución de ingresos de {periodLabel || "el período seleccionado"}</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                {hasData ? (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
                        <BarChart data={sortedData} margin={{ left: 10, right: 10 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis hide />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        formatter={(value) => {
                                            return new Intl.NumberFormat("es-CO", {
                                                style: "currency",
                                                currency: "COP",
                                                maximumFractionDigits: 0,
                                            }).format(Number(value))
                                        }}
                                    />
                                }
                            />
                            <Bar
                                dataKey="total"
                                radius={[6, 6, 0, 0]}
                                barSize={48}
                            >
                                {sortedData.map((_, index) => (
                                    <Cell key={index} fill={colors[index] || colors[0]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-[220px] bg-card/40 rounded-xl border border-dashed border-border/50">
                        <p className="text-sm text-muted-foreground">
                            No hay datos de pagos todavía
                        </p>
                    </div>
                )}

                {/* Stats summary below chart */}
                {hasData && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/30 mt-4">
                        {sortedData.map((item) => (
                            <div key={item.method} className="text-center">
                                <p className="text-lg font-bold text-foreground">{item.count}</p>
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
