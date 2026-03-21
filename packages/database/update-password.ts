import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const userId = 'cmmwypepk0001nvh950fp8vbf'; // SuperAdmin Alvaro Londoño
    const newPassword = 'Alvarojose1998*';

    console.log('🔒 Hasheando nueva contraseña...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log('📡 Actualizando base de datos...');
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
            failedLoginAttempts: 0,
            lockedUntil: null
        }
    });

    console.log(`✅ Contraseña actualizada con éxito para el usuario: ${user.email}`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
