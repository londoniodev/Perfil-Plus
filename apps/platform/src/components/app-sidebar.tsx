"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Home,
  Users,
  Database,
  Settings,
  ChevronsUpDown,
  Plus,
  Box,
  ChevronRight,
} from "lucide-react"

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
  DropdownMenuTrigger,
} from "@alvarosky/ui"
import { LogoutButton } from "@/components/logout-button"

// Define the shape of a tenant item
export interface TenantItem {
  name: string;
  slug: string;
}

// Explicitly define validation props by intersecting with Sidebar props
type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  tenants?: TenantItem[];
}

export function AppSidebar({ tenants = [], ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/")

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-sidebar-primary-foreground">
                <span className="font-bold">P</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Platform</span>
                <span className="truncate text-xs">Admin Console</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/")} tooltip="Dashboard">
              <Link href="/">
                <Home />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarMenu>
            {/* Tenants Section (Collapsible) */}
            <Collapsible defaultOpen className="group/collapsible" asChild>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Tenants" isActive={isActive("/tenants")}>
                    <Users />
                    <span>Tenants</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={pathname === "/tenants"}>
                        <Link href="/tenants">Ver Todos</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    {tenants.map((tenant) => (
                      <SidebarMenuSubItem key={tenant.slug}>
                        <SidebarMenuSubButton asChild isActive={pathname === `/tenants/${tenant.slug}`}>
                          <Link href={`/tenants/${tenant.slug}`}>
                            <span>{tenant.name || tenant.slug}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={pathname === "/tenants/new"}>
                        <Link href="/tenants/new" className="text-primary hover:text-primary">
                          <Plus className="mr-2 h-4 w-4" /> Crear Tenant
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/databases")} tooltip="Bases de Datos">
                <Link href="/databases">
                  <Database />
                  <span>Bases de Datos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/settings")} tooltip="Configuración">
                <Link href="/settings">
                  <Settings />
                  <span>Configuración</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-slate-800 text-sidebar-primary-foreground">
                    <span className="text-xs">AD</span>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Admin</span>
                    <span className="truncate text-xs">Super Admin</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <LogoutButton
                    variant="ghost"
                    className="w-full justify-start cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600 focus:bg-red-50"
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}


