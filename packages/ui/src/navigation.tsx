"use client"

import * as React from "react"
import { cn } from "./lib/utils"

interface BottomNavItem {
    value: string
    label: string
    icon: React.ReactNode
}

interface BottomNavProps {
    items: BottomNavItem[]
    value: string
    onChange: (value: string) => void
    className?: string
}

const BottomNav = React.forwardRef<HTMLDivElement, BottomNavProps>(
    ({ items, value, onChange, className }, ref) => {
        return (
            <nav
                ref={ref}
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800",
                    "flex items-center justify-around py-2 px-1",
                    "lg:hidden", // Hide on desktop
                    className
                )}
            >
                {items.map((item) => (
                    <button
                        key={item.value}
                        onClick={() => onChange(item.value)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                            value === item.value
                                ? "text-primary bg-primary/10"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        )}
                    >
                        <span className="w-5 h-5">{item.icon}</span>
                        <span className="text-xs font-medium truncate max-w-[70px]">
                            {item.label}
                        </span>
                    </button>
                ))}
            </nav>
        )
    }
)
BottomNav.displayName = "BottomNav"

// Sidebar for desktop
interface SidebarNavItem {
    value: string
    label: string
    icon: React.ReactNode
    description?: string
}

interface SidebarNavProps {
    items: SidebarNavItem[]
    value: string
    onChange: (value: string) => void
    className?: string
    header?: React.ReactNode
}

const SidebarNav = React.forwardRef<HTMLDivElement, SidebarNavProps>(
    ({ items, value, onChange, className, header }, ref) => {
        return (
            <aside
                ref={ref}
                className={cn(
                    "hidden lg:flex flex-col w-64 shrink-0",
                    "bg-slate-900/50 backdrop-blur border-r border-slate-800",
                    className
                )}
            >
                {header && (
                    <div className="p-4 border-b border-slate-800">
                        {header}
                    </div>
                )}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {items.map((item) => (
                        <button
                            key={item.value}
                            onClick={() => onChange(item.value)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                                value === item.value
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
                            )}
                        >
                            <span className="w-5 h-5 shrink-0">{item.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {item.label}
                                </p>
                                {item.description && (
                                    <p className="text-xs text-slate-500 truncate">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}
                </nav>
            </aside>
        )
    }
)
SidebarNav.displayName = "SidebarNav"

export { BottomNav, SidebarNav }
export type { BottomNavItem, BottomNavProps, SidebarNavItem, SidebarNavProps }
