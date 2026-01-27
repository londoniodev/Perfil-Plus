"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { SidebarInset, SidebarProvider } from "@alvarosky/ui";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <DashboardProvider>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        <DashboardHeader />
                        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/10">
                            {children}
                        </main>
                    </SidebarInset>
                </SidebarProvider>
            </DashboardProvider>
        </AuthProvider>
    );
}

