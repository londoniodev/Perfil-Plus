export const siteConfig = {
    name: "Gesco Abogados",
    description: "Asesoría jurídica integral y gestión de cobro",
    domain: "gesco.perfil.plus",
    tenantId: "gesco",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://gesco.perfil.plus",
    ogImage: "",
    keywords: ["abogados", "colombia", "cobro de cartera", "juridico"],
    phone: "+57 311 372 5245",
    email: "info@gescoabogados.com",
    branding: {
        logo: "/favicon.ico",
        logoAlt: "Gesco Abogados"
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
