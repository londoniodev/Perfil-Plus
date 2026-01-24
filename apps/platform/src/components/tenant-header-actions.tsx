"use client";

import { useState } from "react";
import { Button } from "@alvarosky/ui";

const SyncIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

interface Props {
    tenantSlug: string;
}

export function TenantHeaderActions({ tenantSlug }: Props) {
    const [syncing, setSyncing] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSync = async () => {
        if (!confirm("¿Sincronizar schema? Esto puede modificar la estructura de la base de datos.")) {
            return;
        }

        setSyncing(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/tenants/${tenantSlug}/migrate`, { method: "POST" });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.details || data.error || "Error");
            }

            setMessage({ type: "success", text: "Schema sincronizado" });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: "error", text: err instanceof Error ? err.message : "Error" });
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            {message && (
                <div
                    className={`text-xs px-3 py-1.5 rounded-full ${message.type === "success"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                >
                    {message.type === "success" ? "✓ " : "✗ "}
                    {message.text}
                </div>
            )}
            <Button
                size="sm"
                variant="outline"
                onClick={handleSync}
                disabled={syncing}
                className="h-9 gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                title="Sincronizar Schema de Base de Datos"
            >
                <span className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}>
                    <SyncIcon />
                </span>
                <span className="hidden sm:inline">Sincronizar Schema</span>
            </Button>
        </div>
    );
}
