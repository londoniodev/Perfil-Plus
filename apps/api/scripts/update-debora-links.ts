import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Fixing Deborah's missing navigation links...");
    const slug = "soydeborasoysaludable";

    const tenant = await prisma.tenant.findFirst({ where: { slug } });
    if (!tenant) {
        console.log(`Tenant ${slug} not found in DB.`);
        return;
    }

    const menuSetting = await prisma.systemSetting.findFirst({
        where: { tenantId: tenant.id, key: 'menu' }
    });

    if (menuSetting) {
        const existingVal: any = menuSetting.value || {};
        const headerLinks = [
            { label: "Inicio", href: "/" },
            { label: "Quien Soy", href: "/quien-soy" },
            { label: "Logros", href: "/logros" },
            { label: "Emprende", href: "/emprende" },
            { label: "Cursos", href: "/cursos" },
            { label: "Blog", href: "/blog" },
        ];
        // Footer stays the same maybe? The user just mentioned missing header links. But let's add Cursos and Quien soy to footer too if missing?
        // Let's just fix the header right now as requested.

        await prisma.systemSetting.update({
            where: { id: menuSetting.id },
            data: { 
                value: {
                    ...existingVal,
                    headerLinks
                }
            }
        });
        console.log("Deborah links successfully updated!");
    } else {
        console.log("Deborah has no menu settings, this is unexpected since we just ran a migration!");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
