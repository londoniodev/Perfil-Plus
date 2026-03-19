"use client";

import React from 'react';
import { useLanguage } from "../context/LanguageContext";

const Experience = () => {
    const { t } = useLanguage();

    const content = {
        title: { es: 'Experiencia', en: 'Experience' },
        jobs: [
            {
                role: { es: 'CTO', en: 'CTO' },
                company: 'Universo Explora',
                period: { es: 'Actualidad', en: 'Present' },
                description: {
                    es: 'Liderando el desarrollo tecnológico y la estrategia de la plataforma educativa app.universoexplora.tech.',
                    en: 'Leading technological development and strategy for the educational platform app.universoexplora.tech.'
                }
            },
            {
                role: { es: 'Analista de Datos & Automatizador', en: 'Data Analyst & Automator' },
                company: 'Freelance / Consultor',
                period: { es: '2020 - Actualidad', en: '2020 - Present' },
                description: {
                    es: 'Desarrollo de flujos de trabajo automatizados con n8n y Power Automate. Creación de dashboards en Power BI.',
                    en: 'Development of automated workflows with n8n and Power Automate. Creation of dashboards in Power BI.'
                }
            }
        ]
    };

    return (
        <section id="experience" className="py-20">
            <div className="max-w-4xl mx-auto px-6 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                    {t(content.title.es, content.title)}
                </h2>

                <div className="space-y-12">
                    {content.jobs.map((job, index) => (
                        <div key={index} className="relative pl-8 border-l-2 border-gray-800 hover:border-blue-500 transition-colors duration-300">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-900 border-2 border-gray-600 group-hover:border-blue-500 transition-colors"></div>

                            <h3 className="text-2xl font-bold text-white mb-1">
                                {t(job.role.es, job.role)}
                            </h3>
                            <div className="text-blue-400 font-medium mb-2">
                                {job.company} <span className="text-gray-500">•</span> {t(job.period.es, job.period)}
                            </div>
                            <p className="text-gray-400 text-lg">
                                {t(job.description.es, job.description)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experience;
