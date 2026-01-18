"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/config";
import { useToast } from "@mauromera/ui";
import { DataTable } from "@mauromera/ui";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@mauromera/ui";
import { Input } from "@mauromera/ui";
import { Badge } from "@mauromera/ui";
import {
    IconSearch,
    IconTrash,
    IconEdit
} from "@mauromera/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@mauromera/ui";
import { Pagination } from "@mauromera/ui";
import { PageHeader } from "@mauromera/ui";

// ============================================================================
// TIPOS
// ============================================================================

export interface User {
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
    data: User[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function AdminUsuariosPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const toast = useToast();

    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Filtros
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("ALL"); // "ALL" instead of "" for better Select handling
    const [subscription, setSubscription] = useState("ALL");

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Cargar usuarios
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
                headers: { "Content-Type": "application/json" },
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
                headers: { "Content-Type": "application/json" },
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

    // Columns Definition
    const columns = useMemo<ColumnDef<User>[]>(() => [
        {
            accessorKey: "name",
            header: "Usuario",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground">{user.name || "Sin nombre"}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "role",
            header: "Rol",
            cell: ({ row }) => {
                const user = row.original;
                const isItemLoading = actionLoading === user.id;
                return (
                    <select
                        className="text-xs border rounded px-2 py-1 bg-background text-foreground"
                        value={user.role}
                        disabled={isItemLoading}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as "USER" | "ADMIN")}
                    >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                );
            }
        },
        {
            accessorKey: "subscription",
            header: "Suscripción",
            cell: ({ row }) => {
                const user = row.original;
                const isActive = user.subscription?.status === "ACTIVE";
                const isItemLoading = actionLoading === user.id;
                return (
                    <div className="flex items-center gap-2">
                        <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                            {isActive ? "Premium" : "Gratis"}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={isItemLoading}
                            className="h-6 px-2 text-xs"
                            onClick={() => handleSubscription(user.id, isActive ? "cancel" : "assign")}
                        >
                            {isActive ? "Cancelar" : "Asignar"}
                        </Button>
                    </div>
                )
            }
        },
        {
            accessorKey: "date",
            header: "Fecha",
            cell: ({ row }) => {
                return <span className="text-xs whitespace-nowrap">
                    {new Date(row.original.createdAt).toLocaleDateString()}
                </span>
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const isItemLoading = actionLoading === row.original.id;
                return (
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={isItemLoading}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                        onClick={() => handleDelete(row.original.id)}
                    >
                        <IconTrash className="h-4 w-4" />
                    </Button>
                )
            }
        }
    ], [actionLoading]);

    if (authLoading) return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;
    if (!isAdmin) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestión de Usuarios"
                description={`${meta.total} usuarios registrados`}
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="w-full sm:w-[180px]">
                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger>
                            <SelectValue placeholder="Rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos los Roles</SelectItem>
                            <SelectItem value="USER">Usuarios</SelectItem>
                            <SelectItem value="ADMIN">Admins</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full sm:w-[180px]">
                    <Select value={subscription} onValueChange={setSubscription}>
                        <SelectTrigger>
                            <SelectValue placeholder="Suscripción" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todas</SelectItem>
                            <SelectItem value="active">Activas</SelectItem>
                            <SelectItem value="inactive">Inactivas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-md border">
                <DataTable columns={columns} data={users} />
            </div>

            {/* Pagination */}
            <div className="mt-4">
                <Pagination
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                    onPageChange={(page) => fetchUsers(page)}
                />
            </div>
        </div>
    );
}
