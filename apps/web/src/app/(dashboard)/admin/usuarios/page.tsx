"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/config";
import UsersTable, { User } from "@/app/components/admin/UsersTable";
import Pagination from "@/app/components/ui/Pagination";

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

    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Cargar usuarios
    const fetchUsers = useCallback(async (page = 1) => {
        try {
            const res = await fetch(`${API_BASE}/admin/users?page=${page}&limit=20`, {
                credentials: "include",
            });
            if (res.ok) {
                const data: UsersResponse = await res.json();
                setUsers(data.data);
                setMeta(data.meta);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push("/perfil");
        } else if (!authLoading) {
            fetchUsers();
        }
    }, [isAdmin, authLoading, router, fetchUsers]);

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
            }
        } catch (error) {
            console.error("Error updating role:", error);
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
            }
        } catch (error) {
            console.error("Error deleting user:", error);
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
            } else {
                alert("Error al actualizar la suscripción");
            }
        } catch (error) {
            console.error("Error updating subscription:", error);
            alert("Error de conexión");
        } finally {
            setActionLoading(null);
        }
    };

    // Estados de carga
    if (authLoading || loading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
            }}>
                <div>
                    <h1 style={{
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        color: "var(--foreground)",
                        marginBottom: "0.25rem",
                    }}>
                        Gestión de Usuarios
                    </h1>
                    <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>
                        {meta.total} usuarios registrados
                    </p>
                </div>
            </div>

            {/* Tabla de usuarios */}
            <UsersTable
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
