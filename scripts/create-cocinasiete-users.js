const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Como "db_cocinasiete_web" no existía, el comando pg_databases reveló que 
// tenías dos: "db_cocina_siete" y "db_cocinasiete". Usaré la última.
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'db_cocinasiete',
    password: 'postgres',
    port: 5432,
});

async function main() {
    try {
        console.log('🌱 Creando usuarios de prueba para Cocina Siete...');

        await pool.query('SELECT 1');

        const passwordHash = await bcrypt.hash('123456', 10);

        const users = [
            {
                email: 'admin@cocinasiete.com',
                name: 'Administrador Siete',
                role: 'ADMIN',
                password: passwordHash,
            },
            {
                email: 'cocina@cocinasiete.com',
                name: 'Chef Siete',
                role: 'KITCHEN',
                password: passwordHash,
            },
            {
                email: 'mesero@cocinasiete.com',
                name: 'Mesero Siete',
                role: 'WAITER',
                password: passwordHash,
            },
            {
                email: 'caja@cocinasiete.com',
                name: 'Cajero Siete',
                role: 'CASHIER',
                password: passwordHash,
            }
        ];

        for (const user of users) {
            const res = await pool.query('SELECT id FROM "User" WHERE email = $1', [user.email]);

            if (res.rows.length > 0) {
                await pool.query(
                    'UPDATE "User" SET role = $1, password = $2, "emailVerified" = true WHERE email = $3',
                    [user.role, user.password, user.email]
                );
                console.log(`✅ Actualizado: ${user.name} (${user.role}) - ${user.email}`);
            } else {
                const cuidLikeId = 'c' + Math.random().toString(36).substr(2, 24);

                await pool.query(
                    'INSERT INTO "User" (id, email, name, role, password, "emailVerified", "updatedAt") VALUES ($1, $2, $3, $4, $5, true, NOW())',
                    [cuidLikeId, user.email, user.name, user.role, user.password]
                );
                console.log(`✅ Creado: ${user.name} (${user.role}) - ${user.email}`);
            }
        }

        console.log('\n🎉 Todos los usuarios de prueba han sido creados (Password: 123456)');

    } catch (err) {
        console.error('❌ Error de base de datos:', err);
    } finally {
        await pool.end();
    }
}

main();
