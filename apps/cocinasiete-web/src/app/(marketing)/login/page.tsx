"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { API_BASE, TENANT_ID } from "@/lib/config";
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


  }, [router, searchParams]);

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
      console.log('Login attempt:', { email: values.email, API_BASE, TENANT_ID });
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": TENANT_ID,
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

        // CRITICAL: Set cookie for Middleware (on mauromera.com)
        setCookie("accessToken", data.accessToken, 7);

        window.dispatchEvent(new Event("user-login"));
      } else {
        // Fallback
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("user-login"));
      }

      const redirect = searchParams.get("redirect");
      if (redirect) {
        router.push(redirect);
      } else {
        // Redirección basada en rol
        switch (data.user.role) {
          case 'WAITER':
            router.push("/waiter?tab=active");
            break;
          case 'KITCHEN':
            router.push("/admin/restaurant/orders");
            break;
          case 'CASHIER':
            router.push("/admin/restaurant/pos");
            break;
          case 'ADMIN':
            router.push("/admin");
            break;
          default:
            router.push("/perfil");
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Card className="w-full border-none shadow-none bg-transparent p-0">
      <CardHeader className="text-center px-0 pt-0">
        <CardTitle className="heading-h2 mb-2"></CardTitle>
        <CardDescription className="text-body"></CardDescription>
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

