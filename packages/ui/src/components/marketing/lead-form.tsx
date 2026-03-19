"use client";

import { useState, FormEvent } from "react";
import { Button } from "../../button";
import { Input } from "../../input";
import { Textarea } from "../../textarea";
import { useToast } from "../../toast";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LeadFormData {
    name: string;
    email: string;
    phone?: string;
    message?: string;
}

export interface LeadFormProps {
    source: string;
    title?: string;
    subtitle?: string;
    buttonText?: string;
    showMessage?: boolean;
    showPhone?: boolean;
    metadata?: Record<string, any>;
    variant?: "default" | "compact" | "inline";

    // Config option 1: Internal Fetch
    apiConfig?: {
        baseUrl: string;
        tenantId: string;
    };

    // Config option 2: External Handler
    onSubmit?: (data: LeadFormData & { source: string; metadata: any }) => Promise<void>;

    onSuccess?: () => void;
    className?: string;
}

export function LeadForm({
    source,
    title = "¿Listo para transformar tu vida?",
    subtitle = "Déjanos tus datos y te contactaremos pronto.",
    buttonText = "Enviar",
    showMessage = false,
    showPhone = false,
    metadata = {},
    variant = "default",
    apiConfig,
    onSubmit,
    onSuccess,
    className,
}: LeadFormProps) {
    const [formData, setFormData] = useState<LeadFormData>({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { error: showError } = useToast();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (onSubmit) {
                await onSubmit({ ...formData, source, metadata });
            } else if (apiConfig) {
                const res = await fetch(`${apiConfig.baseUrl}/leads`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-tenant-id": apiConfig.tenantId,
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
            } else {
                throw new Error("No submit handler configured");
            }

            setSuccess(true);
            setFormData({ name: "", email: "", phone: "", message: "" });
            onSuccess?.();
        } catch (err) {
            console.error(err);
            showError("Hubo un error al enviar el formulario. Por favor intenta nuevamente.", "Error");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={cn(
                "bg-card/60 backdrop-blur-md border border-border rounded-2xl p-8 text-center",
                variant === "compact" && "p-4",
                variant === "inline" && "p-4 flex items-center gap-4",
                className
            )}>
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                        <Check className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">¡Gracias!</h3>
                    <p className="text-muted-foreground text-sm">Hemos recibido tu información. Te contactaremos pronto.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "bg-card/60 backdrop-blur-md border border-border rounded-2xl transition-all",
            variant === "default" && "p-8",
            variant === "compact" && "p-4",
            variant === "inline" && "p-4",
            className
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
                        className="bg-background/50"
                    />

                    <Input
                        type="email"
                        placeholder="Tu email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="bg-background/50"
                    />
                </div>

                {showPhone && (
                    <Input
                        type="tel"
                        placeholder="Tu teléfono (opcional)"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-background/50"
                    />
                )}

                {showMessage && (
                    <Textarea
                        placeholder="Tu mensaje"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={3}
                        className="bg-background/50 resize-none"
                    />
                )}

                <Button type="submit" disabled={loading} className="w-full" size="lg">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                        </>
                    ) : buttonText}
                </Button>
            </form>
        </div>
    );
}
