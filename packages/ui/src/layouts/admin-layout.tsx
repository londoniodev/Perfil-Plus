import type { ReactNode } from "react"

interface AdminLayoutProps {
    children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {children}
        </div>
    )
}
