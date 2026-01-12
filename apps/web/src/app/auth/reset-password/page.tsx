'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import styles from "../../auth.module.css";

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
            <div className={styles.loginCard} style={{ textAlign: "center" }}>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100/10 mb-4">
                    <Lock className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-white">Enlace inválido</h3>
                <p className="mt-2 text-sm text-gray-400 mb-6">
                    El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.
                </p>
                <Link
                    href="/auth/forgot-password"
                    className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                    Solicitar nuevo enlace
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.loginCard}>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.formGroup}>
                    <label htmlFor="password">Nueva contraseña</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            {...register('password')}
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className="pl-10 pr-10"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className={styles.loginError}>{errors.password.message}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                        Mínimo 8 caracteres, mayúscula, minúscula y número.
                    </p>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword">Confirmar contraseña</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            {...register('confirmPassword')}
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            className="pl-10 pr-10"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className={styles.loginError}>{errors.confirmPassword.message}</p>
                    )}
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-full"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                            'Actualizar contraseña'
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-8 text-center">
                <Link
                    href="/login"
                    className="text-primary-400 hover:text-primary-300 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
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
        <div className={styles.loginPage}>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-6">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">
                            Mauro Mera
                        </span>
                    </Link>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Restablecer contraseña
                    </h2>
                    <p className="text-sm text-gray-400">
                        Ingresa tu nueva contraseña para acceder a tu cuenta.
                    </p>
                </div>

                <Suspense fallback={<div className="text-center p-4 text-white">Cargando...</div>}>
                    <ResetPasswordFormContent />
                </Suspense>
            </div>
        </div>
    );
}
