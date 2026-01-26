"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    IconHome,
    IconBook,
    IconEdit,
    IconDocument,
    IconUsers,
    IconLogout,
    IconCreditCard,
    IconGrid,
    IconMenu,
    IconMessageCircle
} from "../icons";
import { Button } from "../button";
import { cn } from "../lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "../sheet";

// Define the shape of a navigation item
// We reuse the shape from the config, but we define it here as a generic interface for the UI component
export interface DashboardNavItem {
    title: string;
    href: string;
    icon: any;
    allowedRoles: string[];
    requiredFeature?: string; // 'all' or specific feature key
}

interface DashboardSharedProps {
    features: string[]; // Changed to array of strings
    userRole: string; // Changed to string role
    navItems: DashboardNavItem[]; // Injected items
    user?: {
        name: string;
        avatar?: string;
    };
    onLogout?: () => void;
    logo?: React.ReactNode;
    appTitle?: string;
}

interface DashboardLayoutProps extends DashboardSharedProps {
    children: React.ReactNode;
}

export function DashboardLayout({
    children,
    features = [],
    userRole = 'user',
    navItems = [],
    user,
    onLogout,
    logo,
    appTitle
}: DashboardLayoutProps) {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block h-full sticky top-0 max-h-screen">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <Sidebar
                        features={features}
                        userRole={userRole}
                        navItems={navItems}
                        user={user}
                        onLogout={onLogout}
                        logo={logo}
                        appTitle={appTitle}
                    />
                </div>
            </div>
            <div className="flex flex-col">
                <Header
                    features={features}
                    userRole={userRole}
                    navItems={navItems}
                    user={user}
                    onLogout={onLogout}
                    logo={logo}
                    appTitle={appTitle}
                />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/10">
                    {children}
                </main>
            </div>
        </div>
    );
}

function Sidebar({ features, userRole, navItems, onLogout, logo, appTitle }: DashboardSharedProps) {
    const pathname = usePathname();
    const isAdmin = userRole === 'admin';

    // Filter items based on Role AND Features
    const filteredItems = navItems.filter(item => {
        // 1. Role Check
        const hasRole = item.allowedRoles.includes(userRole);
        if (!hasRole) return false;

        // 2. Feature Check
        if (!item.requiredFeature || item.requiredFeature === 'all') return true;
        return features.includes(item.requiredFeature);
    });

    return (
        <div className="pb-12 h-full">
            <div className="space-y-4 py-4 h-full flex flex-col">
                <div className="px-3 py-2">
                    <div className="mb-2 px-4 flex items-center gap-2">
                        {logo || (
                            <span className="font-bold text-lg">{appTitle || "Dashboard"}</span>
                        )}
                    </div>
                    {isAdmin && (
                        <div className="px-4 mb-4">
                            <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                                Administrador
                            </span>
                        </div>
                    )}
                    <div className="space-y-1">
                        {filteredItems.map((item) => {
                            const Icon = item.icon;
                            // Match exact or sub-paths
                            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                            return (
                                <Button
                                    key={item.href}
                                    variant={isActive ? "secondary" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "w-full justify-start",
                                        isActive && "bg-secondary font-medium"
                                    )}
                                    asChild
                                >
                                    <Link href={item.href}>
                                        <Icon className="mr-2 h-4 w-4" />
                                        {item.title}
                                    </Link>
                                </Button>
                            );
                        })}
                    </div>
                </div>
                <div className="mt-auto px-3 py-2">
                    {onLogout && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={onLogout}
                        >
                            <IconLogout className="mr-2 h-4 w-4" />
                            Cerrar Sesión
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function Header({ features, userRole, navItems, user, onLogout, logo, appTitle }: DashboardSharedProps) {
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
                    <Sidebar
                        features={features}
                        userRole={userRole}
                        navItems={navItems}
                        onLogout={onLogout}
                        logo={logo}
                        appTitle={appTitle}
                    />
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
