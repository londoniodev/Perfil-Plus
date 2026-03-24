"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Button,
    Input,
    Badge,
    Avatar,
    AvatarFallback,
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
import { MoreHorizontal, Search, Trash, Eye, Settings, Database } from "lucide-react"
import { toast } from "sonner"
import { CreateTenantModal } from "./create-tenant-modal"

interface Tenant {
    id: string
    name: string | null
    slug: string
    status: string
    dbName: string
    createdAt: Date
}

interface TenantsTableProps {
    data: Tenant[]
}

export function TenantsTable({ data }: TenantsTableProps) {
    const router = useRouter()
    const [search, setSearch] = React.useState("")
    const [currentPage, setCurrentPage] = React.useState(1)
    const [tenantToDelete, setTenantToDelete] = React.useState<Tenant | null>(null)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const itemsPerPage = 10

    // Filter data
    const filteredData = React.useMemo(() => {
        return data.filter((tenant) => {
            const searchLower = search.toLowerCase()
            return (
                tenant.name?.toLowerCase().includes(searchLower) ||
                tenant.slug.toLowerCase().includes(searchLower) ||
                tenant.dbName.toLowerCase().includes(searchLower)
            )
        })
    }, [data, search])

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const paginatedData = React.useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredData.slice(start, start + itemsPerPage)
    }, [filteredData, currentPage])

    // Reset page on search change
    React.useEffect(() => {
        setCurrentPage(1)
    }, [search])

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            case "DEPLOYING":
                return "bg-amber-500/20 text-amber-400 border-amber-500/30"
            case "FAILED":
            case "SUSPENDED":
                return "bg-red-500/20 text-red-400 border-red-500/30"
            default:
                return "bg-slate-500/20 text-slate-400 border-slate-500/30"
        }
    }

    const handleDelete = async () => {
        if (!tenantToDelete) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/tenants/${tenantToDelete.slug}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Error al eliminar el tenant")
            }

            toast.success("Tenant eliminado correctamente")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Error al eliminar el tenant")
        } finally {
            setIsDeleting(false)
            setTenantToDelete(null)
        }
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, slug o DB..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        className="pl-9 bg-background/50 border-input"
                    />
                </div>
                <CreateTenantModal />
            </div>

            {/* Table */}
            <div className="w-full overflow-hidden rounded-md border bg-card/40">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px] pl-4">Tenant</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Base de Datos</TableHead>
                            <TableHead>Creado</TableHead>
                            <TableHead className="text-right pr-4">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No se encontraron resultados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((tenant) => (
                                <TableRow key={tenant.id}>
                                    <TableCell className="pl-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-border/50">
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                                    {getInitials(tenant.name || tenant.slug)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{tenant.name || tenant.slug}</span>
                                                <span className="text-xs text-muted-foreground">{tenant.slug}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(getStatusColor(tenant.status))}>
                                            {tenant.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Database className="h-3.5 w-3.5" />
                                            <span className="font-mono text-xs">{tenant.dbName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(tenant.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => router.push(`/superadmin/tenants/${tenant.slug}`)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Ver Detalles
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/superadmin/tenants/${tenant.slug}/settings`)}>
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    Configuración
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                                    onClick={() => setTenantToDelete(tenant)}
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
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

            <AlertDialog open={!!tenantToDelete} onOpenChange={(open) => !open && setTenantToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el tenant
                            <span className="font-bold text-foreground mx-1">
                                {tenantToDelete?.name || tenantToDelete?.slug}
                            </span>
                            y sus registros asociados de la base de datos de gestión.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar Tenant"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
