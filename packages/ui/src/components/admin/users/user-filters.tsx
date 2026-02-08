"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "../../../lib/utils";

interface UserFiltersProps {
    search: string;
    role: string;
    subscription: string;
    onSearchChange: (value: string) => void;
    onRoleChange: (value: string) => void;
    onSubscriptionChange: (value: string) => void;
    className?: string;
}

export function UserFilters({
    search,
    role,
    subscription,
    onSearchChange,
    onRoleChange,
    onSubscriptionChange,
    className
}: UserFiltersProps) {
    // Debounce for search
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
        <div className={cn("flex flex-col gap-4 md:flex-row md:items-center", className)}>
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
                <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className={cn(
                        "h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Filters Dropdown */}
            <div className="flex items-center gap-2">
                <div className="relative">
                    <select
                        value={role}
                        onChange={(e) => onRoleChange(e.target.value)}
                        className={cn(
                            "h-10 appearance-none rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            "w-[160px]"
                        )}
                    >
                        <option value="">Todos los Roles</option>
                        <option value="USER">Usuarios</option>
                        <option value="ADMIN">Administradores</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                <div className="relative">
                    <select
                        value={subscription}
                        onChange={(e) => onSubscriptionChange(e.target.value)}
                        className={cn(
                            "h-10 appearance-none rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            "w-[180px]"
                        )}
                    >
                        <option value="">Todas las Suscripciones</option>
                        <option value="active">Activas</option>
                        <option value="inactive">Inactivas</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
