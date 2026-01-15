"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/config";
import UsersGrid, { UserGridItem as User } from "@/components/admin/users/UsersGrid";
import Pagination from "@/components/ui/Pagination";
import UserFilters from "@/components/admin/users/UserFilters";
import { useToast } from "@/components/ui/Toast";

// ============================================================================
// TIPOS
// ============================================================================

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
    const [role, setRole] = useState("");
    const [subscription, setSubscription] = useState("");

    // Cargar usuarios
    const fetchUsers = useCallback(async (pageParam = 1) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: pageParam.toString(),
                limit: "20",
            });

            if (search) queryParams.append("search", search);
            if (role) queryParams.append("role", role);
            if (subscription) queryParams.append("subscription", subscription);

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
    }, [search, role, subscription]);

    // Resetear a página 1 cuando cambian los filtros
    useEffect(() => {
        if (!authLoading && isAdmin) {
            fetchUsers(1);
        }
    }, [search, role, subscription, authLoading, isAdmin]); // Se ejecuta al cambiar filtros

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push("/perfil");
        }
        // fetchUsers() inicial se maneja en el efecto anterior o aquí si filtros vacíos, 
        // pero mejor dejar que el efecto de filtros se encargue.
        // Solo necesitamos cargar si es la primera vez y filtros están en default.
    }, [isAdmin, authLoading, router]);

    // Manejadores de acciones
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
                toast.success("Rol actualizado correctamente");
            }
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error("Error al actualizar rol");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) {
            return;
        }
        setActionLoading(userId);
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                setUsers(users.filter((u) => u.id !== userId));
                toast.success("Usuario eliminado correctamente");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Error al eliminar usuario");
        } finally {
            setActionLoading(null);
        }
    };

    const handleManageSubscription = async (userId: string, action: "assign" | "cancel") => {
        const confirmMessage = action === "assign"
            ? "¿Asignar suscripción premium a este usuario por 1 mes?"
            : "¿Cancelar la suscripción de este usuario?";

        if (!confirm(confirmMessage)) return;

        setActionLoading(userId);
        try {
            const method = action === "assign" ? "POST" : "DELETE";
            const res = await fetch(`${API_BASE}/admin/users/${userId}/subscription`, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (res.ok) {
                // Actualizar estado local
                setUsers(users.map((u) => {
                    if (u.id === userId) {
                        return {
                            ...u,
                            subscription: {
                                ...u.subscription,
                                status: action === "assign" ? "ACTIVE" : "CANCELLED"
                            }
                        };
                    }
                    return u;
                }));
                toast.success(action === "assign" ? "Suscripción asignada" : "Suscripción cancelada");
            } else {
                toast.error("Error al actualizar la suscripción");
            }
        } catch (error) {
            console.error("Error updating subscription:", error);
            toast.error("Error de conexión");
        } finally {
            setActionLoading(null);
        }
    };

    // Estados de carga
    if (authLoading || loading) {
        return <div className="state-loading">Cargando...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Gestión de Usuarios
                    </h1>
                    <p className="page-subtitle">
                        {meta.total} usuarios registrados
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <UserFilters
                search={search}
                role={role}
                subscription={subscription}
                onSearchChange={setSearch}
                onRoleChange={setRole}
                onSubscriptionChange={setSubscription}
            />

            {/* Grid de usuarios */}
            <UsersGrid
                users={users}
                actionLoading={actionLoading}
                onRoleChange={handleRoleChange}
                onDelete={handleDelete}
                onManageSubscription={handleManageSubscription}
            />

            {/* Paginación */}
            <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                onPageChange={(page) => fetchUsers(page)}
            />
        </div>
    );
}
