import "@/styles/index.css";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";
import {
    AdminHeader,
    SidebarInset,
    SidebarProvider,
    BrandProvider,
    ToastProvider,
    getFontVariables,
    generateBrandingCSS
} from "@alvarosky/ui";
import { serverFetch } from "@/lib/api-server";

// --- Server Side Data Fetching ---
async function getTenantData() {
    try {
        const data = await serverFetch<any>('/tenant/branding', {
            cache: 'force-cache',
            next: {
                tags: ['tenant-branding-slug', 'tenant-resolve-slug']
            }
        });
        return {
            name: data?.name || null,
            features: data?.features || [],
            design: data?.design || null,
            logo: data?.logo || null,
            brandSettings: data?.brandSettings || null
        };
    } catch (e) {
        console.warn("⚠️ Error obteniendo configuración del Tenant vía API en el Dashboard:", e);
        // Retornamos un estado degradado gracefully en vez de reventar el Server Side Rendering
        return { name: "Dashboard Local", features: [], design: null, logo: null };
    }
}

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";
import { cookies } from "next/headers";
import type { FeatureKey } from "@/config/sidebar.config";

import { ThemeProvider } from "./providers";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const { name, logo, brandSettings } = await getTenantData();
    const tenantName = name || "Panel de Administración";
    // Favicon must be square
    const logoUrl = brandSettings?.faviconUrl || brandSettings?.logoUrl || logo || "/favicon.ico";

    return {
        title: `${tenantName} | Panel de Administración`,
        description: "Plataforma de gestión SaaS, restaurante, tienda y academia.",
        icons: {
            icon: logoUrl,
            apple: logoUrl,
        }
    };
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Validate Session Server-Side
    const user = await getSessionUser();
    if (!user) {
        // En Next.js, un redirect relativo es capturado por el basePath (/dashboard).
        // Para redirigir al portal público de autenticación, usamos una URL absoluta
        // construida dinámicamente a partir del proxy.
        const h = await import("next/headers");
        const hdrs = await h.headers();
        const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
        const proto = hdrs.get("x-forwarded-proto") || "https";
        redirect(`${proto}://${host}/login?reason=session_expired`);
    }

    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

    // Resolve Tenant ID data directly from API
    const { name, features: dbFeatures, design, logo, brandSettings } = await getTenantData();
    const tenantName = name || process.env.NEXT_PUBLIC_TENANT_NAME || "Dashboard";

    // Normalize features from DB (uppercase) to Config (lowercase/mapped)
    const features = Array.from(new Set((dbFeatures || []).flatMap((f: string) => {
        const upper = f.toUpperCase();
        const mapped: FeatureKey[] = [];
        
        // Direct matches
        if (upper === 'SHOP' || upper === 'ECOMMERCE') mapped.push('shop');
        if (upper === 'BLOG') mapped.push('blog');
        if (upper === 'LMS') mapped.push('lms');
        if (upper === 'RESTAURANT') mapped.push('restaurant');
        
        // Capability mappings (backward compatibility / zero-trust fallback)
        if (upper === 'HAS_DIGITAL_MENU' || upper === 'HAS_POS') mapped.push('restaurant');
        if (upper === 'HAS_WEB_CHECKOUT' || upper === 'HAS_WHATSAPP_CHECKOUT') mapped.push('shop');
        
        return mapped;
    })));

    // --- Branding & Theme Logic (SSR Anti-FOUC) ---
    const brandingSettings = {
        primary: brandSettings?.primaryColor || design?.colors?.primary || "zinc",
        radius: brandSettings?.borderRadius ?? design?.radius ?? 0.5,
        mode: brandSettings?.theme || brandSettings?.layoutType as any, // Admin preference
        ...design,
    };

    // 1. Theme Priority: Admin > Cookie > Default ('dark')
    const cookieTheme = cookieStore.get("theme")?.value;
    const initialTheme = brandingSettings.mode || cookieTheme || "dark";

    // 2. Generate CSS Variables SSR
    const serverSideStyles = generateBrandingCSS(brandingSettings);

    return (
        <html lang="es" className={initialTheme} suppressHydrationWarning>
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
                <style 
                    id="server-side-branding" 
                    dangerouslySetInnerHTML={{ __html: serverSideStyles }} 
                />
            </head>
            <body className={`${getFontVariables()} font-sans antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={false}
                    forcedTheme={brandingSettings.mode} // Prevent client overwrite if admin forced it
                >
                    <AuthProvider>
                        <DashboardProvider>
                            <BrandProvider settings={{
                                ...brandingSettings,
                                primary: "custom" // Signal that CSS is already injected
                            } as any}>
                                <ToastProvider>
                                    <DashboardShell
                                        features={features}
                                        tenantName={tenantName}
                                        defaultOpen={defaultOpen}
                                        appName={tenantName}
                                        logoUrl={brandSettings?.faviconUrl || brandSettings?.logoUrl || logo}
                                    >
                                        {children}
                                    </DashboardShell>
                                </ToastProvider>
                            </BrandProvider>
                        </DashboardProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

