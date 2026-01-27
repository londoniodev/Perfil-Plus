"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    IconUsers,
    IconLogout
} from "@alvarosky/ui"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@alvarosky/ui"
import { useAuth } from "@/context/AuthContext"
import { NAVIGATION_CONFIG, NavItem } from "@/config/navigation"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    features?: string[]; // Injected from Server Component
}

export function AppSidebar({ features = [], ...props }: AppSidebarProps) {
    const pathname = usePathname()
    const { logout, isAdmin, user } = useAuth()

    // Filter menu items based on Role and Features
    const rawItems = isAdmin ? NAVIGATION_CONFIG.admin : NAVIGATION_CONFIG.user

    const menuItems = rawItems.filter((item: NavItem) => {
        // 1. Check Feature Flag
        if (item.feature && !features.includes(item.feature)) {
            return false;
        }
        // 2. Check Role (Redundant if we already split lists, but good for safety)
        if (item.role && item.role === 'ADMIN' && !isAdmin) return false;
        if (item.role && item.role === 'USER' && isAdmin) return false;

        return true;
    })

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <img src="/images/branding/menu_logo.png" alt="Logo" className="size-6 object-contain brightness-0 invert" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold uppercase">{process.env.NEXT_PUBLIC_TENANT_NAME || "Template"}</span>
                        <span className="truncate text-xs">{isAdmin ? "Admin Console" : "Plataforma Educativa"}</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
                <SidebarMenu>
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname?.startsWith(item.href)
                        return (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                                    <Link href={item.href}>
                                        <Icon />
                                        <span>{item.name}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted text-sidebar-foreground">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="size-8 rounded-lg object-cover" />
                                ) : (
                                    <IconUsers className="size-4" />
                                )}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user?.name}</span>
                                <span className="truncate text-xs">{user?.email}</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => logout()} tooltip="Cerrar Sesión">
                            <IconLogout />
                            <span>Cerrar Sesión</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
