"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Card,
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Checkbox,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@alvarosky/ui";
import { LogoutButton } from "@/components/logout-button";

export default function NewTenantPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        // Datos básicos
        name: "",
        slug: "",
        ownerEmail: "",
        plan: "free",
        // Configuración técnica
        currency: "COP",
        mpPublicKey: "",
        mpAccessToken: "",
        mpWebhookSecret: "",
        mpClientId: "",
        mpClientSecret: "",
        smtpJson: "",
        // Features
        blogEnabled: true,
        storeEnabled: true,
        lmsEnabled: false,
    });

    const handleSlugify = (name: string) => {
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        setFormData((prev) => ({ ...prev, name, slug }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validar SMTP JSON si se proporciona
            if (formData.smtpJson.trim()) {
                try {
                    JSON.parse(formData.smtpJson);
                } catch {
                    throw new Error("El JSON de SMTP no es válido");
                }
            }

            const res = await fetch("/api/tenants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al crear tenant");
            }

            router.push("/tenants");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">Platform Admin</h1>
                                <p className="text-xs text-slate-400">Control Tower</p>
                            </div>
                        </Link>
                    </div>
                    <LogoutButton />
                </div>
            </header>

            {/* Main Content */}
            <main className="relative container mx-auto px-6 py-12 max-w-3xl">
                <Breadcrumb className="mb-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/tenants">Tenants</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-indigo-400">Nuevo Tenant</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <h2 className="text-3xl font-bold text-white mb-2">Crear Nuevo Tenant</h2>
                <p className="text-slate-400 mb-8">Provisiona una nueva base de datos y configura el cliente.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* ========== DATOS BÁSICOS ========== */}
                    <Card className="p-6 bg-slate-900/50 backdrop-blur border-slate-800/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Datos del Cliente
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-300">Nombre del Cliente</Label>
                                <Input
                                    id="name"
                                    placeholder="Ej: Daniela Coach"
                                    value={formData.name}
                                    onChange={(e) => handleSlugify(e.target.value)}
                                    required
                                    className="bg-slate-800/50 border-slate-700 focus:border-indigo-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug" className="text-slate-300">Slug (identificador único)</Label>
                                <Input
                                    id="slug"
                                    placeholder="ej: daniela-coach"
                                    value={formData.slug}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                                    required
                                    className="bg-slate-800/50 border-slate-700 focus:border-indigo-500"
                                />
                                <p className="text-xs text-slate-500">
                                    Base de datos: <span className="text-indigo-400 font-mono">tenants_{formData.slug || "xxx"}</span>
                                </p>
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="email" className="text-slate-300">Email del Propietario (opcional)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="owner@example.com"
                                    value={formData.ownerEmail}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, ownerEmail: e.target.value }))}
                                    className="bg-slate-800/50 border-slate-700 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* ========== CONFIGURACIÓN TÉCNICA ========== */}
                    <Card className="p-6 bg-slate-900/50 backdrop-blur border-slate-800/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Configuración Técnica
                        </h3>

                        {/* Moneda */}
                        <div className="space-y-2 mb-4">
                            <Label htmlFor="currency" className="text-slate-300">Moneda</Label>
                            <Select
                                value={formData.currency}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                            >
                                <SelectTrigger className="w-full bg-slate-800/50 border-slate-700 text-white focus:ring-indigo-500">
                                    <SelectValue placeholder="Selecciona moneda" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                                    <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                                    <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* MercadoPago */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="mpPublicKey" className="text-slate-300">MercadoPago Public Key</Label>
                                <Input
                                    id="mpPublicKey"
                                    placeholder="APP_USR-xxxxx"
                                    value={formData.mpPublicKey}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, mpPublicKey: e.target.value }))}
                                    className="bg-slate-800/50 border-slate-700 focus:border-indigo-500 font-mono text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mpAccessToken" className="text-slate-300">MercadoPago Access Token</Label>
                                <Input
                                    id="mpAccessToken"
                                    type="password"
                                    placeholder="APP_USR-xxxxx"
                                    value={formData.mpAccessToken}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, mpAccessToken: e.target.value }))}
                                    className="bg-slate-800/50 border-slate-700 focus:border-indigo-500 font-mono text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mpWebhookSecret" className="text-slate-300">
                                    Webhook Secret
                                    <span className="ml-1 text-red-400">*</span>
                                </Label>
                                <Input
                                    id="mpWebhookSecret"
                                    type="password"
                                    placeholder="Secreto para validar webhooks"
                                    value={formData.mpWebhookSecret}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, mpWebhookSecret: e.target.value }))}
                                    className="bg-slate-800/50 border-slate-700 focus:border-indigo-500 font-mono text-sm"
                                />
                                <p className="text-xs text-slate-500">Crítico para validar firmas de notificaciones</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mpClientId" className="text-slate-300">Client ID</Label>
                                <Input
                                    id="mpClientId"
                                    placeholder="Identificador de la aplicación"
                                    value={formData.mpClientId}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, mpClientId: e.target.value }))}
                                    className="bg-slate-800/50 border-slate-700 focus:border-indigo-500 font-mono text-sm"
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="mpClientSecret" className="text-slate-300">Client Secret</Label>
                                <Input
                                    id="mpClientSecret"
                                    type="password"
                                    placeholder="Secreto de la aplicación"
                                    value={formData.mpClientSecret}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, mpClientSecret: e.target.value }))}
                                    className="bg-slate-800/50 border-slate-700 focus:border-indigo-500 font-mono text-sm"
                                />
                            </div>
                        </div>

                        {/* SMTP JSON */}
                        <div className="space-y-2">
                            <Label htmlFor="smtpJson" className="text-slate-300">Configuración SMTP (JSON)</Label>
                            <textarea
                                id="smtpJson"
                                rows={5}
                                placeholder={`{
  "host": "smtp.example.com",
  "port": 587,
  "secure": false,
  "auth": {
    "user": "user@example.com",
    "pass": "password"
  }
}`}
                                value={formData.smtpJson}
                                onChange={(e) => setFormData((prev) => ({ ...prev, smtpJson: e.target.value }))}
                                className="w-full px-3 py-2 rounded-md bg-slate-800/50 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm resize-none"
                            />
                            <p className="text-xs text-slate-500">Opcional. Pega la configuración nodemailer en formato JSON.</p>
                        </div>
                    </Card>

                    {/* ========== FEATURES ========== */}
                    <Card className="p-6 bg-slate-900/50 backdrop-blur border-slate-800/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            Features Habilitados
                        </h3>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="blog"
                                checked={formData.blogEnabled}
                                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, blogEnabled: checked as boolean }))}
                                className="border-slate-600 bg-slate-800 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                            <Label htmlFor="blog" className="text-slate-300 cursor-pointer">Blog</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="store"
                                checked={formData.storeEnabled}
                                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, storeEnabled: checked as boolean }))}
                                className="border-slate-600 bg-slate-800 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                            <Label htmlFor="store" className="text-slate-300 cursor-pointer">Tienda</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="lms"
                                checked={formData.lmsEnabled}
                                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, lmsEnabled: checked as boolean }))}
                                className="border-slate-600 bg-slate-800 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                            <Label htmlFor="lms" className="text-slate-300 cursor-pointer">LMS (Formación)</Label>
                        </div>
                    </Card>

                    {/* ========== BOTONES ========== */}
                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creando...
                                </span>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Crear Tenant
                                </>
                            )}
                        </Button>
                        <Link href="/tenants">
                            <Button type="button" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                                Cancelar
                            </Button>
                        </Link>
                    </div>
                </form>

                {/* Info Card */}
                <Card className="mt-8 p-4 bg-indigo-500/10 border-indigo-500/20">
                    <div className="flex gap-3">
                        <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-indigo-300">
                            <p className="font-medium mb-1">¿Qué sucede al crear un tenant?</p>
                            <ul className="text-indigo-400/80 space-y-1">
                                <li>• Se crea una nueva base de datos PostgreSQL</li>
                                <li>• Se ejecutan las migraciones automáticamente</li>
                                <li>• Se inserta la configuración inicial (SystemSetting)</li>
                                <li>• El estado cambiará a ACTIVE cuando esté listo</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
}
