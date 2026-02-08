import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
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
const prisma = new PrismaClient();

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

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

    // Resolve Tenant ID
    const tenantId = await getTenantId();
    const { name, features, design } = await getTenantData(tenantId);
    const tenantName = name || process.env.NEXT_PUBLIC_TENANT_NAME || "Dashboard";

    return (
        <AuthProvider>
            <DashboardProvider>
                <BrandProvider settings={design as any}>
                    <SidebarProvider defaultOpen={defaultOpen}>
                        <DashboardSidebar features={features as FeatureKey[]} tenantName={tenantName} />
                        <SidebarInset>
                            {/* Unified Admin Header with SidebarTrigger */}
                            <AdminHeader appName={tenantName} />

                            {/* Main Content Area */}
                            <main className="flex flex-1 flex-col min-h-screen bg-background">
                                {children}
                            </main>
                        </SidebarInset>
                    </SidebarProvider>
                </BrandProvider>
            </DashboardProvider>
        </AuthProvider>
    );
}
