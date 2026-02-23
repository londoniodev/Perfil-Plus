const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    const hash = await bcrypt.hash('123456', 10);
    const tenantId = 'cocinasiete';

    const users = [
        { email: 'admin@cocinasiete.com', name: 'Admin Cocina Siete', role: 'ADMIN' },
        { email: 'mesero@cocinasiete.com', name: 'Mesero Demo', role: 'WAITER' },
        { email: 'cocina@cocinasiete.com', name: 'Cocina Demo', role: 'KITCHEN' },
        { email: 'caja@cocinasiete.com', name: 'Cajero Demo', role: 'CASHIER' },
    ];

    for (const u of users) {
        await client.query('DELETE FROM "User" WHERE email = $1', [u.email]);

        await client.query(
            `INSERT INTO "User" (id, "tenantId", email, password, name, role, "emailVerified", "createdAt", "updatedAt")
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5::"Role", true, NOW(), NOW())`,
            [tenantId, u.email, hash, u.name, u.role]
        );
        console.log(`✅ Creado: ${u.email} (${u.role})`);
    }

    await client.end();
}
main().catch(console.error);
