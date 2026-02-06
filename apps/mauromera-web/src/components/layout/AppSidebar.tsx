"use client"

import * as React from "react"
import Link from "next/link"
import { Settings, Bell, User } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import {
    AdminSidebar,
    DropdownMenuItem,
    DropdownMenuSeparator,
    type AdminSidebarSection,
} from "@alvarosky/ui"
import { getSidebarSections, type FeatureKey } from "@/config/sidebar.config"
import { getUserSections } from "@/config/navigation"

// ============================================================================
// TYPES
// ============================================================================

interface AppSidebarProps extends Omit<React.ComponentProps<typeof AdminSidebar>, 'sections' | 'brand' | 'user' | 'onLogout' | 'footerMenuItems'> {
    features?: FeatureKey[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AppSidebar({ features = [], ...props }: AppSidebarProps) {
    const { logout, isAdmin, user } = useAuth()

    // Get navigation sections based on role
    const sections: AdminSidebarSection[] = isAdmin
        ? getSidebarSections(features)
        : getUserSections(features)

    // Brand configuration
    const brand = {
        logo: (
            <img
                src="/images/branding/menu_logo.png"
                alt="Logo"
                className="size-5 object-contain brightness-0 invert"
            />
        ),
        name: process.env.NEXT_PUBLIC_TENANT_NAME || "Template",
        subtitle: isAdmin ? "Consola Admin" : "Plataforma",
    }

    // User configuration (convert null to undefined for type compatibility)
    const userConfig = user ? {
        name: user.name || "Usuario",
        email: user.email,
        avatar: user.avatar ?? undefined,
    } : undefined

    // Additional footer menu items
    const footerMenuItems = (
        <>
            <DropdownMenuItem asChild>
                <Link href="/perfil" className="gap-2 cursor-pointer">
                    <User className="size-4" />
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
        </>
    )

    return (
        <AdminSidebar
            {...props}
            sections={sections}
            brand={brand}
            user={userConfig}
            onLogout={logout}
            footerMenuItems={footerMenuItems}
        />
    )
}

