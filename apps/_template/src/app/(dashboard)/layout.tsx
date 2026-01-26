"use client";

import { DashboardLayout } from "@alvarosky/ui";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { siteConfig } from "@/config/site";
import { DashboardProvider } from "@/context/DashboardContext";
import { NAVIGATION_CONFIG } from "@/config/navigation";

function DashboardWithAuth({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();

    // Transform siteConfig features object to Array of strings
    // activeFeatures = ['blog', 'store'] if enabled
    const activeFeatures = Object.entries(siteConfig.features)
        .filter(([_, value]) => value.enabled)
        .map(([key]) => key);

    return (
        <DashboardLayout
            features={activeFeatures}
            userRole={user?.role || 'user'}
            navItems={NAVIGATION_CONFIG}
            user={{
                name: user?.name || "Usuario",
                avatar: user?.avatar || undefined,
            }}
            onLogout={logout}
            appTitle={siteConfig.name}
            logo={
                <div className="flex items-center gap-2 font-bold text-xl">
                    {siteConfig.branding.logo && (
                        <img src={siteConfig.branding.logo} alt="Logo" className="h-8 w-auto" />
                    )}
                    <span className="hidden md:inline-block">{siteConfig.name}</span>
                </div>
            }
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
