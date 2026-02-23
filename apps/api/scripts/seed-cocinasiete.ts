import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Creando usuarios para tenant Cocina Siete...');

    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar que el tenant existe
    const tenant = await prisma.tenant.findFirst({ where: { slug: 'cocinasiete' } });
    if (!tenant) {
        console.error('❌ Tenant "cocinasiete" no encontrado.');
        process.exit(1);
    }
    const tenantId = tenant.id;
    console.log(`✅ Tenant encontrado: ${tenant.name} (ID: ${tenantId})`);

    const users = [
        { email: 'admin@cocinasiete.com', name: 'Admin Cocina Siete', role: 'ADMIN' as const },
        { email: 'mesero@cocinasiete.com', name: 'Mesero Demo', role: 'WAITER' as const },
        { email: 'cocina@cocinasiete.com', name: 'Cocina Demo', role: 'KITCHEN' as const },
        { email: 'caja@cocinasiete.com', name: 'Cajero Demo', role: 'CASHIER' as const },
    ];

    for (const u of users) {
        const existing = await prisma.user.findFirst({
            where: { tenantId, email: u.email }
        });

        if (existing) {
            await prisma.user.update({
                where: { id: existing.id },
                data: { password: hashedPassword, role: u.role, emailVerified: true },
            });
            console.log(`   🔄 Actualizado: ${u.email} (${u.role})`);
        } else {
            await prisma.user.create({
                data: {
                    tenantId,
                    email: u.email,
                    name: u.name,
                    password: hashedPassword,
                    role: u.role,
                    emailVerified: true,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.role}`,
                },
            });
            console.log(`   ✅ Creado: ${u.email} (${u.role})`);
        }
    }

    console.log('\n📋 Credenciales:');
    console.log(`   Password: ${password}`);
    users.forEach(u => console.log(`   - ${u.email} (${u.role})`));
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
