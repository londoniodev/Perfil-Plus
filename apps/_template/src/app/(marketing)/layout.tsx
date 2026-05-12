import { NavigationWrapper } from "@/components/layout/NavigationWrapper";
import { Footer } from "@/components/layout/Footer";
import { getTenantId } from "@/lib/config-server";
import { getTenantDesign, identifyTenantByHost } from "@/lib/tenant-server";
import { FEATURE_ROUTES } from "@alvarosky/types";
import { headers } from "next/headers";
import React from "react";

// ── Encoding Helpers ──
/**
 * Corrige errores comunes de codificación (UTF-8 interpretado como Latin-1)
 * que provocan que caracteres como 'é' se vean como 'Ã©'.
 */
function fixEncoding(str: string): string {
    if (!str) return str;
    try {
        // Truco estándar para decodificar UTF-8 mal interpretado
        return decodeURIComponent(escape(str));
    } catch (e) {
        // Si falla (ej: ya estaba bien o tiene caracteres inválidos), devolvemos original
        return str;
    }
}

/**
 * Acorta nombres largos para optimizar el espacio en el header.
 */
function shortenLabel(label: string): string {
    if (!label) return label;
    const lower = label.toLowerCase().trim();
    const map: Record<string, string> = {
        'quiénes somos': 'Nosotros',
        'quienes somos': 'Nosotros',
        'áreas de práctica': 'Servicios',
        'areas de practica': 'Servicios',
        'nuestros servicios': 'Servicios',
        'modalidades del servicio': 'Modalidades',
        'nuestros clientes': 'Clientes',
        'contáctenos': 'Contacto',
        'contactenos': 'Contacto',
    };
    return map[lower] || label;
}

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
    const contactPhone = fixEncoding(design?.contactPhone || null);
    const contactEmail = fixEncoding(design?.contactEmail || null);
    const businessName = fixEncoding(design?.name || null);
    const tenantTagline = fixEncoding(design?.brandSettings?.tagline || design?.tagline || null);
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

    const hasDashboardFeature = upperFeatures.has('DASHBOARD');
    const hasLandingFeature = upperFeatures.has('LANDING');

    // 3. Mezclar con enlaces personalizados de la DB solo si tiene LANDING activo
    // Esto evita que aparezcan enlaces a páginas de S3 si el sitio web está desactivado.
    const customLinks = hasLandingFeature ? (headerLinksFromDb || []) : [];
    
    // Evitar duplicar 'Inicio' si los customLinks ya traen un Inicio o un /home
    const filteredNavLinks = navLinks.filter(navLink => 
        !customLinks.some((customLink: any) => 
            customLink.href === navLink.href || 
            customLink.label.toLowerCase() === navLink.label.toLowerCase() ||
            (navLink.label.toLowerCase() === 'inicio' && customLink.href === '/home')
        )
    );

    // Eliminamos duplicados de forma agresiva por etiqueta (case-insensitive) y por href
    const allLinks = [...filteredNavLinks, ...customLinks];
    const finalLinks = allLinks.filter((link: any, index: number, self: any[]) => {
        const isDuplicateLabel = index !== self.findIndex((t: any) => 
            t.label.toLowerCase().trim() === link.label.toLowerCase().trim()
        );
        const isDuplicateHref = index !== self.findIndex((t: any) => {
            const h1 = t.href === '/' || t.href === '' ? '/home' : t.href;
            const h2 = link.href === '/' || link.href === '' ? '/home' : link.href;
            return h1 === h2;
        });
        return !isDuplicateLabel && !isDuplicateHref;
    }).map(link => {
        const cleanLabel = fixEncoding(link.label);
        return {
            ...link,
            label: shortenLabel(cleanLabel)
        };
    });

    const isHomePage = headersList.get('x-is-home') === 'true';

    return (
        <NavigationWrapper
            logo={logoUrl}
            links={finalLinks}
            showAuthButtons={hasDashboardFeature}
            hideHeader={!hasLandingFeature && isHomePage}
            hideFooter={!hasLandingFeature && isHomePage}
            footer={
                <Footer
                    logo={logoUrl}
                    footerLinks={footerLinks?.map((l: any) => ({ ...l, label: fixEncoding(l.label) }))}
                    businessName={businessName || undefined}
                    businessEmail={contactEmail || undefined}
                    businessPhone={contactPhone || undefined}
                    tagline={tenantTagline || undefined}
                    features={allFeatures}
                />
            }
        >
            {/* DEBUG_LINKS: {JSON.stringify(headerLinksFromDb)} */}
            {children}
        </NavigationWrapper>
    );
}
