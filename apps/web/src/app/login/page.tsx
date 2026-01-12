"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../auth.module.css";
import { API_BASE } from "@/lib/config";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirigir si ya está logueado (verificación rápida de cliente)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const user = localStorage.getItem("user");

    // Si hay un error de sesión (ej: cookie expirada o faltante), limpiamos localStorage
    if (errorParam === 'session_missing') {
      if (user) {
        localStorage.removeItem("user");
        // Disparar evento para que el Navbar se actualice (mostrar Login/Registro)
        window.dispatchEvent(new Event("user-login"));
      }
      // Redirigir al usuario para limpiar los parámetros de la URL
      router.replace("/login");
      return;
    }

    if (user) {
      router.push("/perfil");
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
      } else if (data.user.role === "ADMIN") {
        router.push("/perfil");
      } else {
        router.push("/perfil");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginCard}>
      <h1 className="card-title" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Iniciar Sesión</h1>
      <p className="card-text">Bienvenido de nuevo</p>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@mauromera.com"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <a href="/auth/forgot-password" style={{ color: '#6366f1', fontSize: '0.875rem', textDecoration: 'none' }}>
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {error && <div className={styles.loginError}>{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className={styles.loginPage}>
      <Suspense fallback={<div className={styles.loginCard}>Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
