"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button, Input, Label } from "@alvarosky/ui";

export default function NewTenantPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        ownerEmail: "",
        plan: "free",
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
        <main className="container mx-auto p-8 max-w-2xl">
            <Link href="/tenants" className="text-sm text-muted-foreground hover:underline mb-4 block">
                ← Volver a Tenants
            </Link>

            <h1 className="text-3xl font-bold mb-8">Crear Nuevo Tenant</h1>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

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
                        <Label htmlFor="slug">Slug (identificador único)</Label>
                        <Input
                            id="slug"
                            placeholder="ej: daniela-coach"
                            value={formData.slug}
                            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Base de datos: tenants_{formData.slug || "xxx"}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email del Propietario (opcional)</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="owner@example.com"
                            value={formData.ownerEmail}
                            onChange={(e) => setFormData((prev) => ({ ...prev, ownerEmail: e.target.value }))}
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creando..." : "Crear Tenant"}
                        </Button>
                        <Link href="/tenants">
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                    </div>
                </form>
            </Card>
        </main>
    );
}
