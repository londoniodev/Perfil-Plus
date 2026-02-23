const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects'
});

async function applyMigrations() {
    try {
        await client.connect();

        console.log("Conectado a la base de datos de producción...");

        // 1. Create PlatformUser Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS "PlatformUser" (
                "id" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "password" TEXT NOT NULL,
                "name" TEXT,
                "role" TEXT NOT NULL DEFAULT 'SUPERADMIN',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PlatformUser_pkey" PRIMARY KEY ("id")
            );
        `);
        await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "PlatformUser_email_key" ON "PlatformUser"("email");`);
        console.log("✅ PlatformUser table checked/created.");

        // 2. Create OrderDeliveryAnalytics Table
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

        // 3. Add FK for OrderDeliveryAnalytics (safe try/catch)
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

        // 4. Alter Lead table (email optional + drop unique)
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

        console.log("🎉 All migrations applied safely.");

    } catch (e) {
        console.error("❌ Fatal Error: ", e);
    } finally {
        await client.end();
    }
}

applyMigrations();
