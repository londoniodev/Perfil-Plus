"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    IconHome,
    IconBook,
    IconEdit,
    IconDocument,
    IconUsers,
    IconLogout,
    IconCreditCard,
    IconGrid
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    features?: string[];
}

export function AppSidebar({ features = [], ...props }: AppSidebarProps) {
    const pathname = usePathname()
    const { logout, isAdmin, user } = useAuth()

    const userMenuItems = [
        { name: "Mi Panel", href: "/perfil", icon: IconHome },
        { name: "Mis Cursos", href: "/cursos", icon: IconBook },
        { name: "Mis Compras", href: "/compras", icon: IconGrid },
        { name: "Suscripción", href: "/suscripcion", icon: IconCreditCard },
    ]

    const adminMenuItems = [
        { name: "Dashboard", href: "/perfil", icon: IconHome },
        { name: "Gestionar Cursos", href: "/admin/cursos", icon: IconEdit },
        { name: "Gestionar Blog", href: "/admin/blog", icon: IconDocument },
        { name: "Gestión de Productos", href: "/admin/productos", icon: IconGrid },
        { name: "Usuarios", href: "/admin/usuarios", icon: IconUsers },
    ]

    const menuItems = isAdmin ? adminMenuItems : userMenuItems

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <img src="/images/branding/menu_logo.png" alt="Logo" className="size-6 object-contain brightness-0 invert" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Mauro Mera</span>
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
