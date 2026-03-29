import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface FooterLink {
    label: string;
    href: string;
    external?: boolean;
}

export interface SiteFooterProps {
    logo: string;
    logoAlt?: string;
    tagline?: string;
    links: FooterLink[];
    companyName: string;
    developerName?: string;
    developerUrl?: string;
    className?: string;
    contactInfo?: React.ReactNode;
}

export function SiteFooter({
    logo,
    logoAlt = "Logo",
    tagline,
    links,
    companyName,
    developerName = "Alvaro Londoño",
    developerUrl = "https://perfil.plus",
    className,
    contactInfo,
}: SiteFooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={cn("bg-background border-t border-border py-6", className)}>
            <div className="container mx-auto px-4 md:px-8">
                {/* Full Footer - Hidden on Mobile */}
                <div className="hidden lg:flex flex-col items-center gap-8 mb-12">
                    {/* Logo y tagline */}
                    <div className="text-center">
                        <div className="relative h-8 w-auto mx-auto mb-4 inline-block">
                            <Image
                                src={logo}
                                alt={logoAlt}
                                width={120}
                                height={32}
                                className="h-8 w-auto"
                            />
                        </div>

                        {tagline && (
                            <span className="block text-muted-foreground text-sm font-light tracking-wide">
                                {tagline}
                            </span>
                        )}
                    </div>

                    {/* Enlaces */}
                    <nav className="flex items-center gap-8">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                target={link.external ? "_blank" : undefined}
                                rel={link.external ? "noopener noreferrer" : undefined}
                                className="text-foreground/60 hover:text-foreground transition-colors text-sm"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Copyright & Credits - Adapted for Mobile */}
                <div className="flex flex-col lg:flex-row items-center justify-between pt-8 lg:pt-0 lg:border-t-0 border-t border-border/50 gap-4">
                    <span className="hidden lg:block text-xs text-muted-foreground whitespace-nowrap">
                        © {currentYear} {companyName}. Todos los derechos reservados.
                    </span>

                    {contactInfo && (
                        <div className="flex items-center">
                            {contactInfo}
                        </div>
                    )}

                    <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                        Desarrollado por{" "}
                        <a
                            href={developerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="italic hover:text-foreground transition-colors underline decoration-dotted"
                        >
                            {developerName}
                        </a>
                    </span>

                    {/* Mobile Only Copyright */}
                    <span className="lg:hidden mt-4 text-[10px] text-muted-foreground/50">
                        © {currentYear} {companyName}.
                    </span>
                </div>
            </div>
        </footer>
    );
}
