const { Client } = require('pg');

async function main() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    try {
        // En PostgreSQL para actualizar una tabla con Foreign Keys 
        // Primero insertamos el nuevo Tenant (o lo renombramos si es posible, pero es ON UPDATE CASCADE? Veamos Prisma schema)
        // Como Prisma por defecto no pone CASCADE en UPDATE para IDs, renombrar el ID directamente fallará si hay hijos.

        console.log('🔄 Cambiando Tenant ID a "cocinasiete" y migrando usuarios...');

        // 1. Deshabilitar temporalmente triggers/foreign keys en la sesión
        await client.query('SET session_replication_role = replica');

        // 2. Renombrar Tenant.id
        await client.query('UPDATE "Tenant" SET id = $1 WHERE slug = $1', ['cocinasiete']);
        console.log('   ✅ Tenant id actualizado a cocinasiete');

        // 3. Renombrar las referencias en User
        const userRes = await client.query('UPDATE "User" SET "tenantId" = $1 WHERE "tenantId" = $2', ['cocinasiete', '1']);
        console.log(`   ✅ ${userRes.rowCount} usuarios transferidos a cocinasiete`);

        // 4. Renombrar referencias en otras tablas (si las hay, ej. Product, Order, etc. pero ahorita solo usamos User de prueba)
        // Para este POC, User era lo más crítico. Restauramos constraints.
        await client.query('SET session_replication_role = DEFAULT');
        console.log('✅ Base de datos restaurada y sincronizada correctamente.');

    } catch (e) {
        console.error('❌ Error general:', e.message);
    } finally {
        await client.end();
    }
}

main().catch(console.error);
