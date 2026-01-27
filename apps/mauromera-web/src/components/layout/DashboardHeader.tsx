"use client";

import { SidebarTrigger, Separator } from "@alvarosky/ui";
import { useAuth } from "@/context/AuthContext";

export function DashboardHeader() {
    const { user } = useAuth();

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px] sticky top-0 z-10 w-full">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <div className="w-full flex-1">
                {/* Search or Breadcrumbs could go here */}
            </div>
            <div className="flex items-center gap-4">
                {user && (
                    <div className="flex items-center gap-2">
                        {user.avatar && (
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-border" />
                        )}
                        <span className="text-sm font-medium hidden md:inline-block">{user.name}</span>
                    </div>
                )}
            </div>
        </header>
    );
}

