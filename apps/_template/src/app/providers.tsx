"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { createContext, useContext } from "react";

export type PublicNavItem = {
    label: string;
    href: string;
    external?: boolean;
};

export type TenantContextType = {
    tenantId: string;
    features: string[];
    headerLinks?: PublicNavItem[] | null;
    footerLinks?: PublicNavItem[] | null;
};

const TenantContext = createContext<TenantContextType>({ 
    tenantId: "default",
    features: [],
});

export function useTenant() {
    return useContext(TenantContext);
}

export function TenantProvider({ 
    children, 
    tenantId,
    features = [],
    headerLinks = null,
    footerLinks = null
}: { 
    children: React.ReactNode, 
    tenantId: string,
    features?: string[],
    headerLinks?: PublicNavItem[] | null,
    footerLinks?: PublicNavItem[] | null,
}) {
    return (
        <TenantContext.Provider value={{ tenantId, features, headerLinks, footerLinks }}>
            {children}
        </TenantContext.Provider>
    );
}

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

