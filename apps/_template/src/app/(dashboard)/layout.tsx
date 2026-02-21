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
import { PrismaClient } from "@alvarosky/database-management";
import { getTenantId } from "@/lib/config-server";
import { cookies } from "next/headers";
import type { FeatureKey } from "@/config/sidebar.config";

// --- Server Side Data Fetching ---
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.MANAGEMENT_DATABASE_URL,
        },
    },
});

async function getTenantData(tenantId: string) {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantId },
            select: {
                name: true,
                features: true,
                design: true
            }
        });
        return tenant || { name: null, features: [], design: null };
    } catch (e) {
        console.error("Error fetching tenant config:", e);
        return { name: null, features: [], design: null };
    }
}

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";

// ... existing imports

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

    // Resolve Tenant ID
    const tenantId = await getTenantId();
    const { name, features: dbFeatures, design } = await getTenantData(tenantId);
    const tenantName = name || process.env.NEXT_PUBLIC_TENANT_NAME || "Dashboard";

    // Normalize features from DB (uppercase) to Config (lowercase/mapped)
    const features = (dbFeatures || []).map((f) => {
        const lower = f.toLowerCase();
        if (lower === 'ecommerce') return 'shop';
        return lower as FeatureKey;
    }).filter((f): f is FeatureKey => ['shop', 'blog', 'lms', 'restaurant'].includes(f));

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
