
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { SidebarInset, SidebarProvider, BrandProvider } from "@alvarosky/ui";
import { PrismaClient } from "@alvarosky/database-management"; // Direct DB Access
import { TENANT_ID } from "@/lib/config";
import { cookies } from "next/headers";

// --- Server Side Data Fetching ---
const prisma = new PrismaClient();

async function getTenantData() {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug: TENANT_ID },
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
    const { features, design } = await getTenantData();

    return (
        <AuthProvider>
            <DashboardProvider>
                <BrandProvider settings={design as any}>
                    <SidebarProvider defaultOpen={defaultOpen}>
                        <AppSidebar features={features} />
                        <SidebarInset>
                            <DashboardHeader />
                            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/10">
                                {children}
                            </main>
                        </SidebarInset>
                    </SidebarProvider>
                </BrandProvider>
            </DashboardProvider>
        </AuthProvider>
    );
}
