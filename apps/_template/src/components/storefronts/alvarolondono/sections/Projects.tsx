"use client";

import React from 'react';
import { useLanguage } from "../context/LanguageContext";

const Projects = () => {
    const { t } = useLanguage();

    const content = {
        title: { es: 'Proyectos Destacados', en: 'Featured Projects' },
        viewProject: { es: 'Ver Proyecto', en: 'View Project' },
        impact: { es: 'Impacto:', en: 'Impact:' }
    };

    const projects = [
        {
            title: 'Universo Explora',
            description: {
                es: 'Plataforma líder que democratiza la orientación vocacional. Hemos logrado impactar a más de 15,000 jóvenes de todos los estratos sociales a nivel global, eliminando barreras de acceso mediante tecnología escalable.',
                en: 'Leading platform democratizing vocational orientation. We have impacted over 15,000 youth across all social strata globally, eliminating access barriers through scalable technology.'
            },
            stats: [
                { label: { es: 'Estudiantes', en: 'Students' }, value: '15k+' },
                { label: { es: 'Países', en: 'Countries' }, value: '8+' },
                { label: { es: 'Satisfacción', en: 'Satisfaction' }, value: '98%' }
            ],
            tech: ['n8n', 'WordPress', 'React', 'Automatización'],
            link: 'https://app.universoexplora.tech',
            gradient: 'from-purple-600 to-blue-600'
        },
        {
            title: 'AI Video Analytics',
            description: {
                es: 'SaaS de vigilancia inteligente impulsado por IA. Detecta humanos, vehículos, intrusiones en zonas restringidas y uso de equipos de seguridad (EPP) en tiempo real para optimizar la seguridad industrial.',
                en: 'AI-powered intelligent surveillance SaaS. Detects humans, vehicles, restricted zone intrusions, and PPE usage in real-time to optimize industrial safety.'
            },
            stats: [
                { label: { es: 'Precisión', en: 'Accuracy' }, value: '99%' },
                { label: { es: 'Latencia', en: 'Latency' }, value: '<1s' },
                { label: { es: 'Modelos', en: 'Models' }, value: 'YOLOv8' }
            ],
            tech: ['Python', 'YOLOv8', 'React', 'FastAPI', 'WebSockets'],
            link: 'https://cam.universoexplora.tech/',
            gradient: 'from-emerald-500 to-cyan-500'
        },
        {
            title: 'Soy Deborah Soy Saludable',
            description: {
                es: 'Plataforma integral de bienestar que combina tienda online, blog educativo y app móvil con IA para conteo calórico mediante fotos y códigos de barras.',
                en: 'Comprehensive wellness platform combining online store, educational blog, and AI mobile app for calorie counting via photos and barcodes.'
            },
            stats: [
                { label: { es: 'Servicios', en: 'Services' }, value: 'Shop/Blog' },
                { label: { es: 'IA', en: 'AI' }, value: 'Vision' },
                { label: { es: 'Plataforma', en: 'Platform' }, value: 'Web/App' }
            ],
            tech: ['React', 'Computer Vision', 'E-commerce', 'Mobile'],
            link: 'https://app.soydeborasoysaludable.com',
            gradient: 'from-pink-500 to-orange-500'
        }
    ];

    return (
        <section id="projects" className="py-20 relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                    {t(content.title.es, content.title)}
                </h2>

                <div className="grid grid-cols-1 gap-8 justify-items-center">
                    {projects.map((project, index) => (
                        <div
                            key={index}
                            className="group relative w-full max-w-4xl bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="p-8 md:p-12 relative z-10">
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <h3 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${project.gradient}`}>
                                                {project.title}
                                            </h3>
                                            <span className="px-3 py-1 text-xs font-semibold bg-white/10 rounded-full text-white border border-white/10">
                                                Featured
                                            </span>
                                        </div>

                                        <p className="text-gray-300 text-lg leading-relaxed">
                                            {t(project.description.es, project.description)}
                                        </p>

                                        {/* Impact Stats */}
                                        <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/10">
                                            {project.stats.map((stat, i) => (
                                                <div key={i} className="text-center">
                                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                                    <div className="text-xs text-gray-400 uppercase tracking-wider">{t(stat.label.es, stat.label)}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {project.tech.map((tech, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 text-sm bg-black/30 text-gray-300 rounded-lg border border-white/5"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>

                                        <a
                                            href={project.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-white font-semibold group/link hover:text-blue-400 transition-colors"
                                        >
                                            {t(content.viewProject.es, content.viewProject)}
                                            <svg className="w-5 h-5 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Projects;
