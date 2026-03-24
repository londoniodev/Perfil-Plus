"use client";

import { useState, useEffect, useTransition } from "react";
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
    Code,
    Share2,
    Save,
    Globe
} from "lucide-react";
import { S3Uploader } from "./S3Uploader";
import { AVAILABLE_FEATURES, TenantFeature } from "@alvarosky/types";
import { 
    getTenantFeaturesAction, 
    updateTenantFeatures, 
    getTenantSettingsAction, 
    updateTenantSettingsAction 
} from "@/actions/super-admin/update-tenant-features";
import { toast } from "sonner";

interface Props {
    tenantSlug: string;
    tenantDbName: string;
}

export function TenantConfigPanel({ tenantSlug, tenantDbName }: Props) {
    const [settings, setSettings] = useState<Record<string, unknown>>({});
    const [features, setFeatures] = useState<TenantFeature[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isPendingFeatures, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        Promise.all([fetchSettings(), fetchFeatures()]).finally(() => setLoading(false));
    }, [tenantSlug]);

    const fetchFeatures = async () => {
        const res = await getTenantFeaturesAction(tenantSlug);
        if (res.success && res.data) {
            setFeatures(res.data as TenantFeature[]);
        } else {
            console.error("Error fetching features:", res.error);
        }
    };

    const fetchSettings = async () => {
        const res = await getTenantSettingsAction(tenantSlug);
        if (res.success && res.data) {
            setSettings(res.data);
        } else {
            console.error("Error fetching settings:", res.error);
            setMessage({ type: "error", text: res.error || "Error al cargar configuración" });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            // 1. Guardar Configuración General
            const resSettings = await updateTenantSettingsAction(tenantSlug, settings);
            if (!resSettings.success) {
                throw new Error(resSettings.error || "Error al guardar configuración");
            }

            // 2. Guardar Features (Módulos)
            const resFeatures = await updateTenantFeatures({
                tenantSlug,
                features,
            });
            if (!resFeatures.success) {
                throw new Error(resFeatures.error || "Error al guardar features");
            }

            setMessage({ type: "success", text: "Toda la configuración y features guardados correctamente" });
            toast.success("Todo guardado correctamente");
            // Refrescar features para asegurar consistencia
            await fetchFeatures();
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: "error", text: err instanceof Error ? err.message : "Error desconocido" });
            toast.error(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key: string, value: unknown) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleFeatureToggle = (featureValue: TenantFeature, checked: boolean) => {
        setFeatures((prev) =>
            checked ? [...prev, featureValue] : prev.filter((f) => f !== featureValue)
        );
    };

    const handleSaveFeatures = () => {
        startTransition(async () => {
            const result = await updateTenantFeatures({
                tenantSlug,
                features,
            });

            if (result.success) {
                toast.success("Features guardadas correctamente");
            } else {
                toast.error(result.error || "Error al guardar features");
            }
        });
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
                            <TabsTrigger value="social">
                                <Share2 className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Redes</span>
                            </TabsTrigger>
                            <TabsTrigger value="landings">
                                <Globe className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Landings S3</span>
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
                            <div className="flex items-center justify-between p-4 mb-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                <div>
                                    <h4 className="font-medium text-indigo-400">Provisioning de Módulos</h4>
                                    <p className="text-sm text-slate-400">Activa o desactiva funcionalidades completas para este tenant. Los cambios recargan la caché del Storefront automáticamente.</p>
                                </div>
                                <Button
                                    onClick={handleSaveFeatures}
                                    disabled={isPendingFeatures}
                                    variant="outline"
                                    className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/20 shrink-0"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isPendingFeatures ? "Guardando..." : "Guardar Features"}
                                </Button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {AVAILABLE_FEATURES.map((feature) => (
                                    <div key={feature.value} className="flex items-start justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                                        <div className="pr-4">
                                            <p className="text-sm font-semibold text-white">{feature.label}</p>
                                            {feature.description && (
                                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{feature.description}</p>
                                            )}
                                        </div>
                                        <Switch
                                            checked={features.includes(feature.value)}
                                            onCheckedChange={(checked) => handleFeatureToggle(feature.value, checked)}
                                            disabled={isPendingFeatures}
                                            className="mt-1"
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
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="social" className="mt-0 space-y-4">
                            <div className="max-w-2xl space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">WhatsApp (Número Completo)</Label>
                                    <Input
                                        placeholder="Ej: 573001234567"
                                        value={String(settings.social_whatsapp || "")}
                                        onChange={(e) => updateSetting("social_whatsapp", e.target.value)}
                                        className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                                    />
                                    <p className="text-xs text-slate-500">Incluye el código de país sin el símbolo +</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Instagram (URL)</Label>
                                        <Input
                                            placeholder="https://instagram.com/..."
                                            value={String(settings.social_instagram || "")}
                                            onChange={(e) => updateSetting("social_instagram", e.target.value)}
                                            className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Facebook (URL)</Label>
                                        <Input
                                            placeholder="https://facebook.com/..."
                                            value={String(settings.social_facebook || "")}
                                            onChange={(e) => updateSetting("social_facebook", e.target.value)}
                                            className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Twitter / X (URL)</Label>
                                        <Input
                                            placeholder="https://twitter.com/..."
                                            value={String(settings.social_twitter || "")}
                                            onChange={(e) => updateSetting("social_twitter", e.target.value)}
                                            className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">TikTok (URL)</Label>
                                        <Input
                                            placeholder="https://tiktok.com/..."
                                            value={String(settings.social_tiktok || "")}
                                            onChange={(e) => updateSetting("social_tiktok", e.target.value)}
                                            className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">YouTube (URL)</Label>
                                    <Input
                                        placeholder="https://youtube.com/..."
                                        value={String(settings.social_youtube || "")}
                                        onChange={(e) => updateSetting("social_youtube", e.target.value)}
                                        className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="landings" className="mt-0 space-y-4">
                            <S3Uploader tenantSlug={tenantSlug} />
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
