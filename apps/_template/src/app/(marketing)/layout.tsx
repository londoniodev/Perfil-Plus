import { NavigationWrapper } from "@/components/layout/NavigationWrapper";
import { Footer } from "@/components/layout/Footer";
import { getTenantId } from "@/lib/config-server";
import { getTenantDesign, identifyTenantByHost } from "@/lib/tenant-server";
import { FEATURE_ROUTES } from "@alvarosky/types";
import { headers } from "next/headers";
import React from "react";

export default async function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    
    let tenantId = await getTenantId();
    let design = await getTenantDesign(tenantId);
    
    // Identificación Ultra-Robusta (Fallbacks en cascada)
    let identified = null;
    // 1. Si no hay ID o es uno genérico, intentamos resolver por Host
    if ((!tenantId || tenantId === 'default' || tenantId === 'default_tenant' || tenantId === 'template') && host) {
        identified = await identifyTenantByHost(host);
        if (identified) {
            tenantId = identified.id;
            // Refetch design con el ID real resuelto del dominio
            design = await getTenantDesign(tenantId);
            // Si el diseño de la BD viene sin features, forzamos los que identificamos del dominio
            if (design) {
                const apiFeatures = Array.isArray(design.features) ? design.features : [];
                design.features = Array.from(new Set([...apiFeatures, ...identified.features]));
            }
        }
    }

    const headerLinksFromDb = design?.headerLinks || null;
    const footerLinks = design?.footerLinks || null;
    const contactPhone = design?.contactPhone || null;
    const contactEmail = design?.contactEmail || null;
    const businessName = design?.name || null;
    const tenantTagline = design?.brandSettings?.tagline || design?.tagline || null;
    const logoUrl = design?.brandSettings?.logoUrl || design?.brandSettings?.faviconUrl || design?.logo || '/images/branding/icon.png';

    const tenantFeaturesRaw = headersList.get('x-tenant-features');
    const tenantCustomLinksRaw = headersList.get('x-tenant-custom-links');
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


    // --- LÓGICA DE NAVEGACIÓN UNIFICADA (REGLA DE NEGOCIO ESTRICTA) ---
    // Combinar features de headers y de BD (design.features) para robustez
    const allFeatures = Array.from(new Set([
        ...featureArray,
        ...(design?.features || [])
    ])).map(f => f.toUpperCase());
    const upperFeatures = new Set(allFeatures);

    // 1. Construcción del menú basado en FEATURES (SSOT)
    // El enlace de inicio siempre es el primero para landings
    const navLinks: { label: string; href: string }[] = [
        { label: 'Inicio', href: '/' }
    ];

    if (upperFeatures.has('RESTAURANT')) {
        navLinks.push(FEATURE_ROUTES.RESTAURANT);
    }
    
    if (upperFeatures.has('SHOP')) {
        navLinks.push(FEATURE_ROUTES.SHOP);
    }

    if (upperFeatures.has('BLOG')) {
        navLinks.push(FEATURE_ROUTES.BLOG);
    }

    if (upperFeatures.has('LMS')) {
        navLinks.push(FEATURE_ROUTES.LMS);
    }

    // 3. Mezclar con enlaces personalizados de la DB si existen
    const customLinks = headerLinksFromDb || [];
    const finalLinks = [...navLinks, ...customLinks];

    const hasDashboardFeature = upperFeatures.has('DASHBOARD');
    const hasLandingFeature = upperFeatures.has('LANDING');

    return (
        <NavigationWrapper
            logo={logoUrl}
            links={finalLinks}
            showAuthButtons={hasDashboardFeature}
            hideHeader={!hasLandingFeature}
            hideFooter={!hasLandingFeature}
            footer={
                <Footer
                    logo={logoUrl}
                    footerLinks={footerLinks}
                    businessName={businessName || undefined}
                    businessEmail={contactEmail || undefined}
                    businessPhone={contactPhone || undefined}
                    tagline={tenantTagline || undefined}
                    features={allFeatures}
                />
            }
        >
            {children}
        </NavigationWrapper>
    );
}
