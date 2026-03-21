"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { DashboardSidebar } from "./DashboardSidebar"
import { AdminHeader, SidebarInset, SidebarProvider } from "@alvarosky/ui"
import type { FeatureKey } from "@/config/sidebar.config"
import { useDashboard } from "@/context/DashboardContext"

interface DashboardShellProps {
    children: React.ReactNode
    features: FeatureKey[]
    tenantName: string
    defaultOpen: boolean
    appName: string
    logoUrl?: string
}

export function DashboardShell({ children, features, tenantName, defaultOpen, appName, logoUrl }: DashboardShellProps) {
    const pathname = usePathname()
    const { breadcrumbOverrides } = useDashboard()

    // Known segment translations for breadcrumbs
    const segmentLabels: Record<string, string> = {
        'dashboard': 'Dashboard',
        'restaurante': 'Restaurante',
        'menu': 'Menú',
        'nuevo': 'Nuevo Plato',
        'tienda': 'Tienda',
        'productos': 'Productos',
        'pedidos': 'Pedidos',
        'comandas': 'Comandas',
        'configuracion': 'Configuración',
        'usuarios': 'Usuarios',
        'perfil': 'Perfil',
        'empleados': 'Empleados',
        'cocina': 'Cocina',
        'mesero': 'Mesero',
        'mesas': 'Mesas',
        'caja': 'Caja',
        'pos': 'POS',
        'clientes': 'CRM / Leads',
        'blog': 'Blog',
        'publicaciones': 'Publicaciones',
        'academia': 'Academia',
        'cursos': 'Cursos',
    }

    // Generate breadcrumbs with overrides
    // Generate breadcrumbs with overrides
    const breadcrumbs = React.useMemo(() => {
        const segments = pathname.split('/').filter(Boolean)
        // Skip the first segment if it's 'dashboard' (it's the basePath)
        const displaySegments = segments[0] === 'dashboard' ? segments.slice(1) : segments
        
        return displaySegments.map((segment, index) => {
            const href = `/${segments.slice(0, segments.indexOf(segment) + 1).join('/')}`
            
            // Contextual label for 'nuevo'
            let label = breadcrumbOverrides[segment] || segmentLabels[segment];
            
            if (segment === 'nuevo' && !breadcrumbOverrides[segment]) {
                const prevSegment = displaySegments[index - 1];
                if (prevSegment === 'menu') label = 'Nuevo Plato';
                else if (prevSegment === 'publicaciones') label = 'Nuevo Post';
                else if (prevSegment === 'productos') label = 'Nuevo Producto';
                else if (prevSegment === 'temas') label = 'Nuevo Tema';
                else if (prevSegment === 'usuarios') label = 'Nuevo Usuario';
                else label = 'Nuevo';
            }

            if (!label) {
                label = segment
                    .replace(/-/g, ' ')
                    .replace(/^./, (c) => c.toUpperCase());
            }

            return { label, href }
        })
    }, [pathname, breadcrumbOverrides])

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <DashboardSidebar features={features} tenantName={tenantName} logoUrl={logoUrl} />
            <SidebarInset>
                <AdminHeader appName={appName} breadcrumbs={breadcrumbs} />
                <main className="flex flex-1 flex-col min-h-screen bg-background">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider >
    )
}
