const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: "postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects"
    });

    await client.connect();

    try {
        const tenantRes = await client.query("SELECT id FROM \"Tenant\" WHERE slug = 'cocinasiete'");
        if (tenantRes.rows.length === 0) {
            console.log("Tenant not found");
            return;
        }
        const tenantId = tenantRes.rows[0].id;
        console.log("TENANT_ID:", tenantId);

        const productsRes = await client.query("SELECT id, name FROM \"Product\" WHERE \"tenantId\" = $1 AND \"deletedAt\" IS NULL", [tenantId]);
        console.log("PRODUCTS:");
        console.log(JSON.stringify(productsRes.rows, null, 2));

        const itemsRes = await client.query("SELECT id, name, unit FROM \"InventoryItem\" WHERE \"tenantId\" = $1 AND \"isActive\" = true", [tenantId]);
        console.log("INVENTORY_ITEMS:");
        console.log(JSON.stringify(itemsRes.rows, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await client.end();
    }
}

main();
