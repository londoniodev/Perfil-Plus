"use client";

import { SiteFooter } from "@alvarosky/ui";
import { siteConfig } from "@/config/site";
import { useTenant } from "@/app/providers";

export function Footer() {
    const { contactPhone, businessName, tagline } = useTenant();
    const phone = contactPhone || siteConfig.phone;

    const footerLinks = [
        { label: "Inicio", href: "/" },
        { label: "Portafolio", href: "/portafolio" },
        { label: "Servicios", href: "/servicios" },
        { label: "Blog", href: "/blog" },
        {
            label: "Contacto",
            href: `https://wa.me/${phone.replace(/[^0-9]/g, '')}`,
            external: true
        },
        { label: "Privacidad", href: "/politica-de-privacidad" },
    ];

    return (
        <SiteFooter
            logo={siteConfig.branding.logo}
            logoAlt={siteConfig.branding.logoAlt}
            tagline={tagline || "Transformando vidas a través del fitness, la nutrición y el bienestar integral."}
            links={footerLinks}
            companyName={businessName || siteConfig.name}
        />
    );
}
