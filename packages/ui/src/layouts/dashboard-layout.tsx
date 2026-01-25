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
    IconMenu
} from "../icons";
import { Button } from "../button";
import { cn } from "../lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "../sheet";

// Definition of navigation items
const USER_MENU_ITEMS = [
    { name: "Mi Panel", href: "/perfil", icon: IconHome, feature: "all" },
    { name: "Mis Cursos", href: "/cursos", icon: IconBook, feature: "lms" },
    { name: "Suscripción", href: "/suscripcion", icon: IconCreditCard, feature: "all" },
];

const ADMIN_MENU_ITEMS = [
    { name: "Dashboard", href: "/perfil", icon: IconHome, feature: "all" },
    { name: "Gestionar Cursos", href: "/admin/cursos", icon: IconEdit, feature: "lms" },
    { name: "Gestionar Blog", href: "/admin/blog", icon: IconDocument, feature: "blog" },
    { name: "Gestión de Productos", href: "/admin/productos", icon: IconGrid, feature: "store" },
    { name: "Usuarios", href: "/admin/usuarios", icon: IconUsers, feature: "all" },
];

interface DashboardSharedProps {
    features?: {
        blog?: boolean;
        store?: boolean;
        lms?: boolean;
        ebooks?: boolean;
        portfolio?: boolean;
    };
    user?: {
        name: string;
        avatar?: string;
        isAdmin?: boolean;
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
    features = { blog: true, store: true, lms: true, ebooks: true },
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

function Sidebar({ features, user, onLogout, logo, appTitle }: DashboardSharedProps) {
    const pathname = usePathname();
    const isAdmin = user?.isAdmin;

    const items = isAdmin ? ADMIN_MENU_ITEMS : USER_MENU_ITEMS;

    // Filter items based on enabled features
    const filteredItems = items.filter(item => {
        if (item.feature === 'all') return true;
        // @ts-ignore
        return features?.[item.feature as keyof typeof features] !== false;
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
                                        {item.name}
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

function Header({ features, user, onLogout, logo, appTitle }: DashboardSharedProps) {
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
                        user={user}
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
