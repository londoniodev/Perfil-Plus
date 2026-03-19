"use client";

import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-zinc-300">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold text-white sm:text-5xl tracking-tight">
            Términos de Servicio
          </h1>
          <p className="text-zinc-500">Última actualización: 13 de marzo de 2026</p>
        </header>

        <section className="space-y-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar la aplicación <strong>"Restaurante"</strong> gestionada por <strong>ALVARO JOSE LONDOÑO MOSCOSO</strong> a través del ecosistema de Meta, usted acepta quedar vinculado por estos términos.
          </p>
        </section>

        <section className="space-y-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">2. Uso de la Aplicación</h2>
          <p>
            La aplicación tiene como fin la gestión y optimización de servicios de restaurante mediante el uso de herramientas integradas en las plataformas de Meta (Messenger, Instagram, WhatsApp). El usuario se compromete a proporcionar información veraz para el CRM.
          </p>
        </section>

        <section className="space-y-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">3. Responsabilidad del Proveedor</h2>
          <p>
            ALVARO JOSE LONDOÑO MOSCOSO actúa como proveedor tecnológico, garantizando el mantenimiento y la disponibilidad de las herramientas proporcionadas, siempre sujeto a la estabilidad de las APIs de Meta.
          </p>
        </section>

        <section className="space-y-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">4. Propiedad Intelectual</h2>
          <p>
            Todos los derechos de software, marca y desarrollos realizados bajo el nombre de ALVARO JOSE LONDOÑO MOSCOSO son propiedad exclusiva del mismo.
          </p>
        </section>

        <section className="space-y-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">5. Limitación de Responsabilidad</h2>
          <p>
            No nos hacemos responsables de interrupciones de servicio fuera de nuestro control directo, incluyendo caídas de servicios de terceros o mal uso por parte del cliente final.
          </p>
        </section>

        <section className="space-y-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">6. Ley Aplicable</h2>
          <p>
            Estos términos se rigen por las leyes aplicables al domicilio fiscal de ALVARO JOSE LONDOÑO MOSCOSO y cualquier disputa será resuelta en las jurisdicciones correspondientes.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
