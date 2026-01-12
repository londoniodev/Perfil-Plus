'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';

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
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-6">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500">
                        Mauro Mera
                    </span>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-neutral-900">
                    Recuperar contraseña
                </h2>
                <p className="mt-2 text-center text-sm text-neutral-600">
                    Ingresa tu email y te enviaremos las instrucciones <br /> para restablecer tu contraseña.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {!isSubmitted ? (
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                                    Email
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        {...register('email')}
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        className="block w-full pl-10 sm:text-sm border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 py-2"
                                        placeholder="tu@email.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
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
                                        'Enviar instrucciones'
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <Mail className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-neutral-900">¡Correo enviado!</h3>
                            <p className="mt-2 text-sm text-neutral-500">
                                Hemos enviado las instrucciones a tu correo electrónico. Por favor revisa tu bandeja de entrada (y spam).
                            </p>
                        </div>
                    )}

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
            </div>
        </div>
    );
}
