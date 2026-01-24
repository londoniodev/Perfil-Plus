import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Platform Admin",
    description: "Control Tower - Gestión de Tenants",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" className="dark">
            <body className={inter.className}>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        {/* Global Header with Sidebar Trigger */}
                        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl px-4 sticky top-0 z-10 w-full">
                            <SidebarTrigger className="-ml-1" />
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
            </body>
        </html>
    );
}
