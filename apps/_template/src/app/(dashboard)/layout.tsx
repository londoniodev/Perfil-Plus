"use client";

import { DashboardLayout } from "@alvarosky/ui";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { siteConfig } from "@/config/site";
import { DashboardProvider } from "@/context/DashboardContext";

function DashboardWithAuth({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();

    return (
        <DashboardLayout
            features={siteConfig.features}
            user={{
                name: user?.name || "Usuario",
                avatar: user?.avatar,
                isAdmin: user?.role === "admin"
            }}
            onLogout={logout}
            appTitle={siteConfig.name}
        >
            {children}
        </DashboardLayout>
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <DashboardProvider>
                <DashboardWithAuth>{children}</DashboardWithAuth>
            </DashboardProvider>
        </AuthProvider>
    );
}
