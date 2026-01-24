"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "./lib/utils"
IconLogout,
} from "./icons"

// Fallback icons if not imported from icons.tsx correctly
const ChevronRightIcon = ({ size = 24, className }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m9 18 6-6-6-6" />
    </svg>
)

const ChevronLeftIcon = ({ size = 24, className }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m15 18-6-6 6-6" />
    </svg>
)

export interface SidebarItem {
    name: string
    href: string
    icon: React.ReactNode
}

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    logo?: React.ReactNode
    items: SidebarItem[]
    isCollapsed?: boolean
    onToggle?: () => void
    onLogout?: () => void
    footer?: React.ReactNode
    userRole?: string
}

export function Sidebar({
    logo,
    items,
    isCollapsed = false,
    onToggle,
    onLogout,
    footer,
    userRole,
    className,
}: SidebarProps) {
    const pathname = usePathname()
    const isActive = (path: string) => pathname?.startsWith(path)

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 transition-all duration-300 hidden lg:flex flex-col",
                isCollapsed ? "w-16" : "w-64",
                className
            )}
        >
            {/* Logo Area */}
            <div className={cn(
                "flex items-center h-16 border-b px-4",
                isCollapsed ? "justify-center" : "justify-between"
            )}>
                <div className="flex items-center gap-2 overflow-hidden">
                    {logo}
                </div>
                {!isCollapsed && onToggle && (
                    <button
                        onClick={onToggle}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-auto"
                    >
                        <ChevronLeftIcon size={18} />
                    </button>
                )}
            </div>

            {/* Role Badge */}
            {!isCollapsed && userRole && (
                <div className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {userRole}
                    </span>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                <ul className="space-y-1">
                    {items.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        isCollapsed && "justify-center px-0",
                                        active
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                    title={isCollapsed ? item.name : ""}
                                >
                                    <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Footer / Logout */}
            <div className="p-3 border-t space-y-2">
                {footer}
                {onLogout && (
                    <button
                        onClick={onLogout}
                        className={cn(
                            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors",
                            isCollapsed && "justify-center px-0"
                        )}
                        title="Cerrar Sesión"
                    >
                        <IconLogout className="w-5 h-5" />
                        {!isCollapsed && <span>Cerrar Sesión</span>}
                    </button>
                )}
            </div>

            {/* Toggle Button for Collapsed (Floating when collapsed) */}
            {isCollapsed && onToggle && (
                <button
                    onClick={onToggle}
                    className="absolute -right-3 top-20 p-1.5 rounded-full bg-background border shadow-sm hover:bg-muted transition-colors"
                >
                    <ChevronRightIcon size={14} />
                </button>
            )}
        </aside>
    )
}
