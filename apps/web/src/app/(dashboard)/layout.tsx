"use client";

import "@/app/styles/dashboard.css";
import { Sidebar } from "../components/dashboard/Sidebar";
import { BottomNav } from "../components/dashboard/BottomNav";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";
import { AuthProvider } from "@/context/AuthContext";

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useDashboard();

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
            {/* Desktop Sidebar */}
            <div className="desktop-sidebar-wrapper">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <main
                className="dashboard-main"
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: isCollapsed ? "80px" : "280px",
                    transition: "margin-left 0.3s ease",
                    width: "100%"
                }}
            >
                <div className="dashboard-content-wrapper">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <BottomNav />

            <style jsx global>{`
                @media (max-width: 1024px) {
                    .desktop-sidebar-wrapper {
                        display: none;
                    }
                    .dashboard-main {
                        margin-left: 0 !important;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <DashboardProvider>
                <DashboardContent>
                    {children}
                </DashboardContent>
            </DashboardProvider>
        </AuthProvider>
    );
}
