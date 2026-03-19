import React from "react";

export default function PrivacidadPage() {
    return (
        <div className="min-h-screen bg-background text-foreground p-6 sm:p-12 max-w-3xl mx-auto space-y-8">
            <header className="border-b pb-4">
                <h1 className="text-3xl font-bold">Políticas de Privacidad</h1>
                <p className="text-muted-foreground text-sm mt-1">Última actualización: 18 de Marzo, 2026</p>
            </header>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">1. Introducción</h2>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">2. Recopilación de Información</h2>
                <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Datos de identificación (Nombre, correo).</li>
                    <li>Información de uso de la plataforma.</li>
                    <li>Cookies y tecnologías similares.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">3. Uso de la Información</h2>
                <p>
                    At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">4. Contacto</h2>
                <p>
                    Para cualquier duda sobre estas políticas, puedes contactarnos a través de los canales oficiales de administración.
                </p>
            </section>
        </div>
    );
}
