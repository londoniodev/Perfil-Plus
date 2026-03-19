"use client";

import React from 'react';
import { useLanguage } from "../context/LanguageContext";

const Clients = () => {
    const { t } = useLanguage();

    const content = {
        title: { es: 'Clientes que Confían en Mí', en: 'Clients Who Trust Me' },
        subtitle: {
            es: 'He trabajado con empresas líderes en sus industrias',
            en: "I've worked with industry-leading companies"
        }
    };

    const clients = [
        {
            name: 'Colombina',
            logo: 'https://seeklogo.com/images/C/colombina-logo-6DD0E5E0F0-seeklogo.com.png',
            industry: 'Alimentos'
        },
        {
            name: 'Kenvue',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Kenvue_logo.svg/2560px-Kenvue_logo.svg.png',
            industry: 'Salud y Cuidado Personal'
        }
    ];

    return (
        <section id="clients" className="py-20 relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {t(content.title.es, content.title)}
                    </h2>
                    <p className="text-gray-400 text-lg">
                        {t(content.subtitle.es, content.subtitle)}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {clients.map((client, index) => (
                        <div
                            key={index}
                            className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 flex items-center justify-center hover:border-white/20 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                        >
                            <div className="relative z-10">
                                <img
                                    src={client.logo}
                                    alt={client.name}
                                    className="h-20 w-auto object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity"
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="80"%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="%23999"%3E' + client.name + '%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                            </div>
                            {/* Decorative glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Clients;
