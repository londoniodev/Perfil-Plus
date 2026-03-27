"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@alvarosky/ui";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
    totalValue: {
        label: "Costo Total",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export interface MarginCostChartProps {
    data: Array<{
        name: string;
        unit: string;
        totalConsumed: number;
        totalValue: number;
    }>;
}

export function MarginCostChart({ data }: MarginCostChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardHeader>
                    <CardTitle>Ingredientes Más Costosos</CardTitle>
                    <CardDescription>Mayor impacto en el costo total</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center">
                    <div className="flex items-center justify-center h-full w-full bg-card/40 rounded-xl border border-dashed border-border/50">
                        <p className="text-sm text-muted-foreground">
                            No hay suficientes datos. Registra compras de inventario y recetas.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card/60 backdrop-blur-xl border-border/50">
            <CardHeader>
                <CardTitle>Ingredientes de Mayor Impacto (Costo Total)</CardTitle>
                <CardDescription>
                    Ingredientes que representan el mayor costo de salidas
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} />
                            <XAxis
                                type="number"
                                tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                fontSize={11}
                                width={80}
                                tickFormatter={(value: string) => value.length > 12 ? value.slice(0, 10) + '\u2026' : value}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'hsl(var(--primary))', opacity: 0.1 }}
                                content={
                                    <ChartTooltipContent
                                        indicator="line"
                                        formatter={(value) => formatCurrency(value as number)}
                                    />
                                }
                            />
                            <Bar
                                dataKey="totalValue"
                                fill="var(--color-totalValue)"
                                radius={[0, 4, 4, 0]}
                                barSize={24}
                            />
                        </BarChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
}
