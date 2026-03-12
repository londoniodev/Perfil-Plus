"use client"

import { useState, useEffect, useCallback } from "react"
import { getAllDrivers, updateDriver, deleteDriver } from "@/actions/admin/delivery"
import {
    AdminPageWrapper,
    Button,
    Badge,
    Card,
    CardContent,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    useToast
} from "@alvarosky/ui"
import { Bike, Pencil, Trash2, Loader2, RefreshCw, Phone, Users } from "lucide-react"

export const dynamic = "force-dynamic"

type Driver = {
    id: string
    phone: string
    vehicle: string | null
    status: "AVAILABLE" | "AT_CAPACITY" | "OFFLINE"
    maxCapacity: number
    currentActiveOrders: number
    user: { id: string; name: string; email: string; avatar: string | null }
    _count?: { orders: number }
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    AVAILABLE: { label: "Disponible", variant: "default" },
    AT_CAPACITY: { label: "Lleno", variant: "secondary" },
    OFFLINE: { label: "Fuera de línea", variant: "destructive" },
}

// ─── Edit Driver Modal ───
function EditDriverModal({ driver, onSaved }: { driver: Driver, onSaved: () => void }) {
    const toast = useToast()
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [phone, setPhone] = useState(driver.phone)
    const [vehicle, setVehicle] = useState(driver.vehicle || "")
    const [status, setStatus] = useState(driver.status)
    const [maxCapacity, setMaxCapacity] = useState(driver.maxCapacity || 3)

    const handleSave = async () => {
        setSaving(true)
        const res = await updateDriver(driver.id, { phone, vehicle, status, maxCapacity })
        if (res.success) {
            toast.success("Actualizado", "Domiciliario actualizado correctamente.")
            setOpen(false)
            onSaved()
        } else {
            toast.error("Error", res.error || "No se pudo actualizar.")
        }
        setSaving(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="Editar domiciliario">
                    <Pencil className="w-4 h-4" aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar: {driver.user.name}</DialogTitle>
                    <DialogDescription>Modifica los datos del domiciliario.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-phone">Teléfono</Label>
                        <Input id="edit-phone" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-vehicle">Vehículo</Label>
                        <Input id="edit-vehicle" value={vehicle} onChange={e => setVehicle(e.target.value)} placeholder="Moto, Bicicleta, Carro..." />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-capacity">Capacidad Máxima (pedidos simultáneos)</Label>
                        <Input id="edit-capacity" type="number" min={1} max={10} value={maxCapacity} onChange={e => setMaxCapacity(parseInt(e.target.value) || 1)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-status">Estado</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as Driver["status"])}>
                            <SelectTrigger id="edit-status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AVAILABLE">Disponible</SelectItem>
                                <SelectItem value="AT_CAPACITY">Lleno</SelectItem>
                                <SelectItem value="OFFLINE">Fuera de línea</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" /> : null}
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Delete Confirmation ───
function DeleteDriverButton({ driverId, driverName, onDeleted }: { driverId: string, driverName: string, onDeleted: () => void }) {
    const toast = useToast()
    const [open, setOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        setDeleting(true)
        const res = await deleteDriver(driverId)
        if (res.success) {
            toast.success("Eliminado", `${driverName} ha sido eliminado.`)
            setOpen(false)
            onDeleted()
        } else {
            toast.error("Error", res.error || "No se pudo eliminar.")
        }
        setDeleting(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" aria-label="Eliminar domiciliario">
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>¿Eliminar a {driverName}?</DialogTitle>
                    <DialogDescription>Esta acción no se puede deshacer. El usuario seguirá existiendo pero ya no será domiciliario.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                        {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" /> : null}
                        Eliminar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Main Page ───
export default function DomiciliariosPage() {
    const toast = useToast()
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [loading, setLoading] = useState(true)

    const fetchDrivers = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getAllDrivers()
            setDrivers(data)
        } catch {
            toast.error("Error", "No se pudieron cargar los domiciliarios.")
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchDrivers()
    }, [fetchDrivers])

    return (
        <AdminPageWrapper
            title="Domiciliarios"
            description="Administra los repartidores del negocio: vehículo, capacidad y estado."
            actions={
                <Button variant="outline" size="sm" onClick={fetchDrivers} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                    Refrescar
                </Button>
            }
        >
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" aria-hidden="true" />
                </div>
            ) : drivers.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Users className="w-12 h-12 text-muted-foreground/50 mb-4" aria-hidden="true" />
                        <h3 className="text-lg font-semibold text-gray-700">Sin Domiciliarios</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            Registra un usuario con rol <strong>DRIVER</strong> desde la sección de Empleados y luego aparecerá aquí.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {drivers.map(driver => {
                        const activeOrders = driver._count?.orders ?? driver.currentActiveOrders ?? 0
                        const cap = driver.maxCapacity || 3
                        const statusInfo = statusLabels[driver.status] || statusLabels.OFFLINE

                        return (
                            <Card key={driver.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        {/* Info */}
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 rounded-full p-3 shrink-0">
                                                <Bike className="w-6 h-6 text-primary" aria-hidden="true" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base">{driver.user.name}</h3>
                                                <p className="text-xs text-muted-foreground">{driver.user.email}</p>
                                                <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3.5 h-3.5" aria-hidden="true" /> {driver.phone}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{driver.vehicle || "Sin vehículo"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats + Actions */}
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="text-center min-w-[60px]">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Carga</p>
                                                <p className="text-lg font-black">{activeOrders} <span className="text-sm font-normal text-muted-foreground">/ {cap}</span></p>
                                            </div>
                                            <Badge variant={statusInfo.variant} className="shrink-0">
                                                {statusInfo.label}
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                <EditDriverModal driver={driver} onSaved={fetchDrivers} />
                                                <DeleteDriverButton driverId={driver.id} driverName={driver.user.name} onDeleted={fetchDrivers} />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </AdminPageWrapper>
    )
}
