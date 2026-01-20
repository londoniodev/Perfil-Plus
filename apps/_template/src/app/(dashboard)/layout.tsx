"use client";

import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext"; // Keeping for compatibility if needed, though sidebar logic changed

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <DashboardProvider>
                <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                    <div className="hidden border-r bg-muted/40 md:block h-full sticky top-0 max-h-screen">
                        <div className="flex h-full max-h-screen flex-col gap-2">
                            <DashboardSidebar />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <DashboardHeader />
                        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/10">
                            {children}
                        </main>
                    </div>
                </div>
            </DashboardProvider>
        </AuthProvider>
    );
}

