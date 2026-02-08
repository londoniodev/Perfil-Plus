export const siteConfig = {
    name: "Soy Deborah Soy Saludable",
    description: "Sitio web de Soy Deborah Soy Saludable",
    domain: "deborahmoscoso.local",
    tenantId: "deborahmoscoso",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002",
    ogImage: "",
    keywords: ["deborahmoscoso"],
    phone: "+00 000 000 0000",
    email: "info@deborahmoscoso.local",
    branding: {
        logo: "/favicon.ico",
        logoAlt: "Soy Deborah Soy Saludable Logo"
    },
    features: {
        blog: { enabled: true },
        store: { enabled: true },
        lms: { enabled: true },
        portfolio: { enabled: true },
    },
    mainNav: [
        { title: "Inicio", href: "/" },
        { title: "Portafolio", href: "/portafolio" },
        { title: "Cursos", href: "/formacion" },
        { title: "Blog", href: "/blog" },
        { title: "Servicios", href: "/servicios" }
    ]
};
