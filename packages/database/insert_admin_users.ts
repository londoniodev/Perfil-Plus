import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects"
        }
    }
});

async function main() {
    const tenants = await prisma.tenant.findMany();
    const mauroTenant = tenants.find(t => t.slug === 'mauromera');
    const deborahTenant = tenants.find(t => t.slug === 'soydeborasoysaludable');

    if (!mauroTenant || !deborahTenant) {
        console.error("No se encontraron los tenants.");
        return;
    }

    console.log("=== ACTUALIZANDO TENANTS CON MODULES ===");
    const modules = ['LMS', 'BLOG', 'ECOMMERCE'];

    await prisma.tenant.update({
        where: { id: mauroTenant.id },
        data: { features: modules }
    });
    console.log("Tenant Mauro actualizado con features.");

    await prisma.tenant.update({
        where: { id: deborahTenant.id },
        data: { features: modules }
    });
    console.log("Tenant Deborah actualizado con features.");

    console.log("\n=== CREANDO USUARIOS ADMIN ===");

    // Deborah
    const deborahEmail = 'soydeborasoysaludable@gmail.com';
    const deborahPassword = await bcrypt.hash('Gordolindo0218*', 10);

    const deborahUser = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: deborahTenant.id,
                email: deborahEmail
            }
        },
        update: {
            password: deborahPassword,
            role: 'ADMIN',
            emailVerified: true
        },
        create: {
            tenantId: deborahTenant.id,
            email: deborahEmail,
            password: deborahPassword,
            name: 'Deborah Moscoso',
            role: 'ADMIN',
            emailVerified: true
        }
    });
    console.log(`Usuario ADMIN Deborah creado/actualizado: ${deborahUser.email}`);

    // Mauro
    const mauroEmail = 'admin@mauromera.com';
    const mauroPassword = await bcrypt.hash('Meraneitor123*', 10);

    const mauroUser = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: mauroTenant.id,
                email: mauroEmail
            }
        },
        update: {
            password: mauroPassword,
            role: 'ADMIN',
            emailVerified: true
        },
        create: {
            tenantId: mauroTenant.id,
            email: mauroEmail,
            password: mauroPassword,
            name: 'Mauro Mera',
            role: 'ADMIN',
            emailVerified: true
        }
    });
    console.log(`Usuario ADMIN Mauro creado/actualizado: ${mauroUser.email}`);

}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
