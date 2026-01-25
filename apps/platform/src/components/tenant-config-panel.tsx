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

// Icons as components
const InfoIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const FinanceIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const AppearanceIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
    </svg>
);

const FeaturesIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
    </svg>
);

const EmailIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
);

const ApiIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
);

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
                                <InfoIcon /> <span className="hidden sm:inline">Información</span>
                            </TabsTrigger>
                            <TabsTrigger value="finance">
                                <FinanceIcon /> <span className="hidden sm:inline">Finanzas</span>
                            </TabsTrigger>
                            <TabsTrigger value="appearance">
                                <AppearanceIcon /> <span className="hidden sm:inline">Apariencia</span>
                            </TabsTrigger>
                            <TabsTrigger value="features">
                                <FeaturesIcon /> <span className="hidden sm:inline">Features</span>
                            </TabsTrigger>
                            <TabsTrigger value="email">
                                <EmailIcon /> <span className="hidden sm:inline">Email</span>
                            </TabsTrigger>
                            <TabsTrigger value="apis">
                                <ApiIcon /> <span className="hidden sm:inline">API's</span>
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
