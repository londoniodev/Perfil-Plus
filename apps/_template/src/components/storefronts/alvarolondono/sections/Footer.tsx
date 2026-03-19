"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from "../context/LanguageContext";

const Footer = () => {
    const { t } = useLanguage();

    const content = {
        rights: { es: 'Todos los derechos reservados.', en: 'All rights reserved.' },
        privacy: { es: 'Política de Privacidad', en: 'Privacy Policy' },
        terms: { es: 'Términos de Servicio', en: 'Terms of Service' }
    };

    return (
        <footer className="bg-[#0a0a0a] border-t border-white/10 py-8 mt-20 relative z-10">
            <div className="container mx-auto px-4 text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} Alvaro Londoño. {t(content.rights.es, content.rights)}</p>
                <div className="mt-4 flex justify-center space-x-6 text-sm">
                    <Link href="/privacy" className="hover:text-white transition-colors">
                        {t(content.privacy.es, content.privacy)}
                    </Link>
                    <Link href="/terms" className="hover:text-white transition-colors">
                        {t(content.terms.es, content.terms)}
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
