export const siteConfig = {
    name: "Template Client",
    description: "Plantilla Base para Clientes",
    domain: "template.local",
    tenantId: "template",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ogImage: "",
    keywords: ["template", "client"],
    phone: "+00 000 000 0000",
    email: "info@template.local",
    branding: {
        logo: "/favicon.ico",
        logoAlt: "Template Client Logo"
    },
    whatsappMessage: "Hola, me gustaría recibir más información.",
    features: {
        blog: { enabled: false },
        store: { enabled: false },
        lms: { enabled: false },
        portfolio: { enabled: false },
        ebooks: { enabled: false },
    },
    mainNav: [
        { title: "Inicio", href: "/" },
    ],
    salesPageUrl: "https://www.google.com"
};
