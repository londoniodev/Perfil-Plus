import { SiteFooter } from "@alvarosky/ui";
import { siteConfig } from "@/config/site";

interface FooterProps {
    tenantName?: string;
    logoUrl?: string;
}

export function Footer({ tenantName, logoUrl }: FooterProps) {
    const displayName = tenantName || siteConfig.name;
    const finalLogo = logoUrl || siteConfig.branding.logo;

    const footerLinks = [
        { label: "Inicio", href: "/" },
        { label: "Empresas", href: "/empresas" },
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
            logo={finalLogo}
            logoAlt={displayName}
            tagline={`${displayName} — Tu plataforma de confianza.`}
            links={footerLinks}
            companyName={displayName}
        />
    );
}
