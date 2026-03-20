import { NavigationWrapper } from "@/components/layout/NavigationWrapper";
import { Footer } from "@/components/layout/Footer";
import { getTenantId } from "@/lib/config-server";
import { getTenantDesign } from "@/lib/tenant-server";
import { FEATURE_ROUTES } from "@alvarosky/types";
import { headers } from "next/headers";
import React from "react";

export default async function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const tenantId = await getTenantId();
    const design = await getTenantDesign(tenantId);

    const headerLinksFromDb = design?.headerLinks || null;
    const footerLinks = design?.footerLinks || null;
    const contactPhone = design?.contactPhone || null;
    const contactEmail = design?.contactEmail || null;
    const businessName = design?.name || null;
    const tenantTagline = design?.brandSettings?.tagline || design?.tagline || null;
    const logoUrl = design?.brandSettings?.logoUrl || design?.logo || '/images/branding/icon.png';

    const headersList = await headers();
    const tenantFeaturesRaw = headersList.get('x-tenant-feature-list') || headersList.get('x-tenant-features');
    const tenantSlugRaw = headersList.get('x-tenant-slug') || tenantId;

    let featureArray: string[] = [];
    if (tenantFeaturesRaw) {
        try {
            featureArray = JSON.parse(tenantFeaturesRaw);
        } catch (e) {
            // Intento de parsear si viene como string separado por comas
            featureArray = tenantFeaturesRaw.split(",");
        }
    }


    // --- LÓGICA DE NAVEGACIÓN UNIFICADA ---
    const upperFeatures = new Set(featureArray.map(f => f.toUpperCase()));

    // 1. Base: enlaces personalizados del tenant, o fallback con "Inicio"
    let navLinks = headerLinksFromDb?.length
        ? [...headerLinksFromDb]
        : [{ label: "Inicio", href: "/" }];

    // 2. Auto-inyectar enlaces de features activas que no existan aún (Merge declarativo)
    for (const [feature, route] of Object.entries(FEATURE_ROUTES)) {
        const isActive = upperFeatures.has(feature);
        const alreadyExists = navLinks.some(link => link.href === route.href);

        if (isActive && !alreadyExists) {
            navLinks.push(route);
        }
    }

    // 3. Seguridad: filtrar enlaces de features NO activas (ej. /menu sin RESTAURANT)
    navLinks = navLinks.filter(link => {
        const restrictedRoute = Object.entries(FEATURE_ROUTES).find(
            ([, route]) => route.href === link.href
        );
        // Si el enlace no pertenece a ninguna feature restringida, se mantiene siempre
        if (!restrictedRoute) return true;
        // Si pertenece a una feature, solo se mantiene si la feature está activa
        return upperFeatures.has(restrictedRoute[0]);
    });

    const hasDashboardFeature = featureArray.includes('dashboard') || featureArray.length > 0;

    return (
        <NavigationWrapper
            logo={logoUrl}
            links={navLinks}
            showAuthButtons={hasDashboardFeature}
            footer={
                <Footer
                    logo={logoUrl}
                    footerLinks={footerLinks}
                    businessName={businessName || undefined}
                    businessEmail={contactEmail || undefined}
                    businessPhone={contactPhone || undefined}
                    tagline={tenantTagline || undefined}
                    features={featureArray}
                />
            }
        >
            {children}
        </NavigationWrapper>
    );
}
