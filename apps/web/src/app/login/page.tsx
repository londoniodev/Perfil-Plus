"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { API_BASE } from "@/lib/config";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoginSchema, type LoginValues } from "@/schemas/auth";

function LoginForm() {
  const router = useRouter();
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

  // Redirigir si ya está logueado
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const reasonParam = searchParams.get("reason");
    const user = localStorage.getItem("user");

    if (errorParam === 'session_missing' || reasonParam === 'session_expired') {
      if (user) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event("user-login"));
      }
      if (reasonParam === 'session_expired') {
        toast.error("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
      }
      return;
    }

    if (user) {
      router.push("/perfil");
    }
  }, [router, searchParams]);

  const onSubmit = async (values: LoginValues) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Credenciales inválidas");
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("user-login"));

      const redirect = searchParams.get("redirect");
      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/perfil");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Card className="w-full border-none shadow-none bg-transparent p-0">
      <CardHeader className="text-center px-0 pt-0">
        <CardTitle className="text-3xl font-bold mb-2 font-serif">Iniciar Sesión</CardTitle>
        <CardDescription className="text-base text-foreground-muted">Bienvenido de nuevo</CardDescription>
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
                    <Input
                      type="email"
                      placeholder="admin@mauromera.com"
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
                    <Input
                      type="password"
                      placeholder="••••••••"
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
      </CardContent>
    </Card>
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
