"use client"

import { useRef, useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Input,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    cn,
} from "@alvarosky/ui"
import { Search, Trash2, Users, TrendingUp, Phone, Mail, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { API_BASE, TENANT_ID } from "@/lib/config"

type Lead = {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    source: string | null
    status: string
    notes: string | null
    createdAt: string
}

type LeadStats = {
    total: number
    thisWeek: number
    bySource: { source: string | null; count: number }[]
    recentLeads: Lead[]
}

const STATUS_MAP: Record<string, { label: string; variant: string }> = {
    new: { label: "Nuevo", variant: "bg-blue-50 text-blue-700 border-blue-200" },
    contacted: { label: "Contactado", variant: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    converted: { label: "Convertido", variant: "bg-green-50 text-green-700 border-green-200" },
    lost: { label: "Perdido", variant: "bg-red-50 text-red-700 border-red-200" },
}

export function ClientesClient({
    initialLeads,
    stats,
}: {
    initialLeads: Lead[]
    stats: LeadStats | null
}) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads)
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10;
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Sincronizar estado local si initialLeads cambia (SWR/Server Actions fallback)
    useEffect(() => {
        setLeads(initialLeads);
    }, [initialLeads]);

    const filteredLeads = leads.filter((lead) => {
        const q = search.toLowerCase()
        return (
            (lead.name?.toLowerCase().includes(q) ?? false) ||
            (lead.email?.toLowerCase().includes(q) ?? false) ||
            (lead.phone?.includes(q) ?? false)
        )
    })

    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage)
    const paginatedLeads = filteredLeads.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Reset page when filtering
    const handleSearchChange = (val: string) => {
        setSearch(val)
        setCurrentPage(1)
    }

    const handleDelete = async () => {
        if (!deleteId) return
        setIsDeleting(true)
        try {
            const token = document.cookie
                .split("; ")
                .find((c) => c.startsWith("Authentication="))
                ?.split("=")[1]

            const res = await fetch(`${API_BASE}/leads/${deleteId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    },
            })
            if (!res.ok) throw new Error("Error al eliminar")
            setLeads((prev) => prev.filter((l) => l.id !== deleteId))
            toast.success("Cliente eliminado")
        } catch {
            toast.error("No se pudo eliminar el cliente")
        } finally {
            setIsDeleting(false)
            setDeleteId(null)
        }
    }

    return (
        <section className="space-y-6" aria-labelledby="clientes-title">
            <h2 id="clientes-title" className="sr-only">Gestión de Clientes y Leads</h2>
            {/* Stats Cards */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.thisWeek}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Fuentes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm space-y-1">
                                {stats.bySource.length > 0 ? (
                                    stats.bySource.map((s) => (
                                        <div key={s.source} className="flex justify-between">
                                            <span className="text-muted-foreground">{s.source || "Directo"}</span>
                                            <span className="font-medium">{s.count}</span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground">Sin datos</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                        placeholder="Buscar por nombre, email o teléfono..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="w-full">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-4">Cliente</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Origen</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right pr-4">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedLeads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No se encontraron clientes.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedLeads.map((lead) => {
                                const statusInfo = STATUS_MAP[lead.status] || STATUS_MAP.new
                                return (
                                    <TableRow key={lead.id}>
                                        <TableCell className="pl-4">
                                            <div className="font-medium">{lead.name || "Sin nombre"}</div>
                                            {lead.notes && (
                                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {lead.notes}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {lead.email && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Mail className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                                                        <span>{lead.email}</span>
                                                    </div>
                                                )}
                                                {lead.phone && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Phone className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                                                        <span>{lead.phone}</span>
                                                    </div>
                                                )}
                                                {!lead.email && !lead.phone && (
                                                    <span className="text-sm text-muted-foreground">—</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{lead.source || "Menú"}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(statusInfo.variant)}>
                                                {statusInfo.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(lead.createdAt).toLocaleDateString("es-ES", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setDeleteId(lead.id)}
                                                aria-label={`Eliminar cliente ${lead.name || "Sin nombre"}`}
                                            >
                                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination className="mt-4">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                className="cursor-pointer"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                aria-disabled={currentPage === 1}
                            />
                        </PaginationItem>
                        
                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    className="cursor-pointer"
                                    onClick={() => setCurrentPage(i + 1)}
                                    isActive={currentPage === i + 1}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext 
                                className="cursor-pointer"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                aria-disabled={currentPage === totalPages}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente este registro.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    )
}
