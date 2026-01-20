export const siteConfig = {
    name: "Mauro Mera",
    description: "Psicólogo, consultor organizacional y coach. Acompaño a personas, equipos y organizaciones a tomar decisiones conscientes.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://mauromera.com",
    ogImage: "https://mauromera.com/og.jpg",
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
        twitter: "https://twitter.com/mauromeradev",
        github: "https://github.com/mauromera",
    },
    // Contacto
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contacto@mauromera.com",
    phone: "+57 300 123 4567", // Placeholder
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

