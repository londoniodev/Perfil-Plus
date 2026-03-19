"use client";

import React from 'react';
import { useLanguage } from "../context/LanguageContext";

const About = () => {
    const { t } = useLanguage();

    const content = {
        title: { es: 'Sobre Mí', en: 'About Me' },
        bio: {
            es: 'Soy un apasionado por la tecnología y la automatización. Con una sólida base en análisis de datos y desarrollo de soluciones low-code, ayudo a empresas a optimizar sus flujos de trabajo. Actualmente lidero la tecnología en Universo Explora.',
            en: 'I am passionate about technology and automation. With a solid background in data analysis and low-code solution development, I help companies optimize their workflows. I currently lead technology at Universo Explora.'
        },
        skillsTitle: { es: 'Habilidades', en: 'Skills' },
        skills: ['Power Platform', 'n8n', 'Python', 'SQL', 'React', 'Data Analysis', 'Automation', 'Cloud Architecture']
    };

    return (
        <section id="about" className="py-20 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                    {t(content.title.es, content.title)}
                </h2>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <p className="text-gray-300 text-lg leading-relaxed">
                            {t(content.bio.es, content.bio)}
                        </p>

                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">
                                {t(content.skillsTitle.es, content.skillsTitle)}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {content.skills.map((skill) => (
                                    <span key={skill} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Image Placeholder */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative aspect-square rounded-2xl bg-gray-900 border border-white/10 flex items-center justify-center overflow-hidden">
                            {/* User can replace this with their image */}
                            <img
                                src="/storefronts/alvarolondono/assets/images/profile.webp"
                                alt="Alvaro Londoño"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
