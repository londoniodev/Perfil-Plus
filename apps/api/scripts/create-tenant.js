
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://admin:password123@localhost:5432/mauromera_local',
});

async function main() {
    await client.connect();
    console.log('Connected to DB');

    try {
        const query = `
            INSERT INTO "Tenant" ("name", "slug", "dbName", "status", "features", "createdAt", "updatedAt")
            VALUES ('Mauro Demo', 'mauro', 'mauromera_local', 'ACTIVE', ARRAY['RESTAURANT', 'ECOMMERCE', 'LMS', 'BLOG'], NOW(), NOW())
            ON CONFLICT ("slug") DO UPDATE 
            SET "name" = 'Mauro Demo', "dbName" = 'mauromera_local', "status" = 'ACTIVE'
            RETURNING *;
        `;
        const res = await client.query(query);
        console.log('✅ Tenant created/updated:', res.rows[0]);
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await client.end();
    }
}

main();
