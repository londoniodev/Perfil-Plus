"use client";

import { Sidebar } from "../components/dashboard/Sidebar";
import { BottomNav } from "../components/dashboard/BottomNav";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useDashboard();

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main
                className="dashboard-main"
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: isCollapsed ? "80px" : "280px",
                    transition: "margin-left 0.3s ease",
                }}
            >
                <div style={{ padding: "2rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <BottomNav />
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardProvider>
            <DashboardContent>
                {children}
            </DashboardContent>
        </DashboardProvider>
    );
}
