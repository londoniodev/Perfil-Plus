"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Input,
    Label,
    Switch,
    Alert,
    AlertDescription,
    AlertTitle,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@alvarosky/ui";
import { Info, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

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
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="animate-spin h-6 w-6 mr-2" />
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
                    <Label htmlFor={key} className="cursor-pointer">
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
                <div className="space-y-2">
                    <Label htmlFor={key}>{schema.label}</Label>
                    <Select
                        value={String(value || "")}
                        onValueChange={(val) => updateSetting(key, val)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                            {schema.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );
        }

        if (schema.type === "color") {
            return (
                <div className="space-y-2">
                    <Label htmlFor={key}>{schema.label}</Label>
                    <div className="flex gap-2">
                        <Input
                            id={key}
                            type="color"
                            value={String(value || "#000000")}
                            onChange={(e) => updateSetting(key, e.target.value)}
                            className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                            value={String(value || "")}
                            onChange={(e) => updateSetting(key, e.target.value)}
                            placeholder="#000000"
                            className="flex-1 font-mono"
                            autoComplete="off"
                        />
                    </div>
                </div>
            );
        }

        if (schema.type === "number") {
            return (
                <div className="space-y-2">
                    <Label htmlFor={key}>{schema.label}</Label>
                    <Input
                        id={key}
                        type="number"
                        value={String(value || "")}
                        onChange={(e) => updateSetting(key, parseInt(e.target.value) || 0)}
                        autoComplete="off"
                    />
                </div>
            );
        }

        // text or secret
        return (
            <div className="space-y-2">
                <Label htmlFor={key}>{schema.label}</Label>
                <Input
                    id={key}
                    type={schema.type === "secret" ? "password" : "text"}
                    value={String(value || "")}
                    onChange={(e) => updateSetting(key, e.target.value)}
                    placeholder={`Ingresa ${schema.label.toLowerCase()}`}
                    className="font-mono text-sm"
                    autoComplete="new-password"
                    data-1p-ignore="true"
                    data-lpignore="true"
                />
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Formulario oculto para evitar autocomplete */}
            <form style={{ display: "none" }} autoComplete="off">
                <input type="text" name="fakeusernameremembered" />
                <input type="password" name="fakepasswordremembered" />
            </form>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Configuración del Tenant</h2>
                    <p className="text-muted-foreground">Administra las variables de entorno y características.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    {saving ? (
                        <>
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Guardando...
                        </>
                    ) : (
                        "Guardar Cambios"
                    )}
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="border-emerald-500/50 text-emerald-500 bg-emerald-500/10">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Éxito</AlertTitle>
                    <AlertDescription>La configuración se ha guardado correctamente.</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6">
                {sections.map((section) => {
                    const sectionKeys = (Object.keys(settingsSchema) as SettingsKey[]).filter(
                        (k) => settingsSchema[k].section === section.key
                    );

                    if (sectionKeys.length === 0) return null;

                    return (
                        <Card key={section.key}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <span>{section.icon}</span>
                                    {section.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {sectionKeys.map((key) => (
                                    <div key={key}>{renderField(key)}</div>
                                ))}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
