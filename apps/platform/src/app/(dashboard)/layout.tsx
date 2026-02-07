import { SidebarProvider, SidebarInset, AdminHeader } from "@alvarosky/ui";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { prismaManagement } from "@alvarosky/database-management";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Fetch tenants for Platform sidebar
    let tenants: { name: string; slug: string }[] = [];
    try {
        tenants = await prismaManagement.tenant.findMany({
            select: { name: true, slug: true },
            orderBy: { name: 'asc' }
        }).then(items => items.map(t => ({ ...t, name: t.name ?? t.slug })));
    } catch (error) {
        console.warn("Could not fetch tenants during render/build:", error);
        tenants = [];
    }

    return (
        <SidebarProvider>
            <DashboardSidebar tenants={tenants} />
            <SidebarInset>
                {/* Unified Admin Header */}
                <AdminHeader appName="Platform" />

                {/* Main Content */}
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
