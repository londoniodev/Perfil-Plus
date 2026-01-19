"use client";

import React, { useState, useEffect } from "react";
import { IconChevronDown } from "@alvarosky/ui";
import { IconSearch } from "@alvarosky/ui";
import styles from "@/styles/admin.module.css";

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
        <div className={styles.filtersContainer}>
            {/* Buscador */}
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className={styles.searchInput}
                />
                <IconSearch className={styles.searchIcon} />
            </div>

            {/* Filtros Dropdown */}
            <div className={styles.filtersRow}>
                <div className={styles.selectWrapper}>
                    <select
                        value={role}
                        onChange={(e) => onRoleChange(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Todos los Roles</option>
                        <option value="USER">Usuarios</option>
                        <option value="ADMIN">Administradores</option>
                    </select>
                    <IconChevronDown className={styles.selectIcon} />
                </div>

                <div className={styles.selectWrapper}>
                    <select
                        value={subscription}
                        onChange={(e) => onSubscriptionChange(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Todas las Suscripciones</option>
                        <option value="active">Activas</option>
                        <option value="inactive">Inactivas</option>
                    </select>
                    <IconChevronDown className={styles.selectIcon} />
                </div>
            </div>
        </div>
    );
}

