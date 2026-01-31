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
        <Card className="transition-all duration-200 hover:shadow-md">
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            {title}
                        </p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold tracking-tight">
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
                    <div className="rounded-full bg-primary/10 p-3">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
