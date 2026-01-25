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
    BreadcrumbSeparator,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Separator
} from "@alvarosky/ui";
import { Loader2, Save, ArrowLeft } from "lucide-react";

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
        <div className="container max-w-4xl py-6 space-y-8">
            {/* Header & Breadcrumbs */}
            <div className="space-y-4">
                <Breadcrumb>
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
                            <BreadcrumbPage>Nuevo Tenant</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Tenant</h1>
                        <p className="text-muted-foreground mt-1">
                            Provisiona una nueva base de datos y configura el cliente.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/tenants">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* ========== DATOS BÁSICOS ========== */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            Datos del Cliente
                        </CardTitle>
                        <CardDescription>Información principal para identificar al tenant.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Cliente</Label>
                            <Input
                                id="name"
                                placeholder="Ej: Daniela Coach"
                                value={formData.name}
                                onChange={(e) => handleSlugify(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug (identificador)</Label>
                            <Input
                                id="slug"
                                placeholder="ej: daniela-coach"
                                value={formData.slug}
                                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Base de datos: <span className="font-mono text-primary">tenants_{formData.slug || "xxx"}</span>
                            </p>
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="email">Email del Propietario (opcional)</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="owner@example.com"
                                value={formData.ownerEmail}
                                onChange={(e) => setFormData((prev) => ({ ...prev, ownerEmail: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* ========== CONFIGURACIÓN TÉCNICA ========== */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Configuración Técnica</CardTitle>
                        <CardDescription>Ajustes de pagos, moneda y notificaciones.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Moneda */}
                        <div className="space-y-2 w-full sm:w-1/2">
                            <Label htmlFor="currency">Moneda Principal</Label>
                            <Select
                                value={formData.currency}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                            >
                                <SelectTrigger>
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

                        <Separator />

                        {/* MercadoPago */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">MercadoPago</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="mpPublicKey">Public Key</Label>
                                    <Input
                                        id="mpPublicKey"
                                        placeholder="APP_USR-xxxxx"
                                        value={formData.mpPublicKey}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, mpPublicKey: e.target.value }))}
                                        className="font-mono text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mpAccessToken">Access Token</Label>
                                    <Input
                                        id="mpAccessToken"
                                        type="password"
                                        placeholder="APP_USR-xxxxx"
                                        value={formData.mpAccessToken}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, mpAccessToken: e.target.value }))}
                                        className="font-mono text-sm"
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mpWebhookSecret">
                                        Webhook Secret <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="mpWebhookSecret"
                                        type="password"
                                        value={formData.mpWebhookSecret}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, mpWebhookSecret: e.target.value }))}
                                        className="font-mono text-sm"
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mpClientId">Client ID</Label>
                                    <Input
                                        id="mpClientId"
                                        value={formData.mpClientId}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, mpClientId: e.target.value }))}
                                        className="font-mono text-sm"
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="mpClientSecret">Client Secret</Label>
                                    <Input
                                        id="mpClientSecret"
                                        type="password"
                                        value={formData.mpClientSecret}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, mpClientSecret: e.target.value }))}
                                        className="font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* SMTP JSON */}
                        <div className="space-y-2">
                            <Label htmlFor="smtpJson">Configuración SMTP (JSON)</Label>
                            <textarea
                                id="smtpJson"
                                rows={5}
                                placeholder={`{\n  "host": "smtp.example.com",\n  "port": 587,\n  "secure": false,\n  "auth": {\n    "user": "user@example.com",\n    "pass": "password"\n  }\n}`}
                                value={formData.smtpJson}
                                onChange={(e) => setFormData((prev) => ({ ...prev, smtpJson: e.target.value }))}
                                className="w-full px-3 py-2 rounded-md border border-input bg-transparent text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
                            />
                            <p className="text-xs text-muted-foreground">Configuración opcional para Nodemailer.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* ========== FEATURES ========== */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Features Habilitados</CardTitle>
                        <CardDescription>Módulos que estarán disponibles inicialmente.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="blog"
                                checked={formData.blogEnabled}
                                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, blogEnabled: checked as boolean }))}
                            />
                            <Label htmlFor="blog" className="cursor-pointer">Blog (Artículos y Posts)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="store"
                                checked={formData.storeEnabled}
                                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, storeEnabled: checked as boolean }))}
                            />
                            <Label htmlFor="store" className="cursor-pointer">Tienda (E-commerce)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="lms"
                                checked={formData.lmsEnabled}
                                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, lmsEnabled: checked as boolean }))}
                            />
                            <Label htmlFor="lms" className="cursor-pointer">LMS (Sistema de Gestión de Aprendizaje)</Label>
                        </div>
                    </CardContent>
                </Card>

                {/* ========== BOTONES ========== */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.push("/tenants")}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="min-w-[140px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Crear Tenant
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
