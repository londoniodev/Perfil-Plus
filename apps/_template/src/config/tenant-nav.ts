// src/config/tenant-nav.ts

export type PublicNavItem = {
    label: string;
    href: string;
    external?: boolean;
};

export type TenantNavConfig = {
    header: PublicNavItem[];
    footer: PublicNavItem[];
    companyName: string;
    tagline: string;
    contact: {
        email: string;
        phone: string;
    }
};

export const TENANT_CONFIGS: Record<string, TenantNavConfig> = {
    "soydeborasoysaludable": { // Deborah
        companyName: "Deborah Moscoso",
        tagline: "Transformando físicos y mentalidades.",
        contact: {
            email: "info@soydeborasoysaludable.com",
            phone: "+1 305-555-1234"
        },
        header: [
            { label: "Inicio", href: "/" },
            { label: "Quien Soy", href: "/quien-soy" },
            { label: "Logros", href: "/logros" },
            { label: "Servicios", href: "/servicios" },
            { label: "Tienda", href: "/tienda" },
            { label: "Blog", href: "/blog" },
            { label: "Emprende", href: "/emprende" },
            { label: "Mi Cuenta", href: "/perfil" },
        ],
        footer: [
            { label: "Inicio", href: "/" },
            { label: "Servicios", href: "/servicios" },
            { label: "Tienda", href: "/tienda" },
            { label: "Contacto", href: "https://wa.me/13055551234", external: true },
            { label: "Privacidad", href: "/politica-de-privacidad" },
            { label: "Términos y Condiciones", href: "/terminos-y-condiciones" },
        ]
    },
    // Alias map for local dev / alternative domains
    "deborahmoscoso": undefined as any, 
    "cm7mman6x000208jsf3h9h2k1": undefined as any,
    
    "mauromera": {  // Mauro Mera
        companyName: "Mauro Mera",
        tagline: "Psicólogo y Consultor Organizacional.",
        contact: {
            email: "info@mauromera.com",
            phone: "+57 300 000 0000"
        },
        header: [
            { label: "Inicio", href: "/" },
            { label: "Portafolio", href: "/portafolio" },
            { label: "Cursos", href: "/formacion" },
            { label: "Blog", href: "/blog" },
            { label: "Tienda", href: "/tienda" },
            { label: "Servicios", href: "/servicios" },
            { label: "Mi Cuenta", href: "/perfil" },
        ],
        footer: [
            { label: "Inicio", href: "/" },
            { label: "Portafolio", href: "/portafolio" },
            { label: "Cursos", href: "/formacion" },
            { label: "Tienda", href: "/tienda" },
            { label: "Contacto", href: "https://wa.me/573000000000", external: true },
            { label: "Privacidad", href: "/politica-de-privacidad" },
        ]
    },

    "cocinasiete": { // Cocina Siete
        companyName: "Cocina Siete",
        tagline: "Software P.O.S y Sistema Multi-Sucursal para Restaurantes.",
        contact: {
            email: "hola@cocinasiete.com",
            phone: "+57 300 000 0000"
        },
        header: [
            { label: "Inicio", href: "/" },
            { label: "Planes", href: "/#planes" },
            { label: "Características", href: "/#caracteristicas" },
            { label: "Blog", href: "/blog" },
            { label: "Mi Cuenta", href: "/perfil" },
        ],
        footer: [
            { label: "Inicio", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: "Ingresar", href: "/login" },
            { label: "Contacto", href: "https://wa.me/573000000000", external: true },
            { label: "Términos y Condiciones", href: "/terminos-y-condiciones" },
        ]
    },

    "default": { // Template Fallback (Cocina Siete, etc)
        companyName: "Template Client",
        tagline: "Transformar el mundo empieza por cuidar el mundo interno.",
        contact: {
            email: "info@template.local",
            phone: "+00 000 000 0000"
        },
        header: [
            { label: "Inicio", href: "/" },
            { label: "Servicios", href: "/servicios" },
            { label: "Tienda", href: "/tienda" },
            { label: "Blog", href: "/blog" },
            { label: "Mi Cuenta", href: "/perfil" },
        ],
        footer: [
            { label: "Inicio", href: "/" },
            { label: "Tienda", href: "/tienda" },
            { label: "Contacto", href: "https://wa.me/00000000000", external: true },
            { label: "Privacidad", href: "/politica-de-privacidad" },
        ]
    }
};

// Map aliases to the primary config
TENANT_CONFIGS["deborahmoscoso"] = TENANT_CONFIGS["soydeborasoysaludable"];
TENANT_CONFIGS["cm7mman6x000208jsf3h9h2k1"] = TENANT_CONFIGS["soydeborasoysaludable"];

export function getTenantNavConfig(tenantId: string): TenantNavConfig {
    return TENANT_CONFIGS[tenantId] || TENANT_CONFIGS["default"];
}
