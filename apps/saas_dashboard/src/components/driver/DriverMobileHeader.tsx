"use client"

import { useState, useEffect } from "react"
import { Button, useToast } from "@alvarosky/ui"
import { Power, Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

type DriverProfile = {
    id: string
    status: "AVAILABLE" | "AT_CAPACITY" | "OFFLINE"
}

export function DriverMobileHeader() {
    const toast = useToast()
    const router = useRouter()
    const [status, setStatus] = useState<string | null>(null)
    const [toggling, setToggling] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchStatus()
    }, [])

    const fetchStatus = async () => {
        try {
            const { getDriverProfile } = await import("@/actions/driver")
            const profile = await getDriverProfile()
            if (profile?.status) {
                setStatus(profile.status)
            }
        } catch {
            // silent
        }
    }

    const handleToggle = async () => {
        setToggling(true)
        try {
            const { updateDriverStatus } = await import("@/actions/driver")
            const newStatus = status === "AVAILABLE" ? "OFFLINE" : "AVAILABLE"
            const res = await updateDriverStatus(newStatus)
            if (res.success) {
                setStatus(newStatus)
                toast.success(
                    newStatus === "AVAILABLE" ? "¡Activado!" : "Desactivado",
                    newStatus === "AVAILABLE" ? "Ahora puedes recibir pedidos." : "No recibirás más pedidos."
                )
            } else {
                toast.error("Error", res.error || "No se pudo cambiar el estado.")
            }
        } catch {
            toast.error("Error", "Fallo de conexión.")
        } finally {
            setToggling(false)
        }
    }

    const handleRefresh = () => {
        setRefreshing(true)
        router.refresh()
        setTimeout(() => setRefreshing(false), 500)
    }

    const isOnline = status === "AVAILABLE"

    return (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm px-4 py-4 mb-6 transition-colors">
            <div className="flex justify-between items-center max-w-md mx-auto">
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">Mis Pedidos</h1>
                    <p className="text-sm text-muted-foreground">Ruta sugerida. Entregas pendientes.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        aria-label="Refrescar pedidos"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                    </Button>

                    {status !== null && (
                        <Button
                            size="sm"
                            variant={isOnline ? "default" : "outline"}
                            onClick={handleToggle}
                            disabled={toggling}
                            className={`rounded-full px-4 border ${isOnline
                                ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                : "bg-transparent border-muted-foreground/30 text-muted-foreground hover:bg-muted/50"
                            }`}
                        >
                            {toggling ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-1.5" aria-hidden="true" />
                            ) : (
                                <Power className="w-4 h-4 mr-1.5" aria-hidden="true" />
                            )}
                            {isOnline ? "En Línea" : "Off"}
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
