const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    console.log('✅ Conectado a la DB');

    const hash = await bcrypt.hash('123456', 10);

    // Get tenant ID for cocinasiete
    const tenantRes = await client.query(`SELECT id FROM "Tenant" WHERE slug = 'cocinasiete'`);
    if (tenantRes.rows.length === 0) {
        console.error('❌ Tenant cocinasiete no encontrado');
        process.exit(1);
    }
    const tenantId = tenantRes.rows[0].id;
    console.log(`✅ Tenant encontrado, ID: ${tenantId}`);

    const users = [
        { email: 'admin@cocinasiete.com', name: 'Admin Cocina Siete', role: 'ADMIN' },
        { email: 'mesero@cocinasiete.com', name: 'Mesero Demo', role: 'WAITER' },
        { email: 'cocina@cocinasiete.com', name: 'Cocina Demo', role: 'KITCHEN' },
        { email: 'caja@cocinasiete.com', name: 'Cajero Demo', role: 'CASHIER' },
    ];

    for (const u of users) {
        const exists = await client.query(
            `SELECT id FROM "User" WHERE "tenantId" = $1 AND email = $2`,
            [String(tenantId), u.email]
        );

        if (exists.rows.length > 0) {
            await client.query(
                `UPDATE "User" SET password = $1, role = $2::\"Role\", "emailVerified" = true, "updatedAt" = NOW() WHERE id = $3`,
                [hash, u.role, exists.rows[0].id]
            );
            console.log(`   🔄 Actualizado: ${u.email}`);
        } else {
            await client.query(
                `INSERT INTO "User" (id, "tenantId", email, password, name, role, "emailVerified", "createdAt", "updatedAt")
                 VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5::"Role", true, NOW(), NOW())`,
                [String(tenantId), u.email, hash, u.name, u.role]
            );
            console.log(`   ✅ Creado: ${u.email} (${u.role})`);
        }
    }

    console.log('\n📋 Credenciales:');
    console.log('   Password: 123456');
    users.forEach(u => console.log(`   - ${u.email} (${u.role})`));

    await client.end();
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
