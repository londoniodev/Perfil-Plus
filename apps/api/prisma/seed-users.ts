import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Creando usuarios Admin y User...');

    const password = 'Alvarojose1998*';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Admin User
    const adminEmail = 'london.dev@outlook.com';

    const existingAdmin = await prisma.user.findFirst({ where: { email: adminEmail } });
    if (existingAdmin) {
        await prisma.user.update({
            where: { id: existingAdmin.id },
            data: { password: hashedPassword, role: 'ADMIN', emailVerified: true },
        });
    } else {
        await prisma.user.create({
            data: {
                tenantId: 'default',
                email: adminEmail,
                name: 'London Dev',
                password: hashedPassword,
                role: 'ADMIN',
                emailVerified: true,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=London'
            }
        });
    }
    console.log('✅ Admin creado:', adminEmail);

    // 2. Normal User
    const userEmail = 'gambito0202@gmail.com';
    const existingUser = await prisma.user.findFirst({ where: { email: userEmail } });
    if (existingUser) {
        await prisma.user.update({
            where: { id: existingUser.id },
            data: { password: hashedPassword, role: 'USER', emailVerified: true },
        });
    } else {
        await prisma.user.create({
            data: {
                tenantId: 'default',
                email: userEmail,
                name: 'Gambito User',
                password: hashedPassword,
                role: 'USER',
                emailVerified: true,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gambito'
            }
        });
    }
    console.log('✅ User creado:', userEmail);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
