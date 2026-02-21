// script para poblar db_cocinasiete_web directamente
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/db_cocinasiete_web?schema=public";

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    });

    try {
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
            const exists = await prisma.user.findUnique({
                where: { email: user.email }
            });

            if (exists) {
                await prisma.user.update({
                    where: { email: user.email },
                    data: { role: user.role, password: passwordHash }
                });
            } else {
                await prisma.user.create({
                    data: user
                });
            }
            console.log(`✅ Usuario creado/actualizado: ${user.name} (${user.role}) - ${user.email}`);
        }

        console.log('🎉 Todos los usuarios de prueba han sido creados (Password: 123456)');
    } catch (e) {
        console.error("Error detallado:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
