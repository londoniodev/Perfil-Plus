"use client"

import { useState, useEffect } from "react"
import { Button, useToast } from "@alvarosky/ui"
import { Power, Loader2, RefreshCw } from "lucide-react"

type DriverProfile = {
    id: string
    status: "AVAILABLE" | "AT_CAPACITY" | "OFFLINE"
}

async function getDriverProfile(): Promise<DriverProfile | null> {
    try {
        const { serverFetch } = await import("@/lib/api-server")
        return null // This won't work from client, we'll use the action
    } catch {
        return null
    }
}

export function DriverMobileHeader() {
    const toast = useToast()
    const [status, setStatus] = useState<string | null>(null)
    const [toggling, setToggling] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    // Fetch initial status
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
        window.location.reload()
    }

    const isOnline = status === "AVAILABLE"

    return (
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 py-4 mb-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mis Pedidos</h1>
                    <p className="text-sm text-gray-500">Ruta sugerida. Entregas pendientes.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        aria-label="Refrescar pedidos"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                    </Button>

                    {status !== null && (
                        <Button
                            size="sm"
                            variant={isOnline ? "default" : "outline"}
                            onClick={handleToggle}
                            disabled={toggling}
                            className={isOnline
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "border-gray-300 text-gray-500"
                            }
                        >
                            {toggling ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-1" aria-hidden="true" />
                            ) : (
                                <Power className="w-4 h-4 mr-1" aria-hidden="true" />
                            )}
                            {isOnline ? "En Línea" : "Off"}
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
