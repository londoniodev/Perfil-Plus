"use client";

import { useState, useEffect } from "react";
import { Button, Input, Label, Switch } from "@alvarosky/ui";

interface Props {
    tenantSlug: string;
    tenantDbName: string;
}

// Schema definition for settings - can be extended easily
const settingsSchema = {
    theme: { type: "select", label: "Tema", options: ["light", "dark"] },
    primary_color: { type: "color", label: "Color Primario" },
    currency: { type: "text", label: "Moneda" },
    enable_blog: { type: "boolean", label: "Habilitar Blog" },
    enable_store: { type: "boolean", label: "Habilitar Tienda" },
    enable_lms: { type: "boolean", label: "Habilitar LMS" },
    api_key_openai: { type: "password", label: "API Key OpenAI" },
    smtp_host: { type: "text", label: "SMTP Host" },
    smtp_user: { type: "text", label: "SMTP Usuario" },
    smtp_pass: { type: "password", label: "SMTP Password" },
} as const;

type SettingsKey = keyof typeof settingsSchema;

export function TenantSettingsEditor({ tenantSlug, tenantDbName }: Props) {
    const [settings, setSettings] = useState<Record<string, unknown>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, [tenantSlug]);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`/api/tenants/${tenantSlug}/settings`);
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch(`/api/tenants/${tenantSlug}/settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings, dbName: tenantDbName }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al guardar");
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key: string, value: unknown) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return <div className="text-muted-foreground">Cargando configuración...</div>;
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-500/10 text-green-500 p-3 rounded-md text-sm">
                    ✓ Configuración guardada
                </div>
            )}

            <div className="grid gap-4">
                {(Object.keys(settingsSchema) as SettingsKey[]).map((key) => {
                    const schema = settingsSchema[key];
                    const value = settings[key];

                    return (
                        <div key={key} className="space-y-1">
                            <Label htmlFor={key}>{schema.label}</Label>

                            {schema.type === "boolean" ? (
                                <Switch
                                    id={key}
                                    checked={Boolean(value)}
                                    onCheckedChange={(checked) => updateSetting(key, checked)}
                                />
                            ) : schema.type === "select" ? (
                                <select
                                    id={key}
                                    value={String(value || "")}
                                    onChange={(e) => updateSetting(key, e.target.value)}
                                    className="w-full p-2 rounded-md border bg-background"
                                >
                                    <option value="">Seleccionar...</option>
                                    {schema.options.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            ) : schema.type === "color" ? (
                                <div className="flex gap-2">
                                    <Input
                                        id={key}
                                        type="color"
                                        value={String(value || "#000000")}
                                        onChange={(e) => updateSetting(key, e.target.value)}
                                        className="w-16 h-10 p-1"
                                    />
                                    <Input
                                        value={String(value || "")}
                                        onChange={(e) => updateSetting(key, e.target.value)}
                                        placeholder="#000000"
                                        className="flex-1"
                                    />
                                </div>
                            ) : (
                                <Input
                                    id={key}
                                    type={schema.type === "password" ? "password" : "text"}
                                    value={String(value || "")}
                                    onChange={(e) => updateSetting(key, e.target.value)}
                                    placeholder={`Ingresa ${schema.label.toLowerCase()}`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? "Guardando..." : "Guardar Configuración"}
            </Button>
        </div>
    );
}
