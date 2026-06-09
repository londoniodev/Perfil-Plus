import { SiteFooter } from "@alvarosky/ui";
import type { SocialLinks } from "@alvarosky/ui";

interface FooterProps {
    logo?: string;
    horizontalLogo?: string;
    businessName?: string;
    businessEmail?: string;
    businessPhone?: string;
    tagline?: string;
    footerLinks?: { label: string; href: string; external?: boolean }[] | null;
    navLinks?: { label: string; href: string }[];
    features?: string[];
    socialLinks?: SocialLinks | null;
    primaryColor?: string;
}

// Phone numbers that are clearly placeholders
const PLACEHOLDER_PHONES = [
    "+57 000 000 0000",
    "+57 300 000 0000",
    "000 000 0000",
    "+57000000000",
];

export function Footer({ 
    logo, 
    horizontalLogo,
    businessName, 
    businessEmail, 
    businessPhone, 
    tagline,
    footerLinks = null,
    navLinks = [],
    features = [],
    socialLinks,
    primaryColor,
}: FooterProps) {
    const finalName = businessName || "Cliente Plataforma";
    
    // Only show email if it's real (not a placeholder)
    const finalEmail = businessEmail || undefined;
    
    // Only show phone if it's real (not a placeholder from siteConfig)
    const isPlaceholderPhone = !businessPhone || PLACEHOLDER_PHONES.includes(businessPhone);
    const finalPhone = isPlaceholderPhone ? undefined : businessPhone;

    const finalTagline = tagline || "";

    let finalFooterLinks = footerLinks;

    // Fallback: If no footer links from DB, generate from features
    if (!finalFooterLinks || finalFooterLinks.length === 0) {
        finalFooterLinks = [
            { label: "Términos", href: "/terminos-y-condiciones" },
            { label: "Privacidad", href: "/politica-de-privacidad" },
        ];
    }

    const finalLogo = logo || "/favicon.ico";

    return (
        <SiteFooter
            logo={finalLogo}
            horizontalLogo={horizontalLogo}
            logoAlt="Logo"
            tagline={finalTagline}
            links={finalFooterLinks as any}
            navLinks={navLinks as any}
            companyName={finalName}
            className="bg-background"
            contactEmail={finalEmail}
            contactPhone={finalPhone}
            socialLinks={socialLinks}
            primaryColor={primaryColor}
        />
    );
}
