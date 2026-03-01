"use client";

import { useEffect, useState } from "react";
import { getDashboardMetrics, type DashboardMetrics } from "@/actions/admin/inventory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@alvarosky/ui";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export function MarginCostChart({ tenantId }: { tenantId: string }) {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const data = await getDashboardMetrics();
                setMetrics(data);
            } catch (error) {
                console.error("Error fetching costing metrics:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMetrics();
    }, [tenantId]);

    if (loading) {
        return <div className="h-[350px] bg-card/60 animate-pulse rounded-xl border" />;
    }

    if (!metrics || metrics.topExpensiveIngredients.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Ingredientes Más Costosos</CardTitle>
                    <CardDescription>Mayor impacto en el costo total (últimos 30 días)</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    No hay suficientes datos. Registra compras de inventario y recetas.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ingredientes de Mayor Impacto (Costo Total)</CardTitle>
                <CardDescription>
                    Ingredientes que representan el mayor costo de salidas en los últimos 30 días
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={metrics.topExpensiveIngredients}
                            layout="vertical"
                            margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} />
                            <XAxis
                                type="number"
                                tickFormatter={(value) => `$${value / 1000}k`}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                fontSize={12}
                                width={100}
                            />
                            <Tooltip
                                formatter={(value: number) => formatCurrency(value)}
                                cursor={{ fill: 'var(--color-primary)', opacity: 0.1 }}
                                contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)" }}
                            />
                            <Bar
                                dataKey="totalValue"
                                fill="var(--color-primary)"
                                radius={[0, 4, 4, 0]}
                                barSize={24}
                                name="Costo Total"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
