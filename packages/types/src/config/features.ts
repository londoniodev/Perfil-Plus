export const AVAILABLE_FEATURES = [
    { label: 'Tienda (E-commerce)', value: 'shop' },
    { label: 'Blog / Noticias', value: 'blog' },
    { label: 'LMS (Cursos)', value: 'lms' },
    { label: 'Portafolio', value: 'portfolio' },
    { label: 'Bot WhatsApp (CRM)', value: 'bot-whatsapp' },
] as const;

export type FeatureKey = typeof AVAILABLE_FEATURES[number]['value'];
