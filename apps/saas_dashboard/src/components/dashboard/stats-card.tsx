import { Card, CardContent } from "@alvarosky/ui";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp }: StatsCardProps) {
    return (
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card/60 backdrop-blur-xl border-border/50 hover:border-primary/20">
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />

            <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between space-x-4">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground/80 tracking-tight">
                            {title}
                        </p>
                        <div className="mt-3 flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold tracking-tight text-foreground">
                                {value}
                            </h3>
                            {trend && (
                                <span
                                    className={`text-sm font-medium ${trendUp === undefined
                                        ? "text-muted-foreground"
                                        : trendUp
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-600 dark:text-red-400"
                                        }`}
                                >
                                    {trend}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="rounded-2xl bg-primary/10 p-3 ring-1 ring-primary/20 shrink-0">
                        <Icon className="h-5 w-5 text-primary" strokeWidth={2.5} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
