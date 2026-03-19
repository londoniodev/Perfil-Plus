"use client";

import React from 'react';
import { useLanguage } from "../context/LanguageContext";

const Services = () => {
    const { t } = useLanguage();

    const content = {
        title: { es: 'Mis Servicios', en: 'My Services' },
        subtitle: {
            es: 'Soluciones estratégicas para escalar tu negocio',
            en: 'Strategic solutions to scale your business'
        },
        services: [
            {
                title: { es: 'Consultoría en Automatización', en: 'Automation Consulting' },
                desc: {
                    es: 'Optimización de flujos de trabajo con n8n y Power Platform. Reduzco tareas repetitivas para que tu equipo se enfoque en lo importante.',
                    en: 'Workflow optimization with n8n and Power Platform. I reduce repetitive tasks so your team can focus on what matters.'
                },
                icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                ),
                gradient: 'from-yellow-400 to-orange-500'
            },
            {
                title: { es: 'Data Analytics & BI', en: 'Data Analytics & BI' },
                desc: {
                    es: 'Transformación de datos en decisiones. Dashboards interactivos en Power BI que revelan insights clave de tu negocio.',
                    en: 'Turning data into decisions. Interactive Power BI dashboards that reveal key insights about your business.'
                },
                icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                ),
                gradient: 'from-blue-400 to-cyan-500'
            },
            {
                title: { es: 'Arquitectura de Software', en: 'Software Architecture' },
                desc: {
                    es: 'Diseño de sistemas escalables y robustos. Desarrollo Full Stack con React y Node.js enfocado en rendimiento y mantenibilidad.',
                    en: 'Design of scalable and robust systems. Full Stack development with React and Node.js focused on performance and maintainability.'
                },
                icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                ),
                gradient: 'from-purple-400 to-pink-500'
            }
        ]
    };

    return (
        <section id="services" className="py-20 relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {t(content.title.es, content.title)}
                    </h2>
                    <p className="text-gray-400 text-lg">
                        {t(content.subtitle.es, content.subtitle)}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {content.services.map((service, index) => (
                        <div
                            key={index}
                            className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}></div>

                            <div className="relative z-10">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} p-[1px] mb-6`}>
                                    <div className="w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center text-white">
                                        {service.icon}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                                    {t(service.title.es, service.title)}
                                </h3>

                                <p className="text-gray-400 leading-relaxed">
                                    {t(service.desc.es, service.desc)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
