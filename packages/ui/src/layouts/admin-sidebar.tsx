"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronsUpDown, LogOut, User } from "lucide-react";
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
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../index";

// ============================================================================
// TYPES
// ============================================================================

export interface AdminSidebarNavItem {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
}

export interface AdminSidebarNavGroup {
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    items?: AdminSidebarNavItem[]; // Collapsible sub-items
    href?: string;           // Direct link (no sub-items)
}

export interface AdminSidebarSection {
    label: string;
    groups: AdminSidebarNavGroup[];
}

export interface AdminSidebarBrand {
    logo?: React.ReactNode;
    name: string;
    subtitle?: string;
}

export interface AdminSidebarUser {
    name: string;
    email?: string;
    avatar?: string;
}

export interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
    /** Navigation sections */
    sections: AdminSidebarSection[];
    /** Brand information for header */
    brand: AdminSidebarBrand;
    /** User information for footer */
    user?: AdminSidebarUser;
    /** Logout callback */
    onLogout?: () => void;
    /** Additional footer menu items */
    footerMenuItems?: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AdminSidebar({
    sections,
    brand,
    user,
    onLogout,
    footerMenuItems,
    ...props
}: AdminSidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) =>
        pathname === href || pathname?.startsWith(href + "/");

    const userInitials = user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || "U";

    return (
        <Sidebar collapsible="icon" {...props}>
            {/* Header: Brand */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                {brand.logo || (
                                    <span className="font-bold text-sm">
                                        {brand.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{brand.name}</span>
                                {brand.subtitle && (
                                    <span className="truncate text-xs text-muted-foreground">
                                        {brand.subtitle}
                                    </span>
                                )}
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Content: Navigation */}
            <SidebarContent>
                {sections.map((section) => (
                    <SidebarGroup key={section.label}>
                        <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
                            {section.label}
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {section.groups.map((group) => {
                                const Icon = group.icon;
                                const hasSubItems = group.items && group.items.length > 0;
                                const isGroupActive = group.href
                                    ? isActive(group.href)
                                    : group.items?.some((item) => isActive(item.href));

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
                                    );
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
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            {/* Footer: User Menu */}
            {user && (
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
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                                                {userInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user.name}</span>
                                            {user.email && (
                                                <span className="truncate text-xs text-muted-foreground">
                                                    {user.email}
                                                </span>
                                            )}
                                        </div>
                                        <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                    side="top"
                                    align="start"
                                    sideOffset={4}
                                >
                                    <DropdownMenuLabel className="p-0 font-normal">
                                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                            <Avatar className="size-8 rounded-lg">
                                                <AvatarImage src={user.avatar} alt={user.name} />
                                                <AvatarFallback className="rounded-lg">
                                                    {userInitials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate font-semibold">{user.name}</span>
                                                {user.email && (
                                                    <span className="truncate text-xs text-muted-foreground">
                                                        {user.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/perfil" className="gap-2 cursor-pointer">
                                            <User className="size-4" />
                                            <span>Mi Perfil</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    {footerMenuItems}
                                    {onLogout && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={onLogout}
                                                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                                            >
                                                <LogOut className="size-4" />
                                                <span>Cerrar Sesión</span>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            )}

            <SidebarRail />
        </Sidebar>
    );
}
