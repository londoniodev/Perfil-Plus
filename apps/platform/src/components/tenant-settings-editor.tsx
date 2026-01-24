"use client";

import { useState, useEffect } from "react";
import { Button, Input, Label, Switch } from "@alvarosky/ui";

interface Props {
    tenantSlug: string;
    tenantDbName: string;
}

// Schema definition for settings - matches flattened TENANT_CONFIG
const settingsSchema = {
    theme: { type: "select", label: "Tema", options: ["light", "dark"], section: "appearance" },
    primary_color: { type: "color", label: "Color Primario", section: "appearance" },
    currency: { type: "select", label: "Moneda", options: ["COP", "USD", "MXN", "EUR"], section: "general" },

    enable_blog: { type: "boolean", label: "Habilitar Blog", section: "features" },
    enable_store: { type: "boolean", label: "Habilitar Tienda", section: "features" },
    enable_lms: { type: "boolean", label: "Habilitar LMS", section: "features" },

    api_key_openai: { type: "secret", label: "API Key OpenAI", section: "apis" },

    mp_public_key: { type: "text", label: "MercadoPago Public Key", section: "payments" },
    mp_access_token: { type: "secret", label: "MercadoPago Access Token", section: "payments" },
    mp_webhook_secret: { type: "secret", label: "Webhook Secret", section: "payments" },
    mp_client_id: { type: "text", label: "Client ID", section: "payments" },
    mp_client_secret: { type: "secret", label: "Client Secret", section: "payments" },

    smtp_host: { type: "text", label: "SMTP Host", section: "email" },
    smtp_port: { type: "number", label: "SMTP Puerto", section: "email" },
    smtp_secure: { type: "boolean", label: "SMTP Seguro (SSL)", section: "email" },
    smtp_user: { type: "text", label: "SMTP Usuario", section: "email" },
    smtp_pass: { type: "secret", label: "SMTP Password", section: "email" },
} as const;

type SettingsKey = keyof typeof settingsSchema;

const sections = [
    { key: "general", label: "General", icon: "⚙️" },
    { key: "appearance", label: "Apariencia", icon: "🎨" },
    { key: "features", label: "Features", icon: "🧩" },
    { key: "payments", label: "Pagos", icon: "💳" },
    { key: "email", label: "Email/SMTP", icon: "📧" },
    { key: "apis", label: "APIs Externas", icon: "🔌" },
];

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
        return (
            <div className="flex items-center gap-2 text-slate-400">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cargando configuración...
            </div>
        );
    }

    const renderField = (key: SettingsKey) => {
        const schema = settingsSchema[key];
        const value = settings[key];

        if (schema.type === "boolean") {
            return (
                <div className="flex items-center justify-between py-2">
                    <Label htmlFor={key} className="text-slate-300 cursor-pointer">
                        {schema.label}
                    </Label>
                    <Switch
                        id={key}
                        checked={Boolean(value)}
                        onCheckedChange={(checked) => updateSetting(key, checked)}
                    />
                </div>
            );
        }

        if (schema.type === "select") {
            return (
                <div className="space-y-1">
                    <Label htmlFor={key} className="text-slate-300">{schema.label}</Label>
                    <select
                        id={key}
                        value={String(value || "")}
                        onChange={(e) => updateSetting(key, e.target.value)}
                        className="w-full p-2 rounded-md bg-slate-800/50 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                    >
                        <option value="">Seleccionar...</option>
                        {schema.options.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        if (schema.type === "color") {
            return (
                <div className="space-y-1">
                    <Label htmlFor={key} className="text-slate-300">{schema.label}</Label>
                    <div className="flex gap-2">
                        <Input
                            id={key}
                            type="color"
                            value={String(value || "#000000")}
                            onChange={(e) => updateSetting(key, e.target.value)}
                            className="w-16 h-10 p-1 bg-slate-800/50 border-slate-700"
                        />
                        <Input
                            value={String(value || "")}
                            onChange={(e) => updateSetting(key, e.target.value)}
                            placeholder="#000000"
                            className="flex-1 bg-slate-800/50 border-slate-700"
                            autoComplete="off"
                        />
                    </div>
                </div>
            );
        }

        if (schema.type === "number") {
            return (
                <div className="space-y-1">
                    <Label htmlFor={key} className="text-slate-300">{schema.label}</Label>
                    <Input
                        id={key}
                        type="number"
                        value={String(value || "")}
                        onChange={(e) => updateSetting(key, parseInt(e.target.value) || 0)}
                        className="bg-slate-800/50 border-slate-700"
                        autoComplete="off"
                    />
                </div>
            );
        }

        // text or secret
        return (
            <div className="space-y-1">
                <Label htmlFor={key} className="text-slate-300">{schema.label}</Label>
                <Input
                    id={key}
                    type={schema.type === "secret" ? "password" : "text"}
                    value={String(value || "")}
                    onChange={(e) => updateSetting(key, e.target.value)}
                    placeholder={`Ingresa ${schema.label.toLowerCase()}`}
                    className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                    autoComplete="new-password"
                    data-1p-ignore="true"
                    data-lpignore="true"
                />
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Formulario oculto para evitar autocomplete */}
            <form style={{ display: "none" }} autoComplete="off">
                <input type="text" name="fakeusernameremembered" />
                <input type="password" name="fakepasswordremembered" />
            </form>

            {error && (
                <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-lg text-sm border border-emerald-500/20">
                    ✓ Configuración guardada correctamente
                </div>
            )}

            {sections.map((section) => {
                const sectionKeys = (Object.keys(settingsSchema) as SettingsKey[]).filter(
                    (k) => settingsSchema[k].section === section.key
                );

                if (sectionKeys.length === 0) return null;

                return (
                    <div key={section.key} className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide flex items-center gap-2">
                            <span>{section.icon}</span>
                            {section.label}
                        </h4>
                        <div className="grid gap-3 pl-6 border-l-2 border-slate-800">
                            {sectionKeys.map((key) => (
                                <div key={key}>{renderField(key)}</div>
                            ))}
                        </div>
                    </div>
                );
            })}

            <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
            >
                {saving ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Guardando...
                    </span>
                ) : (
                    "Guardar Configuración"
                )}
            </Button>
        </div>
    );
}
