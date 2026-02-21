"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface DashboardContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    breadcrumbOverrides: Record<string, string>;
    setBreadcrumb: (segment: string, label: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
    undefined
);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const [breadcrumbOverrides, setBreadcrumbOverrides] = useState<Record<string, string>>({});

    const toggleSidebar = React.useCallback(() => {
        setIsCollapsed((prev) => !prev);
    }, []);

    const setBreadcrumb = React.useCallback((segment: string, label: string) => {
        setBreadcrumbOverrides(prev => {
            // Avoid update if value is same to prevent infinite loop
            if (prev[segment] === label) return prev;
            return { ...prev, [segment]: label }
        });
    }, []);

    const value = React.useMemo(() => ({
        isCollapsed,
        toggleSidebar,
        breadcrumbOverrides,
        setBreadcrumb
    }), [isCollapsed, toggleSidebar, breadcrumbOverrides, setBreadcrumb]);

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
}

