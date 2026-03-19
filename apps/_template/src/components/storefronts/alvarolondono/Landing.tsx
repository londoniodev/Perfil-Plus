import React from "react";
import Link from "next/link";

export default function AlvaroLanding() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            {/* Nav */}
            <header className="px-6 py-4 border-b border-slate-900/80 flex items-center justify-between">
                <div className="font-bold text-lg tracking-tight">
                    Álvaro Londoño
                </div>
            </header>

            {/* Hero */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto space-y-6">
                <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Plataforma SaaS Multi-Tenant
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                    Solución integral para la gestión de negocios, comercio electrónico y academias digitales. Todo bajo un mismo ecosistema modular y escalable.
                </p>
                <div className="pt-4">
                    <Link href="https://saas.alvarolondoño.dev" className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium transition-colors">
                        Acceder al Dashboard
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="p-6 border-t border-slate-900/80 text-center text-sm text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    © {new Date().getFullYear()} Álvaro Londoño. Todos los derechos reservados.
                </div>
                <div className="flex gap-4">
                    <Link href="/legal/privacidad" className="hover:underline">
                        Políticas de Privacidad
                    </Link>
                </div>
            </footer>
        </div>
    );
}
