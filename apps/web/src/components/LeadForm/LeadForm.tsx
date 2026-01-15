"use client";

import { useState, FormEvent } from "react";
import styles from "@/styles/LeadForm.module.css";
import { API_BASE } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";

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
                headers: { "Content-Type": "application/json" },
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
            <div className={`${styles.leadForm} ${styles[variant]}`}>
                <div className={styles.successMessage}>
                    <span className={styles.successIcon}>✓</span>
                    <h3>¡Gracias!</h3>
                    <p>Hemos recibido tu información. Te contactaremos pronto.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.leadForm} ${styles[variant]}`}>
            {variant !== "compact" && variant !== "inline" && (
                <div className={styles.formHeader}>
                    {title && <h3>{title}</h3>}
                    {subtitle && <p>{subtitle}</p>}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="Tu nombre"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="email"
                            placeholder="Tu email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className={styles.input}
                        />
                    </div>
                </div>

                {showPhone && (
                    <div className={styles.inputGroup}>
                        <input
                            type="tel"
                            placeholder="Tu teléfono (opcional)"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={styles.input}
                        />
                    </div>
                )}

                {showMessage && (
                    <div className={styles.inputGroup}>
                        <textarea
                            placeholder="Tu mensaje"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows={3}
                            className={styles.textarea}
                        />
                    </div>
                )}



                <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? "Enviando..." : buttonText}
                </button>
            </form>
        </div>
    );
}
