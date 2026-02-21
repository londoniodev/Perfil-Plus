import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

// Helper for logging
const log = (msg: string) => console.log(`[SEED] ${msg}`);

// Load .env manually
function loadEnv() {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        log(`Loading env from ${envPath}`);
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    } else {
        log(`No .env found at ${envPath}`);
    }
}

loadEnv();

async function seedEmployeesForConnection(prisma: PrismaClient, contextName: string) {
    log(`Seeding employees for: ${contextName}...`);

    const password = 'staff123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    const employees = [
        {
            email: 'mesero@demo.com',
            name: 'Carlos Mesero',
            role: 'WAITER',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Waiter'
        },
        {
            email: 'cocina@demo.com',
            name: 'María Cocina',
            role: 'KITCHEN',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kitchen'
        },
        {
            email: 'cajero@demo.com',
            name: 'Pedro Cajero',
            role: 'CASHIER',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cashier'
        }
    ] as const;

    for (const emp of employees) {
        try {
            await prisma.user.upsert({
                where: { email: emp.email },
                update: {
                    password: hashedPassword,
                    role: emp.role as any, // Cast to any to avoid TS issues if types are old
                    emailVerified: true,
                },
                create: {
                    email: emp.email,
                    name: emp.name,
                    password: hashedPassword,
                    role: emp.role as any,
                    emailVerified: true,
                    avatar: emp.avatar,
                },
            });
            log(`   ✅ ${emp.name} (${emp.role}) created/updated.`);
        } catch (error: any) {
            log(`   ❌ Failed to seed ${emp.email}: ${error.message.split('\n')[0]}`);
            // If error is related to Role enum, it means DB is not migrated
            if (error.message.includes('role')) {
                log(`      ⚠️  Hint: Database might not have the new roles. Run migrations.`);
            }
        }
    }
}

async function main() {
    log('🌱 Starting Multi-Tenant Employee Seed...');

    // 1. Connect to Master DB (default)
    const masterPrisma = new PrismaClient();

    try {
        // Seed Master DB
        await seedEmployeesForConnection(masterPrisma, "Master Database");

        // 2. Fetch Tenants
        // Check if Tenant model exists in this client (it should)
        if (!masterPrisma.tenant) {
            log("❌ Tenant model not found in PrismaClient. Skipping tenant seeding.");
            return;
        }

        const tenants = await masterPrisma.tenant.findMany();
        log(`Found ${tenants.length} tenants in Master DB.`);

        const baseUrl = process.env.DATABASE_URL_BASE;
        if (!baseUrl) {
            log("⚠️  DATABASE_URL_BASE not defined in .env. Cannot derive tenant DB URLs.");
            log("    Skipping tenant seeding.");
            return;
        }

        // Clean base URL
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

        // 3. Loop and Seed each Tenant
        for (const tenant of tenants) {
            const dbName = tenant.dbName;
            const tenantSlug = tenant.slug;
            const dbUrl = `${cleanBaseUrl}/${dbName}`;

            log(`\nConnecting to Tenant: ${tenantSlug} (DB: ${dbName})...`);

            const tenantPrisma = new PrismaClient({
                datasources: {
                    db: { url: dbUrl }
                }
            });

            try {
                await tenantPrisma.$connect();
                await seedEmployeesForConnection(tenantPrisma, `Tenant: ${tenantSlug}`);
            } catch (error: any) {
                log(`   ❌ Could not connect or seed tenant ${tenantSlug}: ${error.message.split('\n')[0]}`);
            } finally {
                await tenantPrisma.$disconnect();
            }
        }

    } catch (e: any) {
        console.error('❌ Critical Error:', e);
        process.exit(1);
    } finally {
        await masterPrisma.$disconnect();
    }

    log('\n──────────────────────────────────────────');
    log('📋 Test Credentials (valid for all seeded databases):');
    log(`   Password: staff123456`);
    log('──────────────────────────────────────────');
}

main();
