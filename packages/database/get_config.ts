import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: { url: "postgresql://admin:password123@localhost:5432/mauromera_local?schema=public" }
    },
});

async function main() {
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'MERCADOPAGO_CONFIG' } });
    if (setting) console.log(JSON.stringify(setting.value, null, 2));
    else console.log('not found');
}
main().finally(() => prisma.$disconnect());
