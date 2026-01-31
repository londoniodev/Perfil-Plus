"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    IconUsers,
    Avatar,
    AvatarFallback,
    AvatarImage,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@alvarosky/ui"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
    SidebarGroup,
    SidebarGroupLabel,
    useSidebar,
} from "@alvarosky/ui"
import { ChevronRight, ChevronsUpDown, LogOut, Settings, Sparkles, Bell } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import {
    getSidebarSections,
    type FeatureKey,
    type SidebarFeatureSection,
    type SidebarNavGroup
} from "@/config/sidebar.config"
import { NAVIGATION_CONFIG, NavItem } from "@/config/navigation"

// ============================================================================
// TYPES
// ============================================================================

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    features?: FeatureKey[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AppSidebar({ features = [], ...props }: AppSidebarProps) {
    const pathname = usePathname()
    const { logout, isAdmin, user } = useAuth()
    const { isMobile } = useSidebar()

    // Helper to check if a path is active
    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/")

    // Get user initials for avatar fallback
    const userInitials = user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || "U"

    // ========================================================================
    // ADMIN SIDEBAR: Uses sidebar.config.ts (feature-based sections)
    // ========================================================================
    const renderAdminSidebar = () => {
        const sections = getSidebarSections(features)

        return sections.map((section: SidebarFeatureSection, sectionIndex: number) => (
            <SidebarGroup key={section.label}>
                <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
                    {section.label}
                </SidebarGroupLabel>
                <SidebarMenu>
                    {section.groups.map((group: SidebarNavGroup) => {
                        const Icon = group.icon
                        const hasSubItems = group.items && group.items.length > 0
                        const isGroupActive = group.href
                            ? isActive(group.href)
                            : group.items?.some(item => isActive(item.href))

                        // Collapsible group with sub-items
                        if (hasSubItems) {
                            return (
                                <Collapsible
                                    key={group.title}
                                    asChild
                                    defaultOpen={isGroupActive}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={group.title}
                                                isActive={isGroupActive}
                                                className="transition-all duration-200 ease-in-out hover:translate-x-0.5"
                                            >
                                                {Icon && <Icon className="size-4" />}
                                                <span>{group.title}</span>
                                                <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {group.items!.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.href}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={pathname === subItem.href}
                                                            className="transition-colors duration-150"
                                                        >
                                                            <Link href={subItem.href}>
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            )
                        }

                        // Simple link (no sub-items)
                        return (
                            <SidebarMenuItem key={group.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive(group.href!)}
                                    tooltip={group.title}
                                    className="transition-all duration-200 ease-in-out hover:translate-x-0.5"
                                >
                                    <Link href={group.href!}>
                                        {Icon && <Icon className="size-4" />}
                                        <span>{group.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroup>
        ))
    }

    // ========================================================================
    // USER SIDEBAR: Uses navigation.ts (legacy, simpler)
    // ========================================================================
    const renderUserSidebar = () => {
        const menuItems = NAVIGATION_CONFIG.user.filter((item: NavItem) => {
            if (item.feature && !features.includes(item.feature as FeatureKey)) return false
            return true
        })

        return (
            <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
                    Mi Panel
                </SidebarGroupLabel>
                <SidebarMenu>
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)

                        return (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={active}
                                    tooltip={item.name}
                                    className="transition-all duration-200 ease-in-out hover:translate-x-0.5"
                                >
                                    <Link href={item.href}>
                                        <Icon className="size-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroup>
        )
    }

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <Sidebar collapsible="icon" {...props}>
            {/* HEADER: Branding */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-200"
                                >
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <img
                                            src="/images/branding/menu_logo.png"
                                            alt="Logo"
                                            className="size-5 object-contain brightness-0 invert"
                                        />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {process.env.NEXT_PUBLIC_TENANT_NAME || "Template"}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {isAdmin ? "Consola Admin" : "Plataforma"}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                    Panel de Control
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href="/admin/settings" className="gap-2 cursor-pointer">
                                        <Settings className="size-4" />
                                        <span>Configuración</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 text-muted-foreground">
                                    <Sparkles className="size-4" />
                                    <span className="text-xs">Plan: {isAdmin ? "Enterprise" : "Free"}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* CONTENT: Navigation */}
            <SidebarContent>
                {isAdmin ? renderAdminSidebar() : renderUserSidebar()}
            </SidebarContent>

            {/* FOOTER: User Menu */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-200"
                                >
                                    <Avatar className="size-8 rounded-lg">
                                        <AvatarImage src={user?.avatar || ""} alt={user?.name} />
                                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user?.name}</span>
                                        <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="size-8 rounded-lg">
                                            <AvatarImage src={user?.avatar || ""} alt={user?.name} />
                                            <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user?.name}</span>
                                            <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/perfil" className="gap-2 cursor-pointer">
                                        <IconUsers className="size-4" />
                                        <span>Mi Perfil</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/admin/settings" className="gap-2 cursor-pointer">
                                        <Settings className="size-4" />
                                        <span>Configuración</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                    <Bell className="size-4" />
                                    <span>Notificaciones</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => logout()}
                                    className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                                >
                                    <LogOut className="size-4" />
                                    <span>Cerrar Sesión</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
