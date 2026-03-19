"use client";

import React, { useState } from 'react';
import { useLanguage } from "../context/LanguageContext";

const Navbar = () => {
    const { language, toggleLanguage, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: { es: 'Sobre mí', en: 'About' }, href: '#about' },
        { name: { es: 'Experiencia', en: 'Experience' }, href: '#experience' },
        { name: { es: 'Proyectos', en: 'Projects' }, href: '#projects' },
        { name: { es: 'Contacto', en: 'Contact' }, href: '#contact' },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <a href="#" className="flex items-center">
                            <img
                                src="/storefronts/alvarolondono/assets/images/logo/android-chrome-claro-192x192.png"
                                alt="Alvaro Londoño"
                                className="h-12 w-12 md:h-14 md:w-14 transition-transform duration-300 hover:scale-110"
                            />
                        </a>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                                >
                                    {t(link.name.es, link.name)}
                                </a>
                            ))}
                            <button
                                onClick={toggleLanguage}
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium border border-white/10 hover:border-white/30 transition-all"
                            >
                                {language === 'es' ? 'EN' : 'ES'}
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isOpen ? (
                                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-[#0a0a0a] border-b border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                {t(link.name.es, link.name)}
                            </a>
                        ))}
                        <button
                            onClick={() => {
                                toggleLanguage();
                                setIsOpen(false);
                            }}
                            className="text-gray-300 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                        >
                            {language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
