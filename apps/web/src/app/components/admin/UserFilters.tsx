"use client";

import React, { useState, useEffect } from "react";
import { IconChevronDown } from "@/app/components/icons";

interface UserFiltersProps {
    search: string;
    role: string;
    subscription: string;
    onSearchChange: (value: string) => void;
    onRoleChange: (value: string) => void;
    onSubscriptionChange: (value: string) => void;
}

export default function UserFilters({
    search,
    role,
    subscription,
    onSearchChange,
    onRoleChange,
    onSubscriptionChange,
}: UserFiltersProps) {
    // Debounce para la búsqueda
    const [localSearch, setLocalSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== search) {
                onSearchChange(localSearch);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localSearch, search, onSearchChange]);

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
        }}>
            {/* Buscador */}
            <div style={{ position: "relative" }}>
                <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        paddingLeft: "2.5rem",
                        background: "var(--card-bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem",
                        color: "var(--foreground)",
                        fontSize: "0.9rem",
                        outline: "none",
                    }}
                />
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                        position: "absolute",
                        left: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--foreground-muted)",
                        pointerEvents: "none",
                    }}
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            </div>

            {/* Filtros Dropdown */}
            <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <select
                        value={role}
                        onChange={(e) => onRoleChange(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            appearance: "none",
                            background: "var(--card-bg)",
                            border: "1px solid var(--border)",
                            borderRadius: "0.5rem",
                            color: "var(--foreground)",
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            outline: "none",
                        }}
                    >
                        <option value="">Todos los Roles</option>
                        <option value="USER">Usuarios</option>
                        <option value="ADMIN">Administradores</option>
                    </select>
                    <IconChevronDown className="dropdown-icon" />
                </div>

                <div style={{ position: "relative", flex: 1 }}>
                    <select
                        value={subscription}
                        onChange={(e) => onSubscriptionChange(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            appearance: "none",
                            background: "var(--card-bg)",
                            border: "1px solid var(--border)",
                            borderRadius: "0.5rem",
                            color: "var(--foreground)",
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            outline: "none",
                        }}
                    >
                        <option value="">Todas las Suscripciones</option>
                        <option value="active">Activas</option>
                        <option value="inactive">Inactivas</option>
                    </select>
                    <IconChevronDown className="dropdown-icon" />
                </div>
            </div>

            <style jsx>{`
                .dropdown-icon {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                    color: var(--foreground-muted);
                    width: 16px;
                    height: 16px;
                }
            `}</style>
        </div>
    );
}
