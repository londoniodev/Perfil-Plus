import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:postgres@localhost:5432/db_cocinasiete_web?schema=public"
        }
    }
});

async function main() {
    console.log('🌱 Creando usuarios de prueba para Cocina Siete...');

    const passwordHash = await bcrypt.hash('123456', 10);

    const users = [
        {
            email: 'admin@cocinasiete.com',
            name: 'Administrador Siete',
            role: 'ADMIN',
            password: passwordHash,
            emailVerified: true
        },
        {
            email: 'cocina@cocinasiete.com',
            name: 'Chef Siete',
            role: 'KITCHEN',
            password: passwordHash,
            emailVerified: true
        },
        {
            email: 'mesero@cocinasiete.com',
            name: 'Mesero Siete',
            role: 'WAITER',
            password: passwordHash,
            emailVerified: true
        },
        {
            email: 'caja@cocinasiete.com',
            name: 'Cajero Siete',
            role: 'CASHIER',
            password: passwordHash,
            emailVerified: true
        }
    ];

    for (const user of users) {
        // Upsert para no duplicar si se ejecuta varias veces
        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                role: user.role as any, // Asegurar el rol por si cambió
                password: passwordHash
            },
            create: {
                email: user.email,
                name: user.name,
                role: user.role as any,
                password: passwordHash,
                emailVerified: true
            }
        });
        console.log(`✅ Usuario creado: ${user.name} (${user.role}) - ${user.email}`);
    }

    console.log('🎉 Todos los usuarios de prueba han sido creados (Password: 123456)');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
