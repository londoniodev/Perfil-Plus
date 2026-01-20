export const siteConfig = {
    name: "Test Client",
    description: "Sitio web de Test Client",
    domain: "test-gen.local",
    tenantId: "test-gen",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3040",
    ogImage: "", 
    keywords: ["test-gen"],
    phone: "+00 000 000 0000",
    email: "info@test-gen.local",
    branding: {
        logo: "/favicon.ico", 
        logoAlt: "Test Client Logo"
    },
    features: {
        blog: { enabled: true },
        store: { enabled: false },
        lms: { enabled: false },
        portfolio: { enabled: false },
        ebooks: { enabled: false },
    },
    mainNav: [
        { title: "Inicio", href: "/" },
        { title: "Blog", href: "/blog" },
        { title: "Servicios", href: "/servicios" }
    ]
};
