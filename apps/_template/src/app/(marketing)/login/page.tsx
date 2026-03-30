"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { API_BASE } from "@/lib/config";
import { useTenant } from "@/app/providers";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useToast } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { Input, InputWithIcon } from "@alvarosky/ui";
import { Mail, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@alvarosky/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@alvarosky/ui";
import { LoginSchema, type LoginValues } from "@/schemas/auth";

function LoginForm() {
  const { tenantId } = useTenant();
  const searchParams = useSearchParams();
  const toast = useToast();

  const form = useForm<LoginValues>({
    resolver: standardSchemaResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  // Limpieza de sesión previa al montar la página de login
  // Esto asegura que NO queden cookies/localStorage "fantasma" que bloqueen el re-login
  useEffect(() => {
    const reasonParam = searchParams.get("reason");

    // Función para borrar cookies del frontend (no puede borrar HttpOnly del API)
    const deleteCookie = (name: string) => {
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
      // Intento adicional con Secure (para cookies creadas con Secure=true)
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure`;
    };

    // 1. SIEMPRE limpiar localStorage (si estás en el login, no debe haber sesión activa)
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    // 2. SIEMPRE borrar cookies del frontend
    deleteCookie("accessToken");
    deleteCookie("Authentication");

    // 3. Llamar al backend para borrar cookies HttpOnly (fire-and-forget)
    fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {
      // Silencioso — si falla, no bloquea el login
    });

    // 4. Notificar a otros componentes que no hay sesión
    window.dispatchEvent(new Event("user-login"));

    // 5. Mostrar mensaje si aplica
    if (reasonParam === 'session_expired') {
      toast.error("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
    }
  }, [searchParams, toast]);

  // Helper simple para cookies (ya que no tenemos js-cookie)
  const setCookie = (name: string, value: string, days: number) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
  };

  const onSubmit = async (values: LoginValues) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": tenantId,
        },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Credenciales inválidas");
      }

      if (data.accessToken) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // CRITICAL: Set cookie for Middleware
        setCookie("accessToken", data.accessToken, 7);

        window.dispatchEvent(new Event("user-login"));
      } else {
        // Fallback
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("user-login"));
      }

      const redirect = searchParams.get("redirect");
      if (redirect) {
        window.location.href = redirect;
      } else {
        switch (data.user.role) {
          case 'WAITER':
            window.location.href = "/waiter?tab=active";
            break;
          case 'KITCHEN':
            window.location.href = "/dashboard/restaurante/comandas";
            break;
          case 'CASHIER':
            window.location.href = "/dashboard/restaurante/pos";
            break;
          case 'DRIVER':
            window.location.href = "/dashboard/driver/pedidos";
            break;
          case 'ADMIN':
            window.location.href = "/dashboard";
            break;
          default:
            window.location.href = "/dashboard/perfil";
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Card className="w-full border-none shadow-none bg-transparent p-0 text-zinc-100">
      <CardHeader className="text-center px-0 pt-0">
        <CardTitle className="heading-h2 mb-2"></CardTitle>
        <CardDescription className="text-slate-500"></CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      icon={<Mail className="h-5 w-5" />}
                      type="email"
                      placeholder="admin@example.com"
                      className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/20 focus:ring-0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Contraseña</FormLabel>
                    <a
                      href="/auth/forgot-password"
                      className="text-sm font-medium text-primary hover:text-primary-light hover:underline underline-offset-4 transition-colors"
                      tabIndex={-1}
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <FormControl>
                    <InputWithIcon
                      icon={<Lock className="h-5 w-5" />}
                      type="password"
                      placeholder="••••••••"
                      className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/20 focus:ring-0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
              {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">¿No tienes una cuenta? </span>
          <a
            href="/registro"
            className="font-medium text-primary hover:text-primary-light hover:underline underline-offset-4 transition-colors"
          >
            Regístrate
          </a>
        </div>
      </CardContent>
    </Card >
  );
}

export default function AdminLoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="text-center p-8 text-foreground-muted">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}

