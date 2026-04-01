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
    authBgUrl?: string | null;
    authQuote?: string | null;
    logoUrl?: string | null;
    activePaymentProvider: 'MERCADO_PAGO' | 'BOLD' | 'CASH' | 'NONE';
};

const TenantContext = createContext<TenantContextType>({ 
    tenantId: "default",
    features: [],
    activePaymentProvider: 'NONE',
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
    authBgUrl = null,
    authQuote = null,
    logoUrl = null,
    activePaymentProvider = 'NONE',
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
    authBgUrl?: string | null,
    authQuote?: string | null,
    logoUrl?: string | null,
    activePaymentProvider?: 'MERCADO_PAGO' | 'BOLD' | 'CASH' | 'NONE',
}) {
    return (
        <TenantContext.Provider value={{ tenantId, features, headerLinks, footerLinks, contactPhone, contactEmail, businessName, tagline, authBgUrl, authQuote, logoUrl, activePaymentProvider }}>
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

import { CartProvider } from '@/store/use-cart';

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
    primaryColor,
    activePaymentProvider = 'NONE',
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
    primaryColor: string;
    activePaymentProvider?: 'MERCADO_PAGO' | 'BOLD' | 'CASH' | 'NONE';
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
            authBgUrl={design?.brandSettings?.authBgUrl || null}
            authQuote={design?.brandSettings?.authQuote || null}
            logoUrl={design?.brandSettings?.logoUrl || design?.brandSettings?.faviconUrl || design?.logo || '/images/branding/icon.png'}
            activePaymentProvider={activePaymentProvider}
        >
            <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
            >
                <BrandProvider settings={{ ...design, primary: primaryColor } as any}>
                    <CartProvider>
                        {children}
                    </CartProvider>
                </BrandProvider>
            </ThemeProvider>
        </TenantProvider>
    );
}

