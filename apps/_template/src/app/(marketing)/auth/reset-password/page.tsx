'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { Input } from "@alvarosky/ui";
import { Label } from "@alvarosky/ui";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@alvarosky/ui";
import { API_BASE, TENANT_ID } from '@/lib/config';


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
            const response = await fetch(`${API_BASE}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': TENANT_ID,
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
            <Card className="w-full border-none shadow-none bg-transparent p-0 text-slate-900">
                <CardContent className="text-center pt-8">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error/10 mb-4">
                        <Lock className="h-6 w-6 text-error" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Enlace inválido</h3>
                    <p className="mt-2 text-sm text-foreground-muted mb-6 max-w-xs mx-auto">
                        El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.
                    </p>
                    <Button asChild variant="outline">
                        <Link href="/auth/forgot-password">Solicitar nuevo enlace</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full border-none shadow-none bg-transparent p-0 text-slate-900">
            <CardHeader className="text-center px-0 pt-0">
                <Link href="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600 font-serif">
                        Mauro Mera
                    </span>
                </Link>
                <CardTitle className="text-2xl font-bold font-serif mb-2">Restablecer contraseña</CardTitle>
                <CardDescription className="text-base text-foreground-muted">
                    Ingresa tu nueva contraseña para acceder a tu cuenta.
                </CardDescription>
            </CardHeader>

            <CardContent className="px-0">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-2">
                        <Label htmlFor="password">Nueva contraseña</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                <Lock className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className="pl-10 pr-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                                placeholder="••••••••"
                                {...register('password')}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                    <Eye className="h-5 w-5" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-error font-medium">{errors.password.message}</p>
                        )}
                        <p className="text-xs text-foreground-muted">
                            Mínimo 8 caracteres, mayúscula, minúscula y número.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                <Lock className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="pl-10 pr-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                                placeholder="••••••••"
                                {...register('confirmPassword')}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                    <Eye className="h-5 w-5" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-error font-medium">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                        size="lg"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                            'Actualizar contraseña'
                        )}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-light hover:underline transition-colors gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <AuthLayout>
            <Suspense fallback={<div className="text-center p-8 text-foreground-muted">Cargando...</div>}>
                <ResetPasswordFormContent />
            </Suspense>
        </AuthLayout>
    );
}

