import { SiteFooter } from "@alvarosky/ui";
import { siteConfig } from "@/config/site";

export function Footer() {
    const footerLinks = [
        { label: "Inicio", href: "/" },
        { label: "Portafolio", href: "/portafolio" },
        { label: "Servicios", href: "/servicios" },
        { label: "Blog", href: "/blog" },
        {
            label: "Contacto",
            href: `https://wa.me/${siteConfig.phone.replace(/[^0-9]/g, '')}`,
            external: true
        },
        { label: "Privacidad", href: "/politica-de-privacidad" },
    ];

    return (
        <SiteFooter
            logo={siteConfig.branding.logo}
            logoAlt={siteConfig.branding.logoAlt}
            tagline="Transformar el mundo empieza por cuidar el mundo interno."
            links={footerLinks}
            companyName={siteConfig.name}
        />
    );
}
