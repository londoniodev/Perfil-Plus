"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, redirect } from "next/navigation";
import { API_BASE, TENANT_ID } from "@/lib/config";
import {
    AdminPageWrapper,
    Input,
    Tabs,
    TabsList,
    TabsTrigger,
    Badge,
    UsersTable
} from "@alvarosky/ui";
import { Search } from "lucide-react";
import { useUsers } from "@/hooks";
import { User } from "@/components/users/columns";


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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="bg-muted/50 rounded-full p-1 flex overflow-x-auto w-full no-scrollbar">
                    <TabsTrigger value="all" className="text-xs sm:text-sm rounded-full">
                        Todos
                        <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs rounded-full">
                            {data.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="admins" className="text-xs sm:text-sm rounded-full">
                        Admins
                    </TabsTrigger>
                    <TabsTrigger value="premium" className="text-xs sm:text-sm rounded-full">
                        Premium
                    </TabsTrigger>
                    <TabsTrigger value="free" className="text-xs sm:text-sm rounded-full">
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

    const {
        users,
        meta,
        loading,
        actionLoading,
        handleRoleChange,
        handleDelete,
        handleSubscriptionChange
    } = useUsers(isAdmin, authLoading);

    // Filter state
    const [activeTab, setActiveTab] = useState("all");
    const [globalFilter, setGlobalFilter] = useState("");


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

                {/* Desktop Table */}
                <div className="overflow-x-auto">
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
