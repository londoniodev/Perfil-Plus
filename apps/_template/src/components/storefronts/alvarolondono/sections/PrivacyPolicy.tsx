"use client";

import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-zinc-300">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold text-white sm:text-5xl tracking-tight">
            Política de Privacidad
          </h1>
          <p className="text-zinc-500">Última actualización: 13 de marzo de 2026</p>
        </header>

        <section className="space-y-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">1. Información General</h2>
          <p>
            Esta Política de Privacidad describe cómo <strong>ALVARO JOSE LONDOÑO MOSCOSO</strong> (en adelante, "el Propietario") recopila, utiliza y protege la información proporcionada por los usuarios de la aplicación <strong>"Restaurante"</strong> y el sitio web <strong>xn--alvarolondoo-khb.dev</strong>.
          </p>
        </section>

        <section className="space-y-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">2. Datos Recolectados</h2>
          <p>Nuestra aplicación recopila los siguientes datos personales necesarios para su funcionamiento:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Nombre y Apellido</li>
            <li>Número de celular</li>
            <li>Correo electrónico</li>
          </ul>
        </section>

        <section className="space-y-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">3. Finalidad del Tratamiento</h2>
          <p>Los datos recolectados se utilizan exclusivamente para:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Gestión de clientes a través de nuestro sistema <strong>CRM</strong>.</li>
            <li>Facilitar la comunicación y servicios relacionados con la aplicación "Restaurante".</li>
            <li>Mejorar la experiencia del usuario y soporte técnico.</li>
          </ul>
        </section>

        <section className="space-y-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">4. Protección de Datos y Verificación de Meta</h2>
          <p>
            Como proveedor tecnológico de Meta, garantizamos que el uso de los datos personales cumple con los estándares de seguridad exigidos. No vendemos ni compartimos su información con terceros para fines comerciales ajenos a la prestación del servicio.
          </p>
        </section>

        <section className="space-y-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">5. Contacto</h2>
          <p>
            Para cualquier duda, solicitud de acceso, rectificación o eliminación de sus datos, puede contactarnos en:
          </p>
          <p className="font-medium text-white">
            Email: <a href="mailto:soy@xn--alvarolondoo-khb.dev" className="text-blue-400 hover:text-blue-300 transition-colors">soy@xn--alvarolondoo-khb.dev</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
