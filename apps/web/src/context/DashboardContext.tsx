"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface DashboardContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
    undefined
);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed((prev) => !prev);
    };

    return (
        <DashboardContext.Provider value={{ isCollapsed, toggleSidebar }}>
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
