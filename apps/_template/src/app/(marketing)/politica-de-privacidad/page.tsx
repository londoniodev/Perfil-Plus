import React from "react";
import { headers } from "next/headers";
import { getTenantId } from "@/lib/config-server";
import { Metadata } from "next";
import { getDynamicUrl } from "@/lib/network";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Políticas de Privacidad",
        description: "Conoce cómo recopilamos, usamos y protegemos tus datos personales.",
        alternates: {
            canonical: "/politica-de-privacidad",
        }
    };
}

export default async function PrivacyPolicyPage() {
    const headersList = await headers();
    const tenantId = await getTenantId();
    const urlBase = getDynamicUrl(headersList);
    const host = new URL(urlBase).host;

    // Datos por defecto
    let tenantName = "nuestra plataforma";
    let contactEmail = `soporte@${host.replace("www.", "")}`;

    try {
        const _apiUrl = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api:3001/api').replace(/\/+$/, "");
        const API_URL = _apiUrl.endsWith('/api') ? _apiUrl : `${_apiUrl}/api`;
        
        const response = await fetch(`${API_URL}/tenant/branding`, {
            headers: { 
                'x-tenant-id': tenantId,
                'x-internal-token': process.env.INTERNAL_API_KEY || 'default_dev_secret_key'
            },
            next: { revalidate: 3600 }
        });

        if (response.ok) {
            const data = await response.json();
            tenantName = data?.name || tenantName;
            if (data?.ownerEmail) contactEmail = data.ownerEmail;
        }
    } catch (e) {
        console.warn("Error fetching branding for Privacy Page:", e);
    }

    const today = new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-background text-foreground p-6 sm:p-12 max-w-3xl mx-auto space-y-8">
            <header className="border-b pb-4">
                <h1 className="text-3xl font-bold">Políticas de Privacidad</h1>
                <p className="text-muted-foreground text-sm mt-1">Última actualización: {today}</p>
            </header>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">1. Introducción</h2>
                <p>
                    En <strong>{tenantName}</strong>, valoramos tu privacidad y nos comprometemos s proteger tus datos personales. Esta política describe cómo recopilamos, utilizamos y compartimos tu información al visitar nuestro sitio <strong>{host}</strong>.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">2. Información que Recopilamos</h2>
                <p>
                    Podemos recopilar información que nos proporcionas directamente o de forma automática:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Datos de contacto</strong>: Nombre, correo electrónico i teléfono (ej: al registrarte o contactarnos).</li>
                    <li><strong>Datos de Navegación</strong>: Dirección IP, tipo de navegador, páginas visitadas i cookies para mejorar tu experiencia.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">3. Uso de la Información</h2>
                <p>
                    Utilizamos tus datos para los siguientes fines:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Prestar y mantener nuestros servicios/productos.</li>
                    <li>Notificarte sobre cambios en la plataforma o responder s tus dudas.</li>
                    <li>Garantizar la seguridad y prevenir fraudes en el sistema.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">4. Tus Derechos (ARCO)</h2>
                <p>
                    Tienes derecho s acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales en cualquier momento.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">5. Contacto</h2>
                <p>
                    Para ejercer tus derechos o resolver dudas sobre estas políticas, puedes contactarnos enviando un correo s: <a href={`mailto:${contactEmail}`} className="text-primary hover:underline font-medium">{contactEmail}</a>.
                </p>
            </section>
        </div>
    );
}

