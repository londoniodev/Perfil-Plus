'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

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
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <Lock className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900">Enlace inválido</h3>
                <p className="mt-2 text-sm text-neutral-500 mb-6">
                    El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.
                </p>
                <Link
                    href="/auth/forgot-password"
                    className="text-primary-600 hover:text-primary-500 font-medium"
                >
                    Solicitar nuevo enlace
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                        Nueva contraseña
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                        </div>
                        <input
                            {...register('password')}
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className="block w-full pl-10 pr-10 sm:text-sm border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 py-2"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                            ) : (
                                <Eye className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                    )}
                    <p className="mt-2 text-xs text-neutral-500">
                        Mínimo 8 caracteres, mayúscula, minúscula y número.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-neutral-700"
                    >
                        Confirmar contraseña
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                        </div>
                        <input
                            {...register('confirmPassword')}
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            className="block w-full pl-10 pr-10 sm:text-sm border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 py-2"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                            ) : (
                                <Eye className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Actualizar contraseña'
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-neutral-500">O</span>
                    </div>
                </div>

                <div className="mt-6 flex justify-center text-sm">
                    <Link
                        href="/login"
                        className="font-medium text-primary-600 hover:text-primary-500 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-6">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500">
                        Mauro Mera
                    </span>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-neutral-900">
                    Restablecer contraseña
                </h2>
                <p className="mt-2 text-center text-sm text-neutral-600">
                    Ingresa tu nueva contraseña para acceder a tu cuenta.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Suspense fallback={<div className="text-center p-4">Cargando...</div>}>
                    <ResetPasswordFormContent />
                </Suspense>
            </div>
        </div>
    );
}
