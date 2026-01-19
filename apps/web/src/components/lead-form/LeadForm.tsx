"use client";

import { useState, FormEvent } from "react";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { useToast } from "@mauromera/ui";
import { Button } from "@mauromera/ui";
import { Input } from "@mauromera/ui";
import { Textarea } from "@mauromera/ui";
import { IconCheck } from "@mauromera/ui";
import { cn } from "@/lib/utils";

interface LeadFormProps {
    source: string;
    title?: string;
    subtitle?: string;
    buttonText?: string;
    showMessage?: boolean;
    showPhone?: boolean;
    metadata?: Record<string, any>;
    onSuccess?: () => void;
    variant?: "default" | "compact" | "inline";
}

export default function LeadForm({
    source,
    title = "¿Listo para transformar tu vida?",
    subtitle = "Déjanos tus datos y te contactaremos pronto.",
    buttonText = "Enviar",
    showMessage = false,
    showPhone = false,
    metadata = {},
    onSuccess,
    variant = "default",
}: LeadFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/leads`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-tenant-id": TENANT_ID,
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || undefined,
                    message: formData.message || undefined,
                    source,
                    metadata,
                }),
            });

            if (!res.ok) throw new Error("Error al enviar");

            setSuccess(true);
            setFormData({ name: "", email: "", phone: "", message: "" });
            onSuccess?.();
        } catch (err) {
            toast.error("Hubo un error. Por favor intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={cn(
                "bg-card/60 backdrop-blur-md border border-border rounded-2xl p-8 text-center",
                variant === "compact" && "p-4",
                variant === "inline" && "p-4 flex items-center gap-4"
            )}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                        <IconCheck className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">¡Gracias!</h3>
                    <p className="text-muted-foreground">Hemos recibido tu información. Te contactaremos pronto.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "bg-card/60 backdrop-blur-md border border-border rounded-2xl",
            variant === "default" && "p-8",
            variant === "compact" && "p-4",
            variant === "inline" && "p-4"
        )}>
            {variant !== "compact" && variant !== "inline" && (
                <div className="text-center mb-8">
                    {title && <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>}
                    {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className={cn(
                    "grid gap-4",
                    variant === "inline" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"
                )}>
                    <Input
                        type="text"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input
                        type="email"
                        placeholder="Tu email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>

                {showPhone && (
                    <Input
                        type="tel"
                        placeholder="Tu teléfono (opcional)"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                )}

                {showMessage && (
                    <Textarea
                        placeholder="Tu mensaje"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={3}
                    />
                )}

                <Button type="submit" disabled={loading} className="w-full" size="lg">
                    {loading ? "Enviando..." : buttonText}
                </Button>
            </form>
        </div>
    );
}
