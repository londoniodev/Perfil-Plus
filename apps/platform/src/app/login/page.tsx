"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Label, Card } from "@alvarosky/ui";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const expired = searchParams.get("expired");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(expired ? "Tu sesión ha expirado" : null);
    const [credentials, setCredentials] = useState({ username: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-tenant-id": "mauro" // TODO: Esto debería ser dinámico o configurado
                },
                body: JSON.stringify(credentials),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error de autenticación");
            }

            router.push(callbackUrl);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="relative w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl border-slate-800">
            {/* Logo/Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">Platform Admin</h1>
                <p className="text-slate-400 text-sm mt-1">Control Tower - Acceso Restringido</p>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-300">Usuario</Label>
                    <Input
                        id="username"
                        type="text"
                        placeholder="Ingresa tu usuario"
                        value={credentials.username}
                        onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                        required
                        autoComplete="username"
                        className="bg-slate-800/50 border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">Contraseña</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        required
                        autoComplete="current-password"
                        className="bg-slate-800/50 border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-2.5"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Ingresando...
                        </span>
                    ) : (
                        "Iniciar Sesión"
                    )}
                </Button>
            </form>

            {/* Security notice */}
            <p className="mt-6 text-xs text-center text-slate-500">
                🔒 Conexión segura · Sesión expira en 8 horas
            </p>
        </Card>
    );
}

function LoginFallback() {
    return (
        <Card className="relative w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl border-slate-800">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                    <svg className="w-8 h-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">Platform Admin</h1>
                <p className="text-slate-400 text-sm mt-1">Cargando...</p>
            </div>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
            </div>

            <Suspense fallback={<LoginFallback />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
