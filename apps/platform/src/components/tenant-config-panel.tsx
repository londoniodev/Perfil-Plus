"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Input,
    Label,
    Switch,
    Card,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@alvarosky/ui";
import {
    Info,
    DollarSign,
    Palette,
    Puzzle,
    Mail,
    Code
} from "lucide-react";

interface Props {
    tenantSlug: string;
    tenantDbName: string;
}

export function TenantConfigPanel({ tenantSlug, tenantDbName }: Props) {
    const [settings, setSettings] = useState<Record<string, unknown>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        setMessage(null);

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

            setMessage({ type: "success", text: "Configuración guardada correctamente" });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: "error", text: err instanceof Error ? err.message : "Error desconocido" });
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key: string, value: unknown) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 text-slate-400">
                <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cargando configuración...
            </div>
        );
    }

    return (
        <Card className="w-full max-w-5xl mx-auto">
            <div className="p-1">
                <Tabs defaultValue="info" className="w-full">
                    <div className="flex items-center justify-between px-6 py-4 border-b overflow-x-auto">
                        <TabsList>
                            <TabsTrigger value="info">
                                <Info className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Información</span>
                            </TabsTrigger>
                            <TabsTrigger value="finance">
                                <DollarSign className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Finanzas</span>
                            </TabsTrigger>
                            <TabsTrigger value="appearance">
                                <Palette className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Apariencia</span>
                            </TabsTrigger>
                            <TabsTrigger value="features">
                                <Puzzle className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Features</span>
                            </TabsTrigger>
                            <TabsTrigger value="email">
                                <Mail className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Email</span>
                            </TabsTrigger>
                            <TabsTrigger value="apis">
                                <Code className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">API's</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-6">
                        {message && (
                            <div className={`mb-4 p-3 rounded-lg text-sm border ${message.type === "success"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}>
                                {message.type === "success" ? "✓ " : "✗ "}{message.text}
                            </div>
                        )}

                        <TabsContent value="info" className="mt-0 space-y-4">
                            <div className="grid gap-4 max-w-2xl">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Nombre del Tenant</Label>
                                    <Input
                                        value={String(settings.tenant_name || "")}
                                        onChange={(e) => updateSetting("tenant_name", e.target.value)}
                                        className="bg-slate-800/50 border-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Slug</Label>
                                    <Input value={tenantSlug} disabled className="bg-slate-800/30 border-slate-700 text-slate-500" />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="finance" className="mt-0 space-y-6">
                            <div className="max-w-2xl space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Moneda</Label>
                                    <select
                                        value={String(settings.currency || "COP")}
                                        onChange={(e) => updateSetting("currency", e.target.value)}
                                        className="w-full p-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-indigo-500"
                                    >
                                        <option value="COP">COP - Peso Colombiano</option>
                                        <option value="USD">USD - Dólar Estadounidense</option>
                                    </select>
                                </div>
                                <div className="border-t border-slate-800 pt-4 space-y-4">
                                    <h4 className="text-sm font-medium text-slate-400">MercadoPago</h4>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Public Key</Label>
                                        <Input
                                            value={String(settings.mp_public_key || "")}
                                            onChange={(e) => updateSetting("mp_public_key", e.target.value)}
                                            className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Access Token</Label>
                                        <Input
                                            type="password"
                                            value={String(settings.mp_access_token || "")}
                                            onChange={(e) => updateSetting("mp_access_token", e.target.value)}
                                            className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                                            autoComplete="new-password"
                                            data-1p-ignore="true"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Webhook Secret</Label>
                                        <Input
                                            type="password"
                                            value={String(settings.mp_webhook_secret || "")}
                                            onChange={(e) => updateSetting("mp_webhook_secret", e.target.value)}
                                            className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Client ID</Label>
                                            <Input
                                                value={String(settings.mp_client_id || "")}
                                                onChange={(e) => updateSetting("mp_client_id", e.target.value)}
                                                className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Client Secret</Label>
                                            <Input
                                                type="password"
                                                value={String(settings.mp_client_secret || "")}
                                                onChange={(e) => updateSetting("mp_client_secret", e.target.value)}
                                                className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="appearance" className="mt-0 space-y-4">
                            <div className="max-w-2xl space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Tema</Label>
                                    <select
                                        value={String(settings.theme || "")}
                                        onChange={(e) => updateSetting("theme", e.target.value)}
                                        className="w-full p-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-indigo-500"
                                    >
                                        <option value="">Automático</option>
                                        <option value="light">Claro</option>
                                        <option value="dark">Oscuro</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Color Primario</Label>
                                    <div className="flex gap-3">
                                        <Input
                                            type="color"
                                            value={String(settings.primary_color || "#6366f1")}
                                            onChange={(e) => updateSetting("primary_color", e.target.value)}
                                            className="w-16 h-10 p-1 bg-slate-800/50 border-slate-700 cursor-pointer"
                                        />
                                        <Input
                                            value={String(settings.primary_color || "#6366f1")}
                                            onChange={(e) => updateSetting("primary_color", e.target.value)}
                                            className="flex-1 bg-slate-800/50 border-slate-700 font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="features" className="mt-0 space-y-4">
                            <div className="max-w-2xl space-y-3">
                                {[
                                    { key: "enable_blog", label: "Blog", desc: "Sistema de artículos" },
                                    { key: "enable_store", label: "Tienda", desc: "E-commerce" },
                                    { key: "enable_lms", label: "LMS", desc: "Cursos y lecciones" },
                                ].map((feature) => (
                                    <div key={feature.key} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                                        <div>
                                            <p className="text-sm font-medium text-white">{feature.label}</p>
                                            <p className="text-xs text-slate-500">{feature.desc}</p>
                                        </div>
                                        <Switch
                                            checked={Boolean(settings[feature.key])}
                                            onCheckedChange={(checked) => updateSetting(feature.key, checked)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="email" className="mt-0 space-y-4">
                            <div className="max-w-2xl space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Host</Label>
                                        <Input
                                            value={String(settings.smtp_host || "")}
                                            onChange={(e) => updateSetting("smtp_host", e.target.value)}
                                            className="bg-slate-800/50 border-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Puerto</Label>
                                        <Input
                                            type="number"
                                            value={String(settings.smtp_port || "587")}
                                            onChange={(e) => updateSetting("smtp_port", parseInt(e.target.value) || 587)}
                                            className="bg-slate-800/50 border-slate-700"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                                    <span className="text-sm font-medium text-white">SSL/TLS</span>
                                    <Switch
                                        checked={Boolean(settings.smtp_secure)}
                                        onCheckedChange={(checked) => updateSetting("smtp_secure", checked)}
                                    />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Usuario</Label>
                                        <Input
                                            value={String(settings.smtp_user || "")}
                                            onChange={(e) => updateSetting("smtp_user", e.target.value)}
                                            className="bg-slate-800/50 border-slate-700"
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Password</Label>
                                        <Input
                                            type="password"
                                            value={String(settings.smtp_pass || "")}
                                            onChange={(e) => updateSetting("smtp_pass", e.target.value)}
                                            className="bg-slate-800/50 border-slate-700"
                                            autoComplete="new-password"
                                            data-1p-ignore="true"
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="apis" className="mt-0 space-y-4">
                            <div className="max-w-2xl space-y-2">
                                <Label className="text-slate-300">OpenAI API Key</Label>
                                <Input
                                    type="password"
                                    value={String(settings.api_key_openai || "")}
                                    onChange={(e) => updateSetting("api_key_openai", e.target.value)}
                                    className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                                    autoComplete="new-password"
                                    data-1p-ignore="true"
                                />
                            </div>
                        </TabsContent>

                        <div className="mt-6 pt-6 border-t border-slate-800/50 flex justify-end">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 w-full sm:w-auto"
                            >
                                {saving ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </div>
                </Tabs>
            </div>
        </Card>
    );
}
