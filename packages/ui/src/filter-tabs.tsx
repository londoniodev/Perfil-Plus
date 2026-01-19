"use client";

import * as React from "react";
import { Button } from "./button";

interface FilterTab<T extends string> {
    id: T;
    label: string;
}

interface FilterTabsProps<T extends string> {
    tabs: FilterTab<T>[];
    activeTab: T;
    onChange: (tab: T) => void;
}

/**
 * Componente de pestañas de filtro genérico.
 */
export default function FilterTabs<T extends string>({
    tabs,
    activeTab,
    onChange,
}: FilterTabsProps<T>) {
    return (
        <div className="filter-tabs no-scrollbar">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <Button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        variant="filter"
                        active={isActive}
                    >
                        {tab.label}
                    </Button>
                );
            })}
        </div>
    );
}

export { FilterTabs };


