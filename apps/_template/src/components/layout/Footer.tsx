import { SiteFooter } from "@alvarosky/ui";
import { siteConfig } from "@/config/site";
import { getTenantId } from "@/lib/config-server";

export async function Footer() {
    const tenantId = await getTenantId();

    const isDeborah = tenantId === "soydeborasoysaludable" || tenantId === "deborahmoscoso";

    const businessName = isDeborah ? "Deborah Moscoso" : siteConfig.name;
    const businessEmail = isDeborah ? "info@soydeborasoysaludable.com" : siteConfig.email;
    const businessPhone = isDeborah ? "+1 305-555-1234" : siteConfig.phone; // Placeholder realista

    const footerLinks = [
        { label: "Inicio", href: "/" },
        { label: "Servicios", href: "/servicios" },
        { label: "Tienda", href: "/tienda" },
        {
            label: "Contacto",
            href: `https://wa.me/${businessPhone.replace(/[^0-9]/g, '')}`,
            external: true
        },
        { label: "Privacidad", href: "/politica-de-privacidad" },
        { label: "Términos y Condiciones", href: "/terminos-y-condiciones" },
    ];

    return (
        <div className="flex flex-col w-full bg-background relative z-10">
            <SiteFooter
                logo={siteConfig.branding.logo}
                logoAlt={siteConfig.branding.logoAlt}
                tagline={isDeborah ? "Transformando físicos y mentalidades." : "Transformar el mundo empieza por cuidar el mundo interno."}
                links={footerLinks}
                companyName={businessName}
            />
            {/* Meta Legal & Contact Info Band */}
            <div className="border-t border-border/40 py-6 bg-zinc-50 dark:bg-zinc-950">
                <div className="container mx-auto px-4 text-center flex flex-col items-center justify-center gap-2">
                    <p className="text-sm text-muted-foreground font-medium">
                        {businessName}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm text-muted-foreground/80">
                        <span>Email: <a href={`mailto:${businessEmail}`} className="hover:text-foreground hover:underline transition-all">{businessEmail}</a></span>
                        <span className="hidden sm:inline text-border">•</span>
                        <span>Teléfono: {businessPhone}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
