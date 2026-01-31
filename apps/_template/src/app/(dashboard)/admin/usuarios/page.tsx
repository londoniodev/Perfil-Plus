"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
    Input,
    Badge,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Pagination,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Avatar,
    AvatarFallback,
    Separator,
    SidebarTrigger,
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@alvarosky/ui";
import { Search, MoreHorizontal, UserCog, Trash2, Crown, UserMinus, Shield, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@alvarosky/ui/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface UserData {
    id: string;
    email: string;
    name: string;
    role: "USER" | "ADMIN";
    emailVerified: boolean;
    createdAt: string;
    subscription?: {
        status: string;
    };
}

interface UsersResponse {
    data: UserData[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminUsuariosPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    const [users, setUsers] = useState<UserData[]>([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("ALL");
    const [subscription, setSubscription] = useState("ALL");

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch users
    const fetchUsers = useCallback(async (pageParam = 1) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: pageParam.toString(),
                limit: "20",
            });

            if (debouncedSearch) queryParams.append("search", debouncedSearch);
            if (role && role !== "ALL") queryParams.append("role", role);
            if (subscription && subscription !== "ALL") queryParams.append("subscription", subscription === "active" ? "active" : "inactive");

            const res = await fetch(`${API_BASE}/admin/users?${queryParams.toString()}`, {
                headers: { 'x-tenant-id': TENANT_ID },
                credentials: "include",
            });

            if (res.ok) {
                const data: UsersResponse = await res.json();
                setUsers(data.data);
                setMeta(data.meta);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, role, subscription]);

    useEffect(() => {
        if (!authLoading && isAdmin) {
            fetchUsers(1);
        }
    }, [fetchUsers, authLoading, isAdmin]);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push("/perfil");
        }
    }, [isAdmin, authLoading, router]);

    // Handlers
    const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
        setActionLoading(userId);
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
                credentials: "include",
                body: JSON.stringify({ role: newRole }),
            });
            if (res.ok) {
                setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
                toast.success("Rol actualizado");
            }
        } catch {
            toast.error("Error al actualizar rol");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("¿Eliminar usuario irreversiblemente?")) return;
        setActionLoading(userId);
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
                method: "DELETE",
                headers: { 'x-tenant-id': TENANT_ID },
                credentials: "include",
            });
            if (res.ok) {
                setUsers(users.filter((u) => u.id !== userId));
                toast.success("Usuario eliminado");
            }
        } catch {
            toast.error("Error al eliminar");
        } finally {
            setActionLoading(null);
        }
    };

    const handleSubscription = async (userId: string, action: "assign" | "cancel") => {
        if (!confirm(action === "assign" ? "¿Asignar Premium?" : "¿Cancelar Premium?")) return;
        setActionLoading(userId);
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}/subscription`, {
                method: action === "assign" ? "POST" : "DELETE",
                headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
                credentials: "include",
            });
            if (res.ok) {
                setUsers(users.map((u) => {
                    if (u.id === userId) {
                        return {
                            ...u,
                            subscription: { status: action === "assign" ? "ACTIVE" : "CANCELLED" }
                        };
                    }
                    return u;
                }));
                toast.success(action === "assign" ? "Premium asignado" : "Premium cancelado");
            }
        } catch {
            toast.error("Error en suscripción");
        } finally {
            setActionLoading(null);
        }
    };

    // Get initials
    const getInitials = (name: string) => {
        return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
    };

    if (authLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header with Breadcrumbs */}
            <header className="flex h-14 lg:h-[60px] shrink-0 items-center gap-2 border-b bg-background px-4 lg:px-6 sticky top-0 z-10">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink asChild>
                                <Link href="/perfil">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink asChild>
                                <Link href="/admin">Admin</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Usuarios</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>

            {/* Content */}
            <div className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
                <div className="max-w-7xl space-y-8">
                    {/* Page Header */}
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
                        <p className="text-muted-foreground">
                            {meta.total} usuarios registrados en la plataforma
                        </p>
                    </div>

                    <Separator />

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre o email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="w-full sm:w-[160px]">
                                <SelectValue placeholder="Rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos los Roles</SelectItem>
                                <SelectItem value="USER">Usuarios</SelectItem>
                                <SelectItem value="ADMIN">Admins</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={subscription} onValueChange={setSubscription}>
                            <SelectTrigger className="w-full sm:w-[160px]">
                                <SelectValue placeholder="Suscripción" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todas</SelectItem>
                                <SelectItem value="active">Premium</SelectItem>
                                <SelectItem value="inactive">Gratis</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="rounded-lg border bg-card overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[300px]">Usuario</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>Suscripción</TableHead>
                                    <TableHead>Registrado</TableHead>
                                    <TableHead className="w-[70px]">
                                        <span className="sr-only">Acciones</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No se encontraron usuarios.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => {
                                        const isActive = user.subscription?.status === "ACTIVE";
                                        const isItemLoading = actionLoading === user.id;

                                        return (
                                            <TableRow key={user.id} className="transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                                {getInitials(user.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{user.name || "Sin nombre"}</span>
                                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="gap-1">
                                                        {user.role === "ADMIN" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={isActive ? "default" : "outline"}
                                                        className={cn(isActive && "bg-gradient-to-r from-amber-400 to-yellow-500 text-yellow-900 border-0")}
                                                    >
                                                        {isActive ? (
                                                            <><Crown className="h-3 w-3 mr-1" /> Premium</>
                                                        ) : (
                                                            "Gratis"
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(user.createdAt).toLocaleDateString("es-ES", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric"
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0"
                                                                disabled={isItemLoading}
                                                            >
                                                                {isItemLoading ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                )}
                                                                <span className="sr-only">Acciones</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[180px]">
                                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleRoleChange(user.id, user.role === "ADMIN" ? "USER" : "ADMIN")}
                                                            >
                                                                <UserCog className="mr-2 h-4 w-4" />
                                                                {user.role === "ADMIN" ? "Quitar Admin" : "Hacer Admin"}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleSubscription(user.id, isActive ? "cancel" : "assign")}
                                                            >
                                                                {isActive ? (
                                                                    <><UserMinus className="mr-2 h-4 w-4" /> Quitar Premium</>
                                                                ) : (
                                                                    <><Crown className="mr-2 h-4 w-4" /> Dar Premium</>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(user.id)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {meta.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Página {meta.page} de {meta.totalPages}
                            </p>
                            <Pagination
                                currentPage={meta.page}
                                totalPages={meta.totalPages}
                                onPageChange={(page) => fetchUsers(page)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
