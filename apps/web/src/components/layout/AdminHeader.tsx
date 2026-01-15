"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/Button";
import { IconMenu } from "@/components/ui/Icons";
import { AdminSidebar } from "./AdminSidebar";

export function AdminHeader() {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
                        <IconMenu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0 w-[240px]">
                    <AdminSidebar className="mt-4" />
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
                {/* Search or Breadcrumbs could go here */}
                <span className="font-semibold text-lg">Administración</span>
            </div>
            <div className="flex items-center gap-4">
                {/* User Nav or Actions */}
            </div>
        </header>
    );
}
