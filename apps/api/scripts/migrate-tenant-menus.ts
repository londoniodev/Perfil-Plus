import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TENANT_CONFIGS: Record<string, any> = {
    "soydeborasoysaludable": {
        companyName: "Soy Debora Soy Saludable",
        tagline: "Psicología, cultura y decisiones conscientes",
        contactEmail: "contacto@soydeborasoysaludable.com",
        contactPhone: "+57 300 000 0000",
        headerLinks: [
            { label: "Inicio", href: "/" },
            { label: "Logros", href: "/logros" },
            { label: "Emprende", href: "/emprende" },
            { label: "Tienda", href: "/tienda" },
            { label: "Blog", href: "/blog" },
        ],
        footerLinks: [
            { label: "Inicio", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: "Tienda", href: "/tienda" },
            { label: "Contacto", href: "https://wa.me/573000000000", external: true },
            { label: "Términos y Condiciones", href: "/terminos-y-condiciones" },
        ]
    },
    "mauromera": {
        companyName: "Mauro Mera",
        tagline: "Fotografía Profesional",
        contactEmail: "hola@mauromera.com",
        contactPhone: "+57 300 000 0000",
        headerLinks: [
            { label: "Inicio", href: "/" },
            { label: "Portafolio", href: "/portafolio" },
            { label: "Servicios", href: "/servicios" },
            { label: "Cursos", href: "/cursos" },
            { label: "Blog", href: "/blog" },
        ],
        footerLinks: [
            { label: "Inicio", href: "/" },
            { label: "Cursos", href: "/cursos" },
            { label: "Blog", href: "/blog" },
            { label: "Contacto", href: "https://wa.me/573000000000", external: true },
            { label: "Términos y Condiciones", href: "/terminos" },
        ]
    },
    "cocinasiete": {
        companyName: "Cocina Siete",
        tagline: "Software P.O.S y Sistema Multi-Sucursal para Restaurantes.",
        contactEmail: "hola@cocinasiete.com",
        contactPhone: "+57 300 000 0000",
        headerLinks: [
            { label: "Inicio", href: "/" },
            { label: "Planes", href: "/#planes" },
            { label: "Características", href: "/#caracteristicas" },
            { label: "Blog", href: "/blog" },
            { label: "Mi Cuenta", href: "/perfil" },
        ],
        footerLinks: [
            { label: "Inicio", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: "Ingresar", href: "/login" },
            { label: "Contacto", href: "https://wa.me/573000000000", external: true },
            { label: "Términos y Condiciones", href: "/terminos-y-condiciones" },
        ]
    }
};

async function main() {
    console.log("Starting DB Menu Migration...");

    for (const [slug, config] of Object.entries(TENANT_CONFIGS)) {
        console.log(`\nProcessing tenant: ${slug}`);
        const tenant = await prisma.tenant.findFirst({ where: { slug } });
        
        if (!tenant) {
            console.log(`Tenant ${slug} not found in DB. Skipping.`);
            continue;
        }

        const menuSetting = await prisma.systemSetting.findFirst({
            where: { tenantId: tenant.id, key: 'menu' }
        });

        const existingMenuValue = menuSetting?.value ? (menuSetting.value as any) : {};

        const newMenuValue = {
            ...existingMenuValue,
            headerLinks: config.headerLinks,
            footerLinks: config.footerLinks,
            contactEmail: config.contactEmail,
            contactPhone: config.contactPhone,
            tagline: config.tagline
            // we leave logo alone!
        };

        if (menuSetting) {
            await prisma.systemSetting.update({
                where: { id: menuSetting.id },
                data: { value: newMenuValue }
            });
            console.log(`Updated SystemSetting for ${slug}`);
        } else {
            await prisma.systemSetting.create({
                data: {
                    tenantId: tenant.id,
                    key: 'menu',
                    value: newMenuValue,
                    isPublic: true
                }
            });
            console.log(`Created SystemSetting for ${slug}`);
        }
        
        // Let's also update the Tenant companyName because previously it relied on config
        await prisma.tenant.update({
            where: { id: tenant.id },
            data: { 
                name: config.companyName,
                ownerEmail: tenant.ownerEmail || config.contactEmail,
                notes: config.tagline
            }
        });
        console.log(`Updated Tenant profile info for ${slug}`);
    }

    console.log("\nMigration completed successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
