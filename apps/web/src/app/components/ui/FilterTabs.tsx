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
        <div className="no-scrollbar" style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            whiteSpace: "nowrap",
            paddingBottom: "0.25rem",
            // Eliminate horizontal scrollbar visual if possible (via class) or accepted
        }}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        style={{
                            padding: "0.5rem 1rem",
                            background: isActive ? "var(--accent)" : "var(--card-bg)",
                            color: isActive ? "white" : "var(--foreground)",
                            border: "1px solid var(--border)",
                            borderRadius: "0.375rem",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            transition: "all 0.15s ease",
                            flexShrink: 0, // Prevent shrinking
                        }}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
