import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects"
        }
    }
});

async function main() {
    const mauroId = 'cm7mm52c4000008jsh45x2b9q';
    const deborahId = 'cm7mman6x000208jsf3h9h2k1';

    for (const [name, tenantId] of [['Mauro', mauroId], ['Deborah', deborahId]]) {
        console.log(`\n========== ${name} (${tenantId}) ==========`);

        const posts = await prisma.post.count({ where: { tenantId } });
        console.log(`Blog Posts: ${posts}`);

        const products = await prisma.product.count({ where: { tenantId } });
        console.log(`Productos: ${products}`);

        const courses = await prisma.course.count({ where: { tenantId } });
        console.log(`Cursos: ${courses}`);

        const categories = await prisma.category.count({ where: { tenantId } });
        console.log(`Categorías: ${categories}`);

        const storeSettings = await prisma.storeSettings.findFirst({ where: { tenantId } });
        console.log(`Store Settings: ${storeSettings ? 'SÍ' : 'NO'}`);

        const systemSetting = await prisma.systemSetting.findFirst({ where: { tenantId } });
        console.log(`System Settings: ${systemSetting ? 'SÍ' : 'NO'}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
