import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Instagram, Facebook, Phone, Mail, MapPin } from "lucide-react";

export interface FooterLink {
    label: string;
    href: string;
    external?: boolean;
}

export interface SocialLinks {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    whatsapp?: string;
    tiktok?: string;
    website?: string;
}

export interface SiteFooterProps {
    logo: string;
    horizontalLogo?: string;
    logoAlt?: string;
    tagline?: string;
    links: FooterLink[];
    navLinks?: FooterLink[];
    companyName: string;
    developerName?: string;
    developerUrl?: string;
    className?: string;
    contactEmail?: string;
    contactPhone?: string;
    socialLinks?: SocialLinks | null;
    primaryColor?: string;
}

// ── Inline SVG Icons for social platforms not in lucide ──

function XIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.81a8.23 8.23 0 0 0 4.77 1.52V6.88a4.85 4.85 0 0 1-1.01-.19z" />
        </svg>
    );
}

function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
    );
}


export function SiteFooter({
    logo,
    horizontalLogo,
    logoAlt = "Logo",
    tagline,
    links,
    navLinks,
    companyName,
    developerName = "Alvaro Londoño",
    developerUrl = "https://perfil.plus",
    className,
    contactEmail,
    contactPhone,
    socialLinks,
    primaryColor,
}: SiteFooterProps) {
    const currentYear = new Date().getFullYear();
    const displayLogo = horizontalLogo || logo;
    const hasValidLogo = displayLogo &&
        displayLogo !== "" &&
        displayLogo !== "/favicon.ico" &&
        displayLogo !== "/images/branding/icon.png" &&
        !displayLogo.endsWith("icon.png");

    // Filter out placeholder taglines
    const displayTagline = tagline && tagline !== "Plataforma multi-tenant de Perfil Plus"
        ? tagline : null;

    // Merge navLinks with footer links, deduplicate by href
    const allLinks = [...(navLinks || []), ...links];
    const uniqueLinks = allLinks.filter((link, index, self) =>
        index === self.findIndex(l => l.href === link.href)
    );

    // Check if there are any social links configured
    const hasSocials = socialLinks && Object.values(socialLinks).some(v => v);

    const hasContact = contactEmail || contactPhone;

    // CSS variable for primary color accent
    const accentStyle = primaryColor ? {
        '--footer-accent': `hsl(${primaryColor})`,
        '--footer-accent-20': `hsl(${primaryColor} / 0.2)`,
        '--footer-accent-10': `hsl(${primaryColor} / 0.1)`,
        '--footer-accent-5': `hsl(${primaryColor} / 0.05)`,
    } as React.CSSProperties : {};

    return (
        <footer
            className={cn("relative overflow-hidden", className)}
            style={accentStyle}
        >
            {/* ── Shimmer Accent Line ── */}
            <div className="h-px w-full relative overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        background: primaryColor
                            ? `linear-gradient(90deg, transparent, hsl(${primaryColor}), transparent)`
                            : 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)',
                        animation: 'footer-shimmer 3s ease-in-out infinite',
                    }}
                />
            </div>

            {/* ── Background Gradient ── */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        background: primaryColor
                            ? `radial-gradient(ellipse at 50% 0%, hsl(${primaryColor} / 0.4) 0%, transparent 70%)`
                            : 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.4) 0%, transparent 70%)',
                    }}
                />
            </div>

            {/* ── Keyframes ── */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes footer-shimmer {
                    0%, 100% { opacity: 0.4; transform: scaleX(0.6); }
                    50% { opacity: 1; transform: scaleX(1); }
                }
            `}} />

            <div className="relative z-10 container mx-auto px-5 md:px-8 pt-10 pb-6 md:pt-14 md:pb-8">

                {/* ── Top Section: Logo + Nav + Socials ── */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-8 md:mb-12">

                    {/* Left: Logo + Tagline */}
                    <div className="md:col-span-4 flex flex-col items-center md:items-start gap-3">
                        {hasValidLogo ? (
                            <Link href="/" className="group inline-block">
                                <Image
                                    src={displayLogo}
                                    alt={logoAlt}
                                    width={horizontalLogo ? 180 : 120}
                                    height={horizontalLogo ? 48 : 32}
                                    className={cn(
                                        "w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:brightness-110",
                                        horizontalLogo ? "h-10 md:h-12 max-w-[200px]" : "h-8 md:h-10"
                                    )}
                                    unoptimized
                                />
                            </Link>
                        ) : (
                            <Link href="/" className="group">
                                <span className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                                    {companyName}
                                </span>
                            </Link>
                        )}

                        {displayTagline && (
                            <p className="text-sm text-muted-foreground/70 font-light max-w-[260px] text-center md:text-left leading-relaxed">
                                {displayTagline}
                            </p>
                        )}

                        {/* Social Icons — Below logo on all screens */}
                        {hasSocials && (
                            <div className="flex items-center gap-2 mt-2">
                                {socialLinks?.instagram && (
                                    <a
                                        href={socialLinks.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Instagram"
                                        className="p-2 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.08] text-muted-foreground/60 hover:text-foreground transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                                    >
                                        <Instagram className="w-[18px] h-[18px]" />
                                    </a>
                                )}
                                {socialLinks?.facebook && (
                                    <a
                                        href={socialLinks.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Facebook"
                                        className="p-2 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.08] text-muted-foreground/60 hover:text-foreground transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                                    >
                                        <Facebook className="w-[18px] h-[18px]" />
                                    </a>
                                )}
                                {socialLinks?.twitter && (
                                    <a
                                        href={socialLinks.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="X (Twitter)"
                                        className="p-2 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.08] text-muted-foreground/60 hover:text-foreground transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                                    >
                                        <XIcon className="w-[16px] h-[16px]" />
                                    </a>
                                )}
                                {socialLinks?.tiktok && (
                                    <a
                                        href={socialLinks.tiktok}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="TikTok"
                                        className="p-2 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.08] text-muted-foreground/60 hover:text-foreground transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                                    >
                                        <TikTokIcon className="w-[18px] h-[18px]" />
                                    </a>
                                )}
                                {socialLinks?.whatsapp && (
                                    <a
                                        href={socialLinks.whatsapp.startsWith("http") ? socialLinks.whatsapp : `https://wa.me/${socialLinks.whatsapp.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="WhatsApp"
                                        className="p-2 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.08] text-muted-foreground/60 hover:text-foreground transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                                    >
                                        <WhatsAppIcon className="w-[18px] h-[18px]" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Center: Navigation Links */}
                    {uniqueLinks.length > 0 && (
                        <div className="md:col-span-4 flex flex-col items-center">
                            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50 font-semibold mb-4">
                                Navegación
                            </span>
                            <nav className="grid grid-cols-2 gap-x-8 gap-y-2.5">
                                {uniqueLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        target={link.external ? "_blank" : undefined}
                                        rel={link.external ? "noopener noreferrer" : undefined}
                                        className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors duration-200 hover:translate-x-0.5 transform inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    )}

                    {/* Right: Contact Info */}
                    {hasContact && (
                        <div className="md:col-span-4 flex flex-col items-center md:items-end">
                            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50 font-semibold mb-4">
                                Contacto
                            </span>
                            <div className="flex flex-col gap-2.5">
                                {contactEmail && (
                                    <a
                                        href={`mailto:${contactEmail}`}
                                        className="flex items-center gap-2.5 text-sm text-muted-foreground/70 hover:text-foreground transition-colors group"
                                    >
                                        <Mail className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                        <span>{contactEmail}</span>
                                    </a>
                                )}
                                {contactPhone && (
                                    <a
                                        href={`tel:${contactPhone}`}
                                        className="flex items-center gap-2.5 text-sm text-muted-foreground/70 hover:text-foreground transition-colors group"
                                    >
                                        <Phone className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                        <span>{contactPhone}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Bottom Bar ── */}
                <div className="border-t border-border/30 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] text-muted-foreground/50 font-medium">
                        © {currentYear} {companyName}. Todos los derechos reservados.
                    </span>

                    <span className="text-[11px] text-muted-foreground/40 flex items-center gap-1.5">
                        Desarrollado por{" "}
                        <a
                            href={developerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground/60 hover:text-foreground transition-colors underline decoration-dotted underline-offset-2"
                        >
                            {developerName}
                        </a>
                    </span>
                </div>
            </div>
        </footer>
    );
}
