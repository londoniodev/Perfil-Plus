import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";

export function Footer() {
    return (
        <footer className="bg-background border-t border-border py-12">
            <div className="container">
                {/* Full Footer - Hidden on Mobile */}
                <div className="hidden lg:flex flex-col items-center gap-8 mb-12">
                    {/* Logo y tagline */}
                    <div className="text-center">
                        <Image
                            src={siteConfig.branding.logo}
                            alt={siteConfig.branding.logoAlt}
                            width={120}
                            height={32}
                            className="h-8 w-auto mx-auto mb-4"
                        />
                        <span className="text-muted-foreground text-sm font-light tracking-wide">
                            Transformar el mundo empieza por cuidar el mundo interno.
                        </span>
                    </div>

                    {/* Enlaces */}
                    <nav className="flex items-center gap-8">
                        <Link href="/" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Inicio</Link>
                        <Link href="/portafolio" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Portafolio</Link>
                        <Link href="/servicios" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Servicios</Link>
                        <Link href="/blog" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Blog</Link>
                        <Link href={`https://wa.me/${siteConfig.contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Contacto</Link>
                        <Link href="/politica-de-privacidad" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Privacidad</Link>
                    </nav>
                </div>

                {/* Copyright & Credits - Adapted for Mobile */}
                <div className="flex flex-col lg:flex-row items-center justify-between pt-8 lg:pt-0 lg:border-t-0 border-t border-border/50">
                    <span className="hidden lg:block text-xs text-muted-foreground">
                        © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        Desarrollado por{" "}
                        <a href="https://portafolio.alvarolondoño.dev" target="_blank" rel="noopener noreferrer" className="italic hover:text-foreground transition-colors underline decoration-dotted">
                            Alvaro Londoño
                        </a>
                    </span>

                    {/* Mobile Only Copyright */}
                    <span className="lg:hidden mt-4 text-[10px] text-muted-foreground/50">
                        © {new Date().getFullYear()} {siteConfig.name}.
                    </span>
                </div>
            </div>
        </footer>
    );
}

