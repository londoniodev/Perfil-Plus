export const siteConfig = {
    name: "Soy Deborah Soy Saludable",
    description: "Coaching fitness, nutrición y suplementación premium para tu transformación integral.",
    domain: "deborahmoscoso.com",
    tenantId: "deborahmoscoso",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://deborahmoscoso.com",
    ogImage: "/og-image.jpg",
    keywords: ["fitness coach", "nutrición personal", "suplementos premium", "cuidado personal", "bienestar"],
    phone: "+57 321 000 0000",
    email: "hola@deborahmoscoso.com",
    branding: {
        logo: "/logo.png",
        logoAlt: "Deborah Moscoso"
    },
    features: {
        blog: { enabled: true },
        store: { enabled: true },
        lms: { enabled: true },
        portfolio: { enabled: true },
    },
    mainNav: [
        { title: "Inicio", href: "/" },
        { title: "Programas", href: "/servicios" },
        { title: "Tienda", href: "/tienda" },
        { title: "Blog", href: "/blog" },
        { title: "Contacto", href: "#contacto" }
    ]
};
