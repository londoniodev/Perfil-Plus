import { SiteFooter } from "@alvarosky/ui";
import { siteConfig } from "@/config/site";
import { getTenantId } from "@/lib/config-server";

export async function Footer({ logo }: { logo?: string }) {
    const tenantId = await getTenantId();

    const isDeborah = tenantId === "soydeborasoysaludable" || tenantId === "deborahmoscoso" || tenantId === "cm7mman6x000208jsf3h9h2k1";

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

    const finalLogo = logo || siteConfig.branding.logo;

    return (
        <div className="hidden md:flex flex-col w-full bg-background relative z-10 border-t border-border/40 pb-8">
            <SiteFooter
                logo={finalLogo}
                logoAlt={siteConfig.branding.logoAlt}
                tagline={isDeborah ? "Transformando físicos y mentalidades." : "Transformar el mundo empieza por cuidar el mundo interno."}
                links={footerLinks}
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
