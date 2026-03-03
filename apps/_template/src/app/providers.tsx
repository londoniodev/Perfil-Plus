"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { createContext, useContext } from "react";

const TenantContext = createContext<{ tenantId: string }>({ tenantId: "default" });

export function useTenant() {
    return useContext(TenantContext);
}

export function TenantProvider({ children, tenantId }: { children: React.ReactNode, tenantId: string }) {
    return (
        <TenantContext.Provider value={{ tenantId }}>
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

