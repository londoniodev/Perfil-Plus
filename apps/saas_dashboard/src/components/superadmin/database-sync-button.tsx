"use client";

import { useState } from "react";
import { Button } from "@alvarosky/ui";

interface Props {
    tenantSlug: string;
}

export function DatabaseSyncButton({ tenantSlug }: Props) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const handleSync = async () => {
        if (!confirm("¿Estás seguro de sincronizar el schema? Esto puede modificar la estructura de la base de datos.")) {
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch(`/api/tenants/${tenantSlug}/migrate`, {
                method: "POST",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.details || data.error || "Error desconocido");
            }

            setResult({
                type: "success",
                message: data.message || "Schema sincronizado correctamente",
            });
        } catch (err) {
            setResult({
                type: "error",
                message: err instanceof Error ? err.message : "Error al sincronizar",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <Button
                onClick={handleSync}
                disabled={loading}
                variant="outline"
                className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500"
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sincronizando...
                    </span>
                ) : (
                    <>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Sincronizar Schema (Push)
                    </>
                )}
            </Button>

            {result && (
                <div
                    className={`p-3 rounded-lg text-sm ${result.type === "success"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                >
                    {result.type === "success" ? "✓ " : "✗ "}
                    {result.message}
                </div>
            )}
        </div>
    );
}
