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

        const recipesRes = await client.query(`
      SELECT 
        p.name AS "productName",
        r.id AS "recipeId",
        json_agg(
          json_build_object(
            'ingredient', i.name,
            'qty', ri.quantity,
            'unit', i.unit
          )
        ) AS ingredients
      FROM "Recipe" r
      JOIN "Product" p ON r."productId" = p.id
      JOIN "RecipeIngredient" ri ON ri."recipeId" = r.id
      JOIN "InventoryItem" i ON ri."inventoryItemId" = i.id
      WHERE r."tenantId" = $1
      GROUP BY p.name, r.id
    `, [tenantId]);

        console.log(`FOUND ${recipesRes.rows.length} RECIPES`);
        console.log(JSON.stringify(recipesRes.rows, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await client.end();
    }
}

main();
