import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Creando usuarios Admin y User...');

    const password = 'Alvarojose1998*';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Admin User
    // Assuming london.dev@outlook.com based on common pattern, assuming user typo or shorthand
    const adminEmail = 'london.dev@outlook.com';

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            emailVerified: true
        },
        create: {
            email: adminEmail,
            name: 'London Dev',
            password: hashedPassword,
            role: 'ADMIN',
            emailVerified: true,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=London'
        }
    });
    console.log('✅ Admin creado:', admin.email);

    // 2. Normal User
    const userEmail = 'gambito0202@gmail.com';
    const user = await prisma.user.upsert({
        where: { email: userEmail },
        update: {
            password: hashedPassword,
            role: 'USER',
            emailVerified: true
        },
        create: {
            email: userEmail,
            name: 'Gambito User',
            password: hashedPassword,
            role: 'USER',
            emailVerified: true,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gambito'
        }
    });
    console.log('✅ User creado:', user.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
