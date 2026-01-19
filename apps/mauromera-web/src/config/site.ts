export const siteConfig = {
    name: "Mauro Mera",
    description: "Psicólogo, consultor organizacional y coach. Acompaño a personas, equipos y organizaciones a tomar decisiones conscientes.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://mauromera.com",
    ogImage: "/images/hero/mauro_hero.png",
    keywords: [
        "psicólogo",
        "consultor organizacional",
        "coach",
        "psicoterapia",
        "orientación vocacional",
        "liderazgo",
        "cultura organizacional",
        "decisiones conscientes",
        "bienestar"
    ],
    links: {
        twitter: "https://twitter.com/mauromera",
        instagram: "https://instagram.com/mauromera",
        linkedin: "https://linkedin.com/in/mauromera",
        github: "https://github.com/mauromera"
    },
    contact: {
        email: "contacto@mauromera.com",
        phone: "+57 300 123 4567" // Placeholder
    },
    branding: {
        logo: "/images/branding/menu_logo.png",
        logoAlt: "Mauro Mera Logo"
    },
    mainNav: [
        { title: "Inicio", href: "/" },
        { title: "Portafolio", href: "/portafolio" },
        { title: "Cursos", href: "/formacion" },
        { title: "Blog", href: "/blog" },
        { title: "E-books", href: "/ebooks" },
        { title: "Servicios", href: "/servicios" }
    ]
}

export type SiteConfig = typeof siteConfig

