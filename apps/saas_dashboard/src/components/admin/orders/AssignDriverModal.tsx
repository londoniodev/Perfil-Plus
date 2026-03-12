"use client"

import { useState } from "react"
import { getAvailableDrivers, assignDriverToOrder } from "@/actions/admin/delivery"
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    useToast
} from "@alvarosky/ui"
import { Truck, Loader2 } from "lucide-react"

export function AssignDriverModal({ orderId }: { orderId: string }) {
    const toast = useToast()
    const [open, setOpen] = useState(false)
    const [drivers, setDrivers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [assigningId, setAssigningId] = useState<string | null>(null)

    const fetchDrivers = async () => {
        setLoading(true)
        try {
            const av = await getAvailableDrivers()
            // Filtro local adicional de maxCapacity, aunque el status sea AVAILABLE
            setDrivers(av.filter(d => (d.currentActiveOrders || 0) < (d.maxCapacity || 3)))
        } catch (error) {
            toast.error("Error", "No se pudieron cargar los domiciliarios")
        } finally {
            setLoading(false)
        }
    }

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen) {
            fetchDrivers()
        }
    }

    const handleAssign = async (driverId: string) => {
        setAssigningId(driverId)
        try {
            const res = await assignDriverToOrder(orderId, driverId)
            if (res.success) {
                toast.success("Asignado correctamente", "El domiciliario ha sido despachado.")
                setOpen(false)
            } else {
                toast.error("Hubo un error", res.error || "No se pudo asignar.")
            }
        } catch (error) {
            toast.error("Error crítico", "La acción falló.")
        } finally {
            setAssigningId(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                    <Truck className="w-4 h-4 mr-2" aria-hidden="true" /> Asignar Domiciliario
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Asignar Domiciliario</DialogTitle>
                    <DialogDescription>
                        Selecciona un domiciliario disponible para despachar esta orden.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2 mt-4 min-h-[150px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" aria-hidden="true" />
                        </div>
                    ) : drivers.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8 border border-dashed rounded-md bg-muted/20">
                            No hay domiciliarios disponibles.
                        </div>
                    ) : (
                        drivers.map(driver => (
                            <div key={driver.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                <div>
                                    <p className="font-medium text-sm">{driver.user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{driver.vehicle || 'Sin vehículo'}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-semibold px-2 py-1 bg-secondary rounded-full">
                                        {driver.currentActiveOrders || 0} / {driver.maxCapacity || 3}
                                    </span>
                                    <Button 
                                        size="sm" 
                                        onClick={() => handleAssign(driver.id)}
                                        disabled={assigningId !== null}
                                    >
                                        {assigningId === driver.id ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true"/> : 'Seleccionar'}
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
