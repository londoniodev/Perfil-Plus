"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminCursosPage() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push("/perfil");
        }
    }, [isAdmin, loading, router]);

    if (loading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "1.5rem",
                color: "var(--foreground)"
            }}>
                Gestión de Cursos
            </h1>

            <div style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "1rem",
                padding: "2rem",
                textAlign: "center"
            }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
                <h2 style={{ color: "var(--foreground)", marginBottom: "0.5rem" }}>
                    Panel de Administración de Cursos
                </h2>
                <p style={{ color: "var(--foreground-muted)" }}>
                    Aquí podrás crear, editar y gestionar los cursos de la plataforma.
                </p>
                <p style={{
                    color: "var(--accent)",
                    marginTop: "1.5rem",
                    fontSize: "0.875rem"
                }}>
                    🚧 Esta sección está en desarrollo
                </p>
            </div>
        </div>
    );
}
