"use client";

import { Sidebar } from "../components/dashboard/Sidebar";
import { BottomNav } from "../components/dashboard/BottomNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
