"use client";

import React from "react";

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
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`btn-filter ${isActive ? "active" : ""}`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
