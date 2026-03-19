"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { createContext, useContext } from "react";
import { BrandProvider } from "@alvarosky/ui";

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
    contactPhone?: string | null;
    contactEmail?: string | null;
    businessName?: string | null;
    tagline?: string | null;
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
    footerLinks = null,
    contactPhone = null,
    contactEmail = null,
    businessName = null,
    tagline = null,
}: { 
    children: React.ReactNode, 
    tenantId: string,
    features?: string[],
    headerLinks?: PublicNavItem[] | null,
    footerLinks?: PublicNavItem[] | null,
    contactPhone?: string | null,
    contactEmail?: string | null,
    businessName?: string | null,
    tagline?: string | null,
}) {
    return (
        <TenantContext.Provider value={{ tenantId, features, headerLinks, footerLinks, contactPhone, contactEmail, businessName, tagline }}>
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

// NUEVO COMPONENTE DE REFACTORIZACIÓN

export function AppProviders({
    children,
    tenantId,
    features = [],
    headerLinks = null,
    footerLinks = null,
    contactPhone = null,
    contactEmail = null,
    businessName = null,
    tagline = null,
    design,
    isDarkThemeTenant,
    primaryColor,
}: {
    children: React.ReactNode;
    tenantId: string;
    features?: string[];
    headerLinks?: PublicNavItem[] | null;
    footerLinks?: PublicNavItem[] | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    businessName?: string | null;
    tagline?: string | null;
    design: any;
    isDarkThemeTenant: boolean;
    primaryColor: string;
}) {
    return (
        <TenantProvider
            tenantId={tenantId}
            features={features}
            headerLinks={headerLinks}
            footerLinks={footerLinks}
            contactPhone={contactPhone}
            contactEmail={contactEmail}
            businessName={businessName}
            tagline={tagline}
        >
            <ThemeProvider
                attribute="class"
                defaultTheme={isDarkThemeTenant ? "dark" : "light"}
                enableSystem={!isDarkThemeTenant}
                forcedTheme={isDarkThemeTenant ? "dark" : undefined}
            >
                <BrandProvider settings={{ ...design, primary: primaryColor } as any}>
                    {children}
                </BrandProvider>
            </ThemeProvider>
        </TenantProvider>
    );
}

