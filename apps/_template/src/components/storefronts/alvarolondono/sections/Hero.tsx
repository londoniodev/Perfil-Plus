"use client";

import React from 'react';
import { useLanguage } from "../context/LanguageContext";

const Hero = () => {
    const { t } = useLanguage();

    const content = {
        greeting: { es: 'Hola, soy', en: 'Hi, I am' },
        role1: { es: 'Analista de Datos', en: 'Data Analyst' },
        role2: { es: 'Automatizador', en: 'Automation Expert' },
        role3: { es: 'CTO @ Universo Explora', en: 'CTO @ Universo Explora' },
        description: {
            es: 'Transformando datos en decisiones y procesos en eficiencias. Especialista en Power Platform y n8n.',
            en: 'Transforming data into decisions and processes into efficiencies. Power Platform and n8n Specialist.'
        },
        ctaProject: { es: 'Ver Proyectos', en: 'View Projects' },
        ctaContact: { es: 'Contáctame', en: 'Contact Me' }
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
            {/* Background Grid Effect */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            {/* Radial Gradient Center */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a]"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="space-y-8">
                    {/* Greeting Pill */}
                    <div className="inline-block animate-fade-in-up">
                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium tracking-wide uppercase">
                            {t(content.greeting.es, content.greeting)}
                        </span>
                    </div>

                    {/* Name */}
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-white tracking-tight animate-fade-in-up delay-100">
                        Alvaro Londoño
                    </h1>

                    {/* Roles with Gradient Text */}
                    <div className="text-xl md:text-3xl font-light text-gray-300 animate-fade-in-up delay-200 space-y-2 md:space-y-0">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 font-semibold">
                            {t(content.role1.es, content.role1)}
                        </span>
                        <span className="hidden md:inline mx-4 text-gray-600">|</span>
                        <span className="block md:inline text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 font-semibold">
                            {t(content.role2.es, content.role2)}
                        </span>
                        <span className="hidden md:inline mx-4 text-gray-600">|</span>
                        <span className="block md:inline text-white font-semibold">
                            {t(content.role3.es, content.role3)}
                        </span>
                    </div>

                    {/* Description */}
                    <p className="max-w-2xl mx-auto text-lg text-gray-400 leading-relaxed animate-fade-in-up delay-300">
                        {t(content.description.es, content.description)}
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-fade-in-up delay-400">
                        <a
                            href="#projects"
                            className="px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-all transform hover:scale-105 shadow-lg shadow-white/10"
                        >
                            {t(content.ctaProject.es, content.ctaProject)}
                        </a>
                        <a
                            href="#contact"
                            className="px-8 py-4 rounded-full bg-transparent border border-white/20 text-white font-bold hover:bg-white/10 transition-all transform hover:scale-105 backdrop-blur-sm"
                        >
                            {t(content.ctaContact.es, content.ctaContact)}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
