import { NavigationWrapper } from "@/components/layout/NavigationWrapper";
import { Footer } from "@/components/layout/Footer";
import { getTenantId } from "@/lib/config-server";
import { getTenantDesign } from "@/lib/tenant-server";
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
    const tenantTagline = design?.tagline || null;
    const logoUrl = design?.logo || '/images/branding/icon.png';

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

    // --- LÓGICA DE NAVEGACIÓN ---
    let navLinks = headerLinksFromDb ? [...headerLinksFromDb] : [];

    if (navLinks.length === 0) {
        navLinks = [{ label: "Inicio", href: "/" }];
        const upperFeatures = featureArray.map(f => f.toUpperCase());
        if (upperFeatures.includes("ECOMMERCE") || upperFeatures.includes("ECOMERCE")) navLinks.push({ label: "Tienda", href: "/tienda" });
        if (upperFeatures.includes("LMS")) navLinks.push({ label: "Cursos", href: "/formacion" });
        if (upperFeatures.includes("BLOG")) navLinks.push({ label: "Blog", href: "/blog" });
        if (upperFeatures.includes("RESTAURANT")) navLinks.push({ label: "Menú", href: "/menu" });
    } else {
        const upperFeatures = featureArray.map(f => f.toUpperCase());
        const hasTiendaLink = navLinks.some(link => link.href === "/tienda");
        if ((upperFeatures.includes("ECOMMERCE") || upperFeatures.includes("ECOMERCE")) && !hasTiendaLink) {
            navLinks.push({ label: "Tienda", href: "/tienda" });
        }
    }

    // --- LÓGICA DE BRANDING ---
    let logoSuffix: React.ReactNode = null;
    if (tenantSlugRaw === "soydeborasoysaludable" || tenantId === "cm7mman6x000208jsf3h9h2k1") {
        logoSuffix = (
            <span className="text-lg md:text-xl font-black tracking-tighter uppercase italic leading-none hidden sm:block">
                Soy <span className="text-fuchsia-500">Deborah</span> Soy Saludable
            </span>
        );
    }

    const hasDashboardFeature = featureArray.includes('dashboard') || featureArray.length > 0;
    const isCocinaSiete = tenantSlugRaw === "cocinasiete" || tenantId === "cocinasiete";

    return (
        <NavigationWrapper
            logo={logoUrl}
            logoSuffix={logoSuffix}
            links={navLinks}
            showAuthButtons={hasDashboardFeature}
            isCocinaSiete={isCocinaSiete}
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
