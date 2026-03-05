import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects"
        }
    }
});

async function main() {
    const modules = ['LMS', 'BLOG', 'ECOMMERCE', 'dashboard'];

    // Actualizar Mauro
    await prisma.tenant.update({
        where: { slug: 'mauromera' },
        data: { features: modules }
    });
    console.log("✅ Mauro: features actualizadas");

    // Actualizar Deborah
    await prisma.tenant.update({
        where: { slug: 'soydeborasoysaludable' },
        data: { features: modules }
    });
    console.log("✅ Deborah: features actualizadas");

    // Verificar
    const tenants = await prisma.tenant.findMany({
        where: { slug: { in: ['mauromera', 'soydeborasoysaludable'] } },
        select: { slug: true, features: true }
    });
    console.log(JSON.stringify(tenants, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
