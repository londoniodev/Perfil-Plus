"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "../../../tabs";

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
    return (
        <div className={className}>
            <Tabs value={value} onValueChange={(v: string) => onValueChange(v as StatusFilterType)}>
                <TabsList className="justify-start mb-4">
                    <TabsTrigger value="all">
                        {stats !== undefined ? `Todos (${stats.total})` : "Todos"}
                    </TabsTrigger>
                    <TabsTrigger value="published">
                        {stats !== undefined ? `Publicados (${stats.published})` : "Publicados"}
                    </TabsTrigger>
                    <TabsTrigger value="draft">
                        {stats !== undefined ? `Borradores (${stats.draft})` : "Borradores"}
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
