"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@alvarosky/ui";
import { CalendarIcon } from "lucide-react";

export function DashboardTimeSelector({ currentPeriod }: { currentPeriod: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePeriodChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("period", value);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select
                defaultValue={currentPeriod || "30d"}
                onValueChange={handlePeriodChange}
            >
                <SelectTrigger className="w-[180px] h-10">
                    <SelectValue placeholder="Periodo de tiempo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="7d">Últimos 7 días</SelectItem>
                    <SelectItem value="30d">Últimos 30 días</SelectItem>
                    <SelectItem value="3m">Últimos 3 meses</SelectItem>
                    <SelectItem value="6m">Últimos 6 meses</SelectItem>
                    <SelectItem value="1y">Este Año (Desde Ene 1)</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
