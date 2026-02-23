"use client";

import React from "react";
import FilterTabs from "../../../filter-tabs";

export type StatusFilterType = "all" | "published" | "draft";

export interface StatusFilterProps {
    value: StatusFilterType;
    onValueChange: (value: StatusFilterType) => void;
    stats?: {
        total: number;
        published: number;
        draft: number;
    };
    className?: string;
}

export function StatusFilter({ value, onValueChange, stats, className = "w-full" }: StatusFilterProps) {
    const tabs: { id: StatusFilterType; label: string }[] = [
        { id: "all", label: stats !== undefined ? `Todos (${stats.total})` : "Todos" },
        { id: "published", label: stats !== undefined ? `Publicados (${stats.published})` : "Publicados" },
        { id: "draft", label: stats !== undefined ? `Borradores (${stats.draft})` : "Borradores" },
    ];

    return (
        <div className={className}>
            <FilterTabs tabs={tabs} activeTab={value} onChange={onValueChange} />
        </div>
    );
}
