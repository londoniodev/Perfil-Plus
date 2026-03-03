"use client";

import { useEffect, useState } from "react";
import { getDashboardMetrics, type DashboardMetrics } from "@/actions/admin/inventory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@alvarosky/ui";
import { PackageX, TrendingUp, AlertTriangle } from "lucide-react";

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export function CostingSummaryCards({ tenantId }: { tenantId: string }) {
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
        return (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <div className="h-32 bg-card/60 animate-pulse rounded-xl border" />
                <div className="h-32 bg-card/60 animate-pulse rounded-xl border" />
            </div>
        );
    }

    if (!metrics) return null;

    return (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Margen Promedio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.avgMargin.toFixed(1)}%</div>
                    <CardDescription>Rentabilidad media del menú</CardDescription>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alertas de Inventario</CardTitle>
                    {metrics.lowStockCount > 0 ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    ) : (
                        <PackageX className="h-4 w-4 text-muted-foreground" />
                    )}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.lowStockCount}</div>
                    <CardDescription>Ingredientes bajos en stock</CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
