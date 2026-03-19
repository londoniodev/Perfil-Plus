"use client";

import React, { createContext, useState, useContext } from 'react';

interface LanguageContextType {
    language: 'es' | 'en';
    toggleLanguage: () => void;
    t: (key: string, translations?: Record<'es' | 'en', string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<'es' | 'en'>('es'); // Default to Spanish

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'es' ? 'en' : 'es'));
    };

    const t = (key: string, translations?: Record<'es' | 'en', string>) => {
        if (!translations) return key;
        return translations[language] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
