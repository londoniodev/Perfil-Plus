import { SiteFooter } from "@alvarosky/ui";
import { siteConfig } from "@/config/site";

interface FooterProps {
    logo?: string;
    businessName?: string;
    businessEmail?: string;
    businessPhone?: string;
    tagline?: string;
    footerLinks?: { label: string; href: string; external?: boolean }[] | null;
    features?: string[];
}

export function Footer({ 
    logo, 
    businessName, 
    businessEmail, 
    businessPhone, 
    tagline,
    footerLinks = null,
    features = []
}: FooterProps) {
    // Use siteConfig as fallback for all values
    const finalName = businessName || siteConfig.name || "Cliente Plataforma";
    const finalEmail = businessEmail || siteConfig.email || "hola@plataforma.com";
    const finalPhone = businessPhone || siteConfig.phone || "+57 300 000 0000";
    const finalTagline = tagline || "";

    let finalFooterLinks = footerLinks;

    // Fallback Automático si no hay links configurados en DB
    if (!finalFooterLinks || finalFooterLinks.length === 0) {
        finalFooterLinks = [
            { label: "Inicio", href: "/" },
            { label: "Términos", href: "/terminos-y-condiciones" },
            { label: "Privacidad", href: "/politica-de-privacidad" }
        ];
        if (features.includes("SHOP")) finalFooterLinks.push({ label: "Tienda", href: "/tienda" });
        if (features.includes("BLOG")) finalFooterLinks.push({ label: "Blog", href: "/blog" });
        if (features.includes("RESTAURANT")) finalFooterLinks.push({ label: "Menú", href: "/menu" });
    }

    const finalLogo = logo || siteConfig.branding.logo;
    const hasLanding = features.includes("LANDING");

    return (
        <div className="flex flex-col w-full bg-background relative z-10 border-t border-border/40 pb-8">
            <SiteFooter
                logo={finalLogo}
                logoAlt={siteConfig.branding.logoAlt}
                tagline={finalTagline}
                links={finalFooterLinks as any}
                companyName={finalName}
                className="border-none py-8 pb-4"
                hideTopSection={hasLanding}
                contactInfo={
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-muted-foreground/60 font-medium whitespace-nowrap">
                        <span>Email: <a href={`mailto:${finalEmail}`} className="hover:text-foreground hover:underline transition-all">{finalEmail}</a></span>
                        <span className="hidden sm:inline text-border">•</span>
                        <span>Teléfono: {finalPhone}</span>
                    </div>
                }
            />
        </div>
    );
}
