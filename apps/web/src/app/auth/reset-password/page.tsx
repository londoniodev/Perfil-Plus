'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import styles from "@/styles/auth.module.css";
import { AuthLayout } from "@/components/auth/AuthLayout";


const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, 'La contraseña debe tener al menos 8 caracteres')
            .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
            .regex(/[a-z]/, 'Debe contener al menos una minúscula')
            .regex(/[0-9]/, 'Debe contener al menos un número'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const toast = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordForm) => {
        if (!token) {
            toast.error('Token inválido o faltante');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error al restablecer la contraseña');
            }

            toast.success('Contraseña actualizada correctamente');
            router.push('/login');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Ocurrió un error. Inténtalo de nuevo.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className={styles.loginCard}>
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100/10 mb-4">
                        <Lock className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Enlace inválido</h3>
                    <p className="mt-2 text-sm text-gray-400 mb-6">
                        El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.
                    </p>
                    <Link
                        href="/auth/forgot-password"
                        className={styles.backLink}
                    >
                        Solicitar nuevo enlace
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.loginCard}>

            <div className={styles.authHeader}>
                <Link href="/" className="inline-block mb-md">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">
                        Mauro Mera
                    </span>
                </Link>
                <h2 className={styles.authTitle}>
                    Restablecer contraseña
                </h2>
                <p className={styles.authDescription}>
                    Ingresa tu nueva contraseña para acceder a tu cuenta.
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.formGroup}>
                    <label htmlFor="password">Nueva contraseña</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-muted" aria-hidden="true" />
                        </div>
                        <input
                            {...register('password')}
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className={`${styles.inputWithAction} ${styles.inputWithIcon}`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-muted" aria-hidden="true" />
                            ) : (
                                <Eye className="h-5 w-5 text-muted" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className={styles.loginError}>{errors.password.message}</p>
                    )}
                    <p className="mt-2 text-xs text-muted">
                        Mínimo 8 caracteres, mayúscula, minúscula y número.
                    </p>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword">Confirmar contraseña</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-muted" aria-hidden="true" />
                        </div>
                        <input
                            {...register('confirmPassword')}
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            className={`${styles.inputWithAction} ${styles.inputWithIcon}`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-muted" aria-hidden="true" />
                            ) : (
                                <Eye className="h-5 w-5 text-muted" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className={styles.loginError}>{errors.confirmPassword.message}</p>
                    )}
                </div>

                <div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        fullWidth
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                            'Actualizar contraseña'
                        )}
                    </Button>
                </div>
            </form>

            <div className={styles.backLinkContainer}>
                <Link
                    href="/login"
                    className={styles.backLink}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio de sesión
                </Link>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <AuthLayout>
            <Suspense fallback={<div className="text-center p-4 text-white">Cargando...</div>}>
                <ResetPasswordFormContent />
            </Suspense>
        </AuthLayout>
    );
}
