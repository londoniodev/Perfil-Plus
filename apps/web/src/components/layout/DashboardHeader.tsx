"use client";

import { Sheet, SheetContent, SheetTrigger } from "@mauromera/ui";
import { Button } from "@mauromera/ui";
import { IconMenu } from "@mauromera/ui";
import { DashboardSidebar } from "./DashboardSidebar";
import { useAuth } from "@/context/AuthContext";

export function DashboardHeader() {
    const { user } = useAuth();

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px] sticky top-0 z-10 w-full">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
                        <IconMenu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0 w-[240px]">
                    <DashboardSidebar className="mt-4" />
                </SheetContent>
            </Sheet>
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
