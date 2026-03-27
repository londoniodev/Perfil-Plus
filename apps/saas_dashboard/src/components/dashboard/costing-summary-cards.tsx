import { StatsCard } from "@/components/dashboard/stats-card";
import { TrendingUp, AlertTriangle } from "lucide-react";

export interface CostingSummaryCardsProps {
    avgMargin: number;
    lowStockCount: number;
}

export function CostingSummaryCards({ avgMargin, lowStockCount }: CostingSummaryCardsProps) {
    return (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            <StatsCard
                title="Margen Promedio"
                value={`${avgMargin.toFixed(1)}%`}
                icon={TrendingUp}
            />
            <StatsCard
                title="Alertas de Inventario"
                value={lowStockCount.toString()}
                icon={AlertTriangle}
            />
        </div>
    );
}
