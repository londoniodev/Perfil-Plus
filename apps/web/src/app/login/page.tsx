"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/auth.module.css";
import { API_BASE } from "@/lib/config";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Redirigir si ya está logueado (verificación rápida de cliente)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const reasonParam = searchParams.get("reason");
    const user = localStorage.getItem("user");

    // Si hay un error de sesión (ej: cookie expirada o faltante), limpiamos localStorage
    if (errorParam === 'session_missing' || reasonParam === 'session_expired') {
      if (user) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        // Disparar evento para que el Navbar se actualice (mostrar Login/Registro)
        window.dispatchEvent(new Event("user-login"));
      }
      // Show friendly message
      if (reasonParam === 'session_expired') {
        toast.error("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
      }
      return;
    }

    if (user) {
      router.push("/perfil");
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Permitir cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Credenciales inválidas");
      }

      // Los tokens ahora se guardan en Cookies HTTP-only automáticamente
      // Solo guardamos datos del usuario para mostrar en la UI
      localStorage.setItem("user", JSON.stringify(data.user));
      // Disparar evento para actualizar el Header
      window.dispatchEvent(new Event("user-login"));

      // Redireccionar
      const redirect = searchParams.get("redirect");
      if (redirect) {
        router.push(redirect);
        router.push("/perfil");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto lg:bg-transparent lg:border-none lg:shadow-none lg:p-0 bg-card/50 backdrop-blur-md border-white/10">
      <CardHeader className="text-center px-0 pt-0">
        <CardTitle className="text-3xl font-bold mb-2">Iniciar Sesión</CardTitle>
        <CardDescription className="text-base">Bienvenido de nuevo</CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@mauromera.com"
              className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
            />
          </div>

          <div className="text-right">
            <a href="/auth/forgot-password" className="text-sm font-medium text-primary hover:text-primary-light hover:underline underline-offset-4 transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <Button type="submit" fullWidth disabled={loading} size="lg" className="mt-2">
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminLoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className={styles.loginCard}>Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
