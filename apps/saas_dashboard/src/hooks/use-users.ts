"use client";

import { useState, useCallback, useEffect } from "react";
import { useToast } from "@alvarosky/ui";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { User } from "@/components/users/columns";

interface UsersResponse {
    data: User[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export function useUsers(isAdmin: boolean, authLoading: boolean) {
    const toast = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                limit: "100",
            });

            const res = await fetch(`${API_BASE}/admin/users?${queryParams.toString()}`, {
                headers: { "x-tenant-id": TENANT_ID },
                credentials: "include",
                signal // REACT DOCTOR: Prevents race conditions and memory leaks
            });

            if (res.ok) {
                const data: UsersResponse = await res.json();
                setUsers(data.data);
                setMeta(data.meta);
            }
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Fetch aborted");
            } else {
                console.error("Error fetching users:", error);
                toast.error("Error al cargar usuarios");
            }
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (authLoading || !isAdmin) return;

        const controller = new AbortController();
        fetchUsers(controller.signal);

        return () => {
            controller.abort();
        };
    }, [fetchUsers, authLoading, isAdmin]);

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
                setUsers((current) => current.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
                toast.success(`Rol cambiado a ${newRole === "ADMIN" ? "Administrador" : "Usuario"}`);
                return true;
            } else {
                toast.error("Error al actualizar rol");
            }
        } catch {
            toast.error("Error al actualizar rol");
        } finally {
            setActionLoading(null);
        }
        return false;
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("¿Eliminar usuario irreversiblemente?")) return false;
        setActionLoading(userId);
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
                method: "DELETE",
                headers: { "x-tenant-id": TENANT_ID },
                credentials: "include",
            });
            if (res.ok) {
                setUsers((current) => current.filter((u) => u.id !== userId));
                toast.success("Usuario eliminado");
                return true;
            } else {
                toast.error("Error al eliminar");
            }
        } catch {
            toast.error("Error al eliminar");
        } finally {
            setActionLoading(null);
        }
        return false;
    };

    const handleSubscriptionChange = async (userId: string, action: "assign" | "cancel", days?: number) => {
        if (action === "cancel" && !confirm("¿Cancelar Premium?")) return false;
        setActionLoading(userId);
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}/subscription`, {
                method: action === "assign" ? "POST" : "DELETE",
                headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
                credentials: "include",
                body: action === "assign" ? JSON.stringify({ days: days ?? 30 }) : undefined,
            });
            if (res.ok) {
                setUsers((current) =>
                    current.map((u) => {
                        if (u.id === userId) {
                            return {
                                ...u,
                                subscription: { status: action === "assign" ? "ACTIVE" : "CANCELLED" },
                            };
                        }
                        return u;
                    })
                );
                toast.success(action === "assign" ? "Premium asignado" : "Premium cancelado");
                return true;
            } else {
                toast.error("Error en suscripción");
            }
        } catch {
            toast.error("Error en suscripción");
        } finally {
            setActionLoading(null);
        }
        return false;
    };

    return {
        users,
        meta,
        loading,
        actionLoading,
        handleRoleChange,
        handleDelete,
        handleSubscriptionChange,
        refresh: fetchUsers
    };
}
