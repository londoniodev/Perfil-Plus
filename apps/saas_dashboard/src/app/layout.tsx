import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";
import {
    AdminHeader,
    SidebarInset,
    SidebarProvider,
    BrandProvider
} from "@alvarosky/ui";
import { serverFetch } from "@/lib/api-server";

// --- Server Side Data Fetching ---
async function getTenantData() {
    try {
        const data = await serverFetch<any>('/tenant/branding');
        return {
            name: data?.name || null,
            features: data?.features || [],
            design: data?.design || null
        };
    } catch (e) {
        console.warn("⚠️ Error obteniendo configuración del Tenant vía API en el Dashboard:", e);
        // Retornamos un estado degradado gracefully en vez de reventar el Server Side Rendering
        return { name: "Dashboard Local", features: [], design: null };
    }
}

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";
import { cookies } from "next/headers";
import type { FeatureKey } from "@/config/sidebar.config";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Validate Session Server-Side
    const user = await getSessionUser();
    if (!user) {
        redirect("/login?reason=session_expired");
    }

    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

    // Resolve Tenant ID data directly from API
    const { name, features: dbFeatures, design } = await getTenantData();
    const tenantName = name || process.env.NEXT_PUBLIC_TENANT_NAME || "Dashboard";

    // Normalize features from DB (uppercase) to Config (lowercase/mapped)
    const features = (dbFeatures || []).map((f: string) => {
        const lower = f.toLowerCase();
        if (lower === 'ecommerce') return 'shop';
        return lower as FeatureKey;
    }).filter((f: string): f is FeatureKey => ['shop', 'blog', 'lms', 'restaurant'].includes(f));

    return (
        <AuthProvider>
            <DashboardProvider>
                <BrandProvider settings={design as any}>
                    <DashboardShell
                        features={features}
                        tenantName={tenantName}
                        defaultOpen={defaultOpen}
                        appName={tenantName}
                    >
                        {children}
                    </DashboardShell>
                </BrandProvider>
            </DashboardProvider>
        </AuthProvider>
    );
}
