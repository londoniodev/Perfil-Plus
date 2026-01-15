'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { InputWithIcon } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const forgotPasswordSchema = z.object({
    email: z.string().email('Ingresa un email válido'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const toast = useToast();

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
            <Card className="w-full border-none shadow-none bg-transparent p-0">
                <CardHeader className="text-center px-0 pt-0">
                    <CardTitle className="text-3xl font-bold mb-2 font-serif">Recuperar contraseña</CardTitle>
                    <CardDescription className="text-base text-foreground-muted">
                        Ingresa tu email y te enviaremos las instrucciones <br className="hidden sm:block" /> para restablecer tu contraseña.
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-0">
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <InputWithIcon
                                    icon={<Mail className="h-5 w-5" />}
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="text-sm text-error font-medium">{errors.email.message}</p>
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
                                    'Enviar instrucciones'
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="bg-success/10 border border-success/30 rounded-lg p-6 text-center mb-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success/20 mb-4">
                                <Mail className="h-6 w-6 text-success" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">¡Correo enviado!</h3>
                            <p className="text-sm text-foreground-muted">
                                Hemos enviado las instrucciones a tu correo electrónico. Por favor revisa tu bandeja de entrada (y spam).
                            </p>
                        </div>
                    )}

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
        </AuthLayout>
    );
}
