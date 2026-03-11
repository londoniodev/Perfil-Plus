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
    businessName = "Cliente Plataforma", 
    businessEmail = "hola@plataforma.com", 
    businessPhone = "+57 300 000 0000", 
    tagline = "Creciendo contigo",
    footerLinks = null,
    features = []
}: FooterProps) {
    let finalFooterLinks = footerLinks;

    // Fallback Automático si no hay links configurados en DB
    if (!finalFooterLinks || finalFooterLinks.length === 0) {
        finalFooterLinks = [
            { label: "Inicio", href: "/" },
            { label: "Términos", href: "/terminos" }
        ];
        if (features.includes("BLOG")) finalFooterLinks.push({ label: "Blog", href: "/blog" });
        if (features.includes("RESTAURANT")) finalFooterLinks.push({ label: "Menú", href: "/menu" });
    }

    const finalLogo = logo || siteConfig.branding.logo;

    return (
        <div className="hidden md:flex flex-col w-full bg-background relative z-10 border-t border-border/40 pb-8">
            <SiteFooter
                logo={finalLogo}
                logoAlt={siteConfig.branding.logoAlt}
                tagline={tagline}
                links={finalFooterLinks as any}
                companyName={businessName}
                className="border-none py-8 pb-4"
            />
            {/* Meta Legal & Contact Info Band unificada */}
            <div className="container mx-auto px-4 text-center flex flex-col items-center justify-center gap-2 mt-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-xs text-muted-foreground/60 font-medium">
                    <span>Email: <a href={`mailto:${businessEmail}`} className="hover:text-foreground hover:underline transition-all">{businessEmail}</a></span>
                    <span className="hidden sm:inline text-border">•</span>
                    <span>Teléfono: {businessPhone}</span>
                </div>
            </div>
        </div>
    );
}
