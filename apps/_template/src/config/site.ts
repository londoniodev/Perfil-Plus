export const siteConfig = {
    name: "Tienda Template",
    description: "Plataforma multi-tenant de Perfil Plus",
    domain: "template.perfil.plus",
    tenantId: "template",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://template.perfil.plus",
    ogImage: "",
    keywords: ["saas", "multi-tenant", "ecommerce", "perfil plus"],
    phone: "+57 000 000 0000",
    email: "hola@perfil.plus",
    branding: {
        logo: "/favicon.ico",
        logoAlt: "Logo"
    },
    whatsappMessage: "Hola, vengo desde la web.",
    features: {
        blog: { enabled: true },
        store: { enabled: true },
        lms: { enabled: false },
        portfolio: { enabled: false },
        ebooks: { enabled: false },
    },
    mainNav: [
        { title: "Inicio", href: "/" },
        { title: "Tienda", href: "/tienda" },
        { title: "Blog", href: "/blog" },
    ],
    salesPageUrl: "https://perfil.plus"
};
