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
    ]));
    const upperFeatures = new Set(allFeatures.map(f => f.toUpperCase()));

    // 1. Base: enlaces automáticos según Features activos
    let navLinks: { label: string; href: string }[] = [];

    // Mapeo Automático de Features Base
    if (upperFeatures.has('LANDING')) navLinks.push(FEATURE_ROUTES.LANDING);
    if (upperFeatures.has('SHOP'))    navLinks.push(FEATURE_ROUTES.SHOP);
    if (upperFeatures.has('BLOG'))    navLinks.push(FEATURE_ROUTES.BLOG);
    if (upperFeatures.has('LMS'))     navLinks.push(FEATURE_ROUTES.LMS);
    if (upperFeatures.has('RESTAURANT')) navLinks.push(FEATURE_ROUTES.RESTAURANT);

    // 2. Integrar enlaces personalizados desde la DB (Branding API)
    if (headerLinksFromDb?.length) {
        headerLinksFromDb.forEach((link: any) => {
            const alreadyExists = navLinks.some(nl => nl.href === link.href);
            if (!alreadyExists) navLinks.push(link);
        });
    }

    // 3. Integrar custom links inyectados desde el middleware (x-tenant-custom-links)
    let middlewareCustomLinks: { label: string; href: string }[] = [];
    if (tenantCustomLinksRaw) {
        try {
            middlewareCustomLinks = JSON.parse(tenantCustomLinksRaw);
        } catch {
            middlewareCustomLinks = [];
        }
    }
    for (const cl of middlewareCustomLinks) {
        const alreadyExists = navLinks.some(link => link.href === cl.href);
        if (!alreadyExists) navLinks.push(cl);
    }

    // 4. Seguridad final: Filtrar enlaces de features NO activas (en caso de que vengan en customLinks)
    navLinks = navLinks.filter(link => {
        const routeDefinition = Object.entries(FEATURE_ROUTES).find(
            ([, route]) => route.href === link.href
        );
        if (!routeDefinition) return true; // Enlaces libres
        return upperFeatures.has(routeDefinition[0].toUpperCase());
    });

    const hasDashboardFeature = upperFeatures.has('DASHBOARD');

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
                    features={allFeatures}
                />
            }
        >
            {children}
        </NavigationWrapper>
    );
}
