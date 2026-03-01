"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@alvarosky/ui"

interface ChefProductionChartProps {
    avgMinutes: number
}

export function ChefProductionChart({ avgMinutes }: ChefProductionChartProps) {
    const getColor = (min: number) => {
        if (min <= 10) return "text-emerald-400"
        if (min <= 20) return "text-amber-400"
        return "text-red-400"
    }

    const getLabel = (min: number) => {
        if (min <= 10) return "Excelente"
        if (min <= 20) return "Normal"
        return "Lento"
    }

    return (
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Tiempos de Producción</CardTitle>
                <CardDescription>Promedio cocina (Empezar → Preparado)</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center gap-2 pb-6">
                {avgMinutes > 0 ? (
                    <>
                        <div className="relative flex items-center justify-center">
                            <svg className="w-36 h-36" viewBox="0 0 120 120">
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    className="stroke-muted/30"
                                    strokeWidth="10"
                                />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    className={avgMinutes <= 10 ? "stroke-emerald-400" : avgMinutes <= 20 ? "stroke-amber-400" : "stroke-red-400"}
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={`${Math.min((avgMinutes / 30) * 314, 314)} 314`}
                                    transform="rotate(-90 60 60)"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className={`text-3xl font-bold ${getColor(avgMinutes)}`}>
                                    {avgMinutes}
                                </span>
                                <span className="text-xs text-muted-foreground">min</span>
                            </div>
                        </div>
                        <span className={`text-sm font-medium ${getColor(avgMinutes)}`}>
                            {getLabel(avgMinutes)}
                        </span>
                        <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                            Tiempo promedio desde que el chef inicia hasta marcar como preparado
                        </p>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-[180px] bg-card/40 rounded-xl border border-dashed border-border/50 w-full">
                        <p className="text-sm text-muted-foreground">
                            Sin datos de producción
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
