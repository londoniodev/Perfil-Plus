"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/config";

interface User {
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

export default function AdminUsuariosPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = useCallback(async (page = 1) => {
        try {
            const res = await fetch(`${API_BASE}/admin/users?page=${page}&limit=20`, {
                credentials: 'include',
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

    const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
        setActionLoading(userId);
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ role: newRole }),
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
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
                credentials: 'include',
            });
            if (res.ok) {
                setUsers(users.filter(u => u.id !== userId));
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        } finally {
            setActionLoading(null);
        }
    };

    if (authLoading || loading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem"
            }}>
                <div>
                    <h1 style={{
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        color: "var(--foreground)",
                        marginBottom: "0.25rem"
                    }}>
                        Gestión de Usuarios
                    </h1>
                    <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>
                        {meta.total} usuarios registrados
                    </p>
                </div>
            </div>

            {/* Users Table */}
            <div style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "1rem",
                overflow: "hidden"
            }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.9rem"
                    }}>
                        <thead>
                            <tr style={{
                                background: "rgba(255,255,255,0.02)",
                                borderBottom: "1px solid var(--border)"
                            }}>
                                <th style={thStyle}>Usuario</th>
                                <th style={thStyle}>Email</th>
                                <th style={thStyle}>Rol</th>
                                <th style={thStyle}>Verificado</th>
                                <th style={thStyle}>Suscripción</th>
                                <th style={thStyle}>Registro</th>
                                <th style={thStyle}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={tdStyle}>
                                        <span style={{ fontWeight: 500, color: "var(--foreground)" }}>
                                            {user.name || "Sin nombre"}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ color: "var(--foreground-muted)" }}>
                                            {user.email}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as "USER" | "ADMIN")}
                                            disabled={actionLoading === user.id}
                                            style={{
                                                background: user.role === "ADMIN"
                                                    ? "rgba(232, 168, 56, 0.15)"
                                                    : "rgba(91, 141, 239, 0.1)",
                                                color: user.role === "ADMIN"
                                                    ? "var(--accent)"
                                                    : "var(--primary-light)",
                                                border: "none",
                                                padding: "0.35rem 0.75rem",
                                                borderRadius: "999px",
                                                fontSize: "0.8rem",
                                                fontWeight: 600,
                                                cursor: "pointer"
                                            }}
                                        >
                                            <option value="USER">USER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            color: user.emailVerified ? "var(--success)" : "var(--foreground-muted)",
                                            fontSize: "0.85rem"
                                        }}>
                                            {user.emailVerified ? "✓ Sí" : "No"}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            background: user.subscription?.status === "ACTIVE"
                                                ? "rgba(74, 222, 128, 0.1)"
                                                : "rgba(255,255,255,0.05)",
                                            color: user.subscription?.status === "ACTIVE"
                                                ? "var(--success)"
                                                : "var(--foreground-muted)",
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: "4px",
                                            fontSize: "0.75rem"
                                        }}>
                                            {user.subscription?.status || "Sin suscripción"}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ color: "var(--foreground-muted)", fontSize: "0.85rem" }}>
                                            {new Date(user.createdAt).toLocaleDateString("es-CO")}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            disabled={actionLoading === user.id}
                                            style={{
                                                background: "rgba(239, 68, 68, 0.1)",
                                                color: "#ef4444",
                                                border: "none",
                                                padding: "0.35rem 0.75rem",
                                                borderRadius: "0.5rem",
                                                fontSize: "0.8rem",
                                                cursor: "pointer",
                                                opacity: actionLoading === user.id ? 0.5 : 1
                                            }}
                                        >
                                            {actionLoading === user.id ? "..." : "Eliminar"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div style={{
                        padding: "1rem",
                        display: "flex",
                        justifyContent: "center",
                        gap: "0.5rem",
                        borderTop: "1px solid var(--border)"
                    }}>
                        {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => fetchUsers(page)}
                                style={{
                                    background: meta.page === page ? "var(--primary)" : "transparent",
                                    color: meta.page === page ? "white" : "var(--foreground-muted)",
                                    border: "1px solid var(--border)",
                                    padding: "0.5rem 0.75rem",
                                    borderRadius: "0.5rem",
                                    cursor: "pointer"
                                }}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const thStyle: React.CSSProperties = {
    padding: "1rem",
    textAlign: "left",
    fontWeight: 600,
    color: "var(--foreground-muted)",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.05rem"
};

const tdStyle: React.CSSProperties = {
    padding: "1rem",
    verticalAlign: "middle"
};
