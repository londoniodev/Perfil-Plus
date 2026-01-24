import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { prismaManagement } from "@alvarosky/database-management";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Basic caching/optimization could be added here if needed, but for now direct fetch
    const tenants = await prismaManagement.tenant.findMany({
        select: { name: true, slug: true },
        orderBy: { name: 'asc' }
    }).then(items => items.map(t => ({ ...t, name: t.name ?? t.slug })));

    return (
        <SidebarProvider>
            <AppSidebar tenants={tenants} />
            <SidebarInset>
                {/* Global Header with Sidebar Trigger */}
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-sidebar-border/50 bg-background/50 backdrop-blur-xl px-4 sticky top-0 z-10 w-full">
                    <SidebarTrigger className="ml-1" /> {/* Increased margin */}
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-muted-foreground">Platform</span>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
