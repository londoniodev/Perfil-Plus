'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import styles from "../../auth.module.css";
import { AuthLayout } from "@/app/components/auth/AuthLayout";

const forgotPasswordSchema = z.object({
    email: z.string().email('Ingresa un email válido'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordForm) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Error al enviar la solicitud');
            }

            setIsSubmitted(true);
            toast.success('Correo enviado correctamente');
        } catch (error) {
            toast.error('Ocurrió un error. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className={styles.loginCard}>
                <div className="text-center" style={{ marginBottom: "2.5rem" }}>
                    <h1 className="text-2xl font-bold text-white" style={{ marginBottom: "1rem" }}>Recuperar contraseña</h1>
                    <p className="text-gray-400 text-sm" style={{ lineHeight: "1.6" }}>
                        Ingresa tu email y te enviaremos las instrucciones <br /> para restablecer tu contraseña.
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className={styles.formGroup} style={{ marginBottom: "2rem" }}>
                            <label htmlFor="email">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500" aria-hidden="true" />
                                </div>
                                <input
                                    {...register('email')}
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    className="pl-10"
                                    placeholder="tu@email.com"
                                />
                            </div>
                            {errors.email && (
                                <p className={styles.loginError}>{errors.email.message}</p>
                            )}
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    'Enviar instrucciones'
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className={styles.successMessage} style={{ padding: "2rem", marginBottom: "1.5rem" }}>
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100/10 mb-4">
                            <Mail className="h-6 w-6 text-green-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white">¡Correo enviado!</h3>
                        <p className="mt-2 text-sm text-gray-300">
                            Hemos enviado las instrucciones a tu correo electrónico. Por favor revisa tu bandeja de entrada (y spam).
                        </p>
                    </div>
                )}

                <div className="text-center" style={{ marginTop: "1rem" }}>
                    <Link
                        href="/login"
                        className="text-primary-400 hover:text-primary-300 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
