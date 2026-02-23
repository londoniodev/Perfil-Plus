const { Client } = require('pg');

// Using the tenant database 'db_cocina_siete'
const connectionString = 'postgresql://postgres:alvarojose1998@72.62.161.199:5432/db_cocina_siete';
const client = new Client({ connectionString });

async function applyTenantMigrations() {
    try {
        await client.connect();

        console.log("Conectado a la base de datos del restaurante: db_cocina_siete...");

        // 1. Create OrderDeliveryAnalytics Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS "OrderDeliveryAnalytics" (
                "id" TEXT NOT NULL,
                "orderId" TEXT NOT NULL,
                "pendingAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "preparingAt" TIMESTAMP(3),
                "shippedAt" TIMESTAMP(3),
                "deliveredAt" TIMESTAMP(3),
                "timeToPrepare" INTEGER,
                "timeToShip" INTEGER,
                "timeToDeliver" INTEGER,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "OrderDeliveryAnalytics_pkey" PRIMARY KEY ("id")
            );
        `);
        await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "OrderDeliveryAnalytics_orderId_key" ON "OrderDeliveryAnalytics"("orderId");`);
        console.log("✅ OrderDeliveryAnalytics table checked/created.");

        // 2. Add FK for OrderDeliveryAnalytics (safe try/catch)
        try {
            await client.query(`
                ALTER TABLE "OrderDeliveryAnalytics" 
                ADD CONSTRAINT "OrderDeliveryAnalytics_orderId_fkey" 
                FOREIGN KEY ("orderId") REFERENCES "Order"("id") 
                ON DELETE CASCADE ON UPDATE CASCADE;
            `);
            console.log("✅ OrderDeliveryAnalytics foreign key added.");
        } catch (e) {
            if (e.code === '42710') {
                console.log("⚠️ FK OrderDeliveryAnalytics_orderId_fkey already exists.");
            } else {
                console.log("⚠️ FK Error: ", e.message);
            }
        }

        // 3. Alter Lead table (email optional + drop unique)
        try {
            await client.query(`ALTER TABLE "Lead" ALTER COLUMN "email" DROP NOT NULL;`);
            console.log("✅ Lead.email is now optional.");
        } catch (e) {
            console.log("⚠️ Lead email alter Error: ", e.message);
        }

        try {
            await client.query(`DROP INDEX IF EXISTS "Lead_email_key";`);
            console.log("✅ Lead_email_key unique index dropped.");
        } catch (e) {
            console.log("⚠️ Drop unique index Error: ", e.message);
        }

        console.log("🎉 All tenant migrations applied safely.");

    } catch (e) {
        console.error("❌ Fatal Error: ", e);
    } finally {
        await client.end();
    }
}

applyTenantMigrations();
