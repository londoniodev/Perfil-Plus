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
    total: {
        label: "Ingresos",
        color: "hsl(var(--chart-2))",
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
}

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
    const hasData = data.length > 0 && data.some((d) => d.total > 0)

    return (
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Métodos de Pago</CardTitle>
                <CardDescription>Distribución de ingresos por método</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                {hasData ? (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
                        <BarChart data={data} margin={{ left: 10, right: 10 }}>
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
                                        formatter={(value, name) => {
                                            return `$${Number(value).toLocaleString("es-CO")}`
                                        }}
                                    />
                                }
                            />
                            <Bar
                                dataKey="total"
                                fill="var(--color-total)"
                                radius={[6, 6, 0, 0]}
                                barSize={48}
                            />
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
                        {data.map((item) => (
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
