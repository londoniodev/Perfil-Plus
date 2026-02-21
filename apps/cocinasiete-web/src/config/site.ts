export const siteConfig = {
    name: "Cocina Siete",
    description: "Sitio web de Cocina Siete",
    domain: "cocinasiete-web.local",
    tenantId: "cocinasiete-web",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003",
    ogImage: "", 
    keywords: ["cocinasiete-web"],
    phone: "+00 000 000 0000",
    email: "info@cocinasiete-web.local",
    branding: {
        logo: "/favicon.ico", 
        logoAlt: "Cocina Siete Logo"
    },
    features: {
        blog: { enabled: false },
        store: { enabled: false },
        lms: { enabled: false },
        portfolio: { enabled: false },
    },
    mainNav: [
        { title: "Inicio", href: "/" },
        { title: "Servicios", href: "/servicios" }
    ]
};
