
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { SidebarInset, SidebarProvider, BrandProvider } from "@alvarosky/ui";
import { PrismaClient } from "@alvarosky/database-management"; // Direct DB Access
import { getTenantId } from "@/lib/config-server";
import { cookies } from "next/headers";

// --- Server Side Data Fetching ---
const prisma = new PrismaClient();

async function getTenantData(tenantId: string) {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantId },
            select: {
                features: true,
                design: true
            }
        });
        return tenant || { features: [], design: null };
    } catch (e) {
        console.error("Error fetching tenant config:", e);
        return { features: [], design: null };
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
    const { features, design } = await getTenantData(tenantId);

    return (
        <AuthProvider>
            <DashboardProvider>
                <BrandProvider settings={design as any}>
                    <SidebarProvider defaultOpen={defaultOpen}>
                        <AppSidebar features={features as import("@/config/sidebar.config").FeatureKey[]} />
                        <SidebarInset>
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
