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
        <Tabs value={value} onValueChange={(v) => onValueChange(v as StatusFilterType)} className={className}>
            <TabsList>
                <TabsTrigger value="all">
                    Todos {stats !== undefined ? `(${stats.total})` : ""}
                </TabsTrigger>
                <TabsTrigger value="published">
                    Publicados {stats !== undefined ? `(${stats.published})` : ""}
                </TabsTrigger>
                <TabsTrigger value="draft">
                    Borradores {stats !== undefined ? `(${stats.draft})` : ""}
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
