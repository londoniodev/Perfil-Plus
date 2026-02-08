"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_BASE, TENANT_ID } from "@/lib/config";
import {
    useToast,
    AdminPageWrapper,
    Input,
    Tabs,
    TabsList,
    TabsTrigger,
    Badge,
    UsersTable,
    UsersGrid
} from "@alvarosky/ui";
import { Search } from "lucide-react";
import { createUserColumns, User, UserTableActions } from "@/components/users/columns";

// ============================================================================
// TYPES
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
// TOOLBAR COMPONENT
// ============================================================================

interface UsersToolbarProps {
    data: User[];
    activeTab: string;
    setActiveTab: (tab: string) => void;
    globalFilter: string;
    setGlobalFilter: (filter: string) => void;
}

function UsersToolbar({
    data,
    activeTab,
    setActiveTab,
    globalFilter,
    setGlobalFilter,
}: UsersToolbarProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted/50">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">
                        Todos
                        <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                            {data.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="admins" className="text-xs sm:text-sm">
                        Admins
                    </TabsTrigger>
                    <TabsTrigger value="premium" className="text-xs sm:text-sm">
                        Premium
                    </TabsTrigger>
                    <TabsTrigger value="free" className="text-xs sm:text-sm">
                        Gratis
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre o email..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-8"
                />
            </div>
        </div>
    );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AdminUsersPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const toast = useToast();

    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Filter state
    const [activeTab, setActiveTab] = useState("all");
    const [globalFilter, setGlobalFilter] = useState("");

    // ========================================================================
    // DATA FETCHING
    // ========================================================================

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                limit: "100",
            });

            const res = await fetch(`${API_BASE}/admin/users?${queryParams.toString()}`, {
                headers: { "x-tenant-id": TENANT_ID },
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
    }, [toast]);

    useEffect(() => {
        if (!authLoading && isAdmin) {
            fetchUsers();
        }
    }, [fetchUsers, authLoading, isAdmin]);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push("/perfil");
        }
    }, [isAdmin, authLoading, router]);

    // ========================================================================
    // FILTER DATA BY TAB
    // ========================================================================

    const filteredData = useMemo(() => {
        let filtered = users;

        // Apply tab filter
        switch (activeTab) {
            case "admins":
                filtered = filtered.filter((u) => u.role === "ADMIN");
                break;
            case "premium":
                filtered = filtered.filter((u) => u.subscription?.status === "ACTIVE");
                break;
            case "free":
                filtered = filtered.filter((u) => u.subscription?.status !== "ACTIVE");
                break;
        }

        // Apply global filter (name or email)
        if (globalFilter) {
            const lowerFilter = globalFilter.toLowerCase();
            filtered = filtered.filter(
                (u) =>
                    u.name?.toLowerCase().includes(lowerFilter) ||
                    u.email?.toLowerCase().includes(lowerFilter)
            );
        }

        return filtered;
    }, [users, activeTab, globalFilter]);

    // ========================================================================
    // ACTION HANDLERS
    // ========================================================================

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
                toast.success(`Rol cambiado a ${newRole === "ADMIN" ? "Administrador" : "Usuario"}`);
            } else {
                toast.error("Error al actualizar rol");
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
                headers: { "x-tenant-id": TENANT_ID },
                credentials: "include",
            });
            if (res.ok) {
                setUsers(users.filter((u) => u.id !== userId));
                toast.success("Usuario eliminado");
            } else {
                toast.error("Error al eliminar");
            }
        } catch {
            toast.error("Error al eliminar");
        } finally {
            setActionLoading(null);
        }
    };

    const handleSubscriptionChange = async (userId: string, action: "assign" | "cancel") => {
        if (!confirm(action === "assign" ? "¿Asignar Premium?" : "¿Cancelar Premium?")) return;
        setActionLoading(userId);
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}/subscription`, {
                method: action === "assign" ? "POST" : "DELETE",
                headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
                credentials: "include",
            });
            if (res.ok) {
                setUsers(
                    users.map((u) => {
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
            } else {
                toast.error("Error en suscripción");
            }
        } catch {
            toast.error("Error en suscripción");
        } finally {
            setActionLoading(null);
        }
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-muted-foreground">Cargando...</div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <AdminPageWrapper
            title="Gestión de Usuarios"
            description={`${meta.total} usuarios registrados en la plataforma`}
        >
            <div className="space-y-6">
                <UsersToolbar
                    data={users}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                />

                {/* Data View (Table Only for all devices) */}
                <div className="overflow-x-auto rounded-md border">
                    <UsersTable
                        users={filteredData as any}
                        actionLoading={actionLoading}
                        onRoleChange={handleRoleChange}
                        onDelete={handleDelete}
                        onManageSubscription={handleSubscriptionChange}
                    />
                </div>
            </div>
        </AdminPageWrapper>
    );
}
