const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://admin:password123@localhost:5432/mauromera_local"
});

async function main() {
    try {
        await client.connect();
        const res = await client.query('SELECT slug, "dbName" FROM "Tenant"');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
