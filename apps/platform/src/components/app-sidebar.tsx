"use client"

import * as React from "react"
import {
  AdminSidebar,
  DropdownMenuItem,
} from "@alvarosky/ui"
import { LogoutButton } from "@/components/logout-button"
import { getPlatformSections, type TenantItem } from "@/config/sidebar.config"

// ============================================================================
// TYPES
// ============================================================================

interface AppSidebarProps extends Omit<
  React.ComponentProps<typeof AdminSidebar>,
  'sections' | 'brand' | 'user' | 'onLogout' | 'footerMenuItems'
> {
  tenants?: TenantItem[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AppSidebar({ tenants = [], ...props }: AppSidebarProps) {
  // Get navigation sections with dynamic tenants
  const sections = getPlatformSections(tenants)

  // Brand configuration for Platform
  const brand = {
    logo: (
      <span className="font-bold text-white">P</span>
    ),
    name: "Platform",
    subtitle: "Admin Console",
  }

  // Static user for Platform (super-admin)
  const user = {
    name: "Admin",
    email: "Super Admin",
  }

  // Footer menu items (logout)
  const footerMenuItems = (
    <DropdownMenuItem asChild>
      <LogoutButton
        variant="ghost"
        className="w-full justify-start cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600 focus:bg-red-50"
      />
    </DropdownMenuItem>
  )

  return (
    <AdminSidebar
      {...props}
      sections={sections}
      brand={brand}
      user={user}
      footerMenuItems={footerMenuItems}
    />
  )
}
