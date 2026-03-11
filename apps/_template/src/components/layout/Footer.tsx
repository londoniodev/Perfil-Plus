import { SiteFooter } from "@alvarosky/ui";
import { siteConfig } from "@/config/site";
import { getTenantId } from "@/lib/config-server";
import { getTenantNavConfig } from "@/config/tenant-nav";

export async function Footer({ logo }: { logo?: string }) {
    const tenantId = await getTenantId();
    const config = getTenantNavConfig(tenantId);

    const businessName = config.companyName;
    const businessEmail = config.contact.email;
    const businessPhone = config.contact.phone;
    const footerLinks = config.footer;

    const finalLogo = logo || siteConfig.branding.logo;

    return (
        <div className="hidden md:flex flex-col w-full bg-background relative z-10 border-t border-border/40 pb-8">
            <SiteFooter
                logo={finalLogo}
                logoAlt={siteConfig.branding.logoAlt}
                tagline={config.tagline}
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
