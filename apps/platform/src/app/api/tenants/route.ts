import { NextRequest, NextResponse } from "next/server";
import { prismaManagement, getTenantPool, closeTenantPool } from "@alvarosky/database-management";
import { Pool } from "pg";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Interface para el body del POST
interface CreateTenantBody {
    name: string;
    slug: string;
    ownerEmail?: string;
    plan?: string;
    // Configuración técnica
    currency: string;
    mpPublicKey?: string;
    mpAccessToken?: string;
    mpWebhookSecret?: string;
    mpClientId?: string;
    mpClientSecret?: string;
    smtpJson?: string;
    // Features
    blogEnabled?: boolean;
    storeEnabled?: boolean;
    lmsEnabled?: boolean;
    portfolioEnabled?: boolean;
    whatsappEnabled?: boolean;
    restaurantEnabled?: boolean;
}

export async function GET() {
    try {
        const tenants = await prismaManagement.tenant.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(tenants);
    } catch (error) {
        console.error("Error fetching tenants:", error);
        return NextResponse.json({ error: "Failed to fetch tenants" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateTenantBody = await request.json();
        const {
            name,
            slug,
            ownerEmail,
            plan,
            currency,
            mpPublicKey,
            mpAccessToken,
            mpWebhookSecret,
            mpClientId,
            mpClientSecret,
            smtpJson,
            blogEnabled,
            storeEnabled,
            lmsEnabled,
            portfolioEnabled,
            whatsappEnabled,
            restaurantEnabled,
        } = body;

        // Validate slug
        if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
            return NextResponse.json(
                { error: "Slug inválido. Solo letras minúsculas, números y guiones." },
                { status: 400 }
            );
        }

        // Check if slug exists
        const existing = await prismaManagement.tenant.findUnique({
            where: { slug },
        });
        if (existing) {
            return NextResponse.json(
                { error: "Ya existe un tenant con ese slug" },
                { status: 400 }
            );
        }

        // Validar SMTP JSON si se proporciona
        let smtpConfig = null;
        if (smtpJson && smtpJson.trim()) {
            try {
                smtpConfig = JSON.parse(smtpJson);
            } catch {
                return NextResponse.json(
                    { error: "El JSON de SMTP no es válido" },
                    { status: 400 }
                );
            }
        }

        const dbName = `db_${slug.replace(/-/g, "_")}`;

        // Prepare initial features list
        const initialFeatures: string[] = [];
        if (blogEnabled !== false) initialFeatures.push('blog');
        if (storeEnabled !== false) initialFeatures.push('shop'); // store -> shop
        if (lmsEnabled === true) initialFeatures.push('lms');
        if (portfolioEnabled === true) initialFeatures.push('portfolio');
        if (whatsappEnabled === true) initialFeatures.push('bot-whatsapp');
        if (restaurantEnabled === true) initialFeatures.push('restaurant');

        // 1. Create tenant record (DEPLOYING status)
        const tenant = await prismaManagement.tenant.create({
            data: {
                name,
                slug,
                dbName,
                ownerEmail: ownerEmail || null,
                plan: plan || "free",
                status: "DEPLOYING",
                features: initialFeatures,
            },
        });

        // Construir objeto de configuración inicial para SystemSetting
        const tenantConfig = {
            name,
            slug,
            currency: currency || "COP",
            mercadopago: {
                publicKey: mpPublicKey || "",
                accessToken: mpAccessToken || "",
                webhookSecret: mpWebhookSecret || "",
                clientId: mpClientId || "",
                clientSecret: mpClientSecret || "",
            },
            smtp: smtpConfig,
            features: {
                blog: blogEnabled !== false,
                store: storeEnabled !== false,
                lms: lmsEnabled === true,
                portfolio: portfolioEnabled === true,
                whatsapp: whatsappEnabled === true,
                restaurant: restaurantEnabled === true,
            },
        };

        // 2. Create database (async - fire and forget for now)
        provisionDatabase(dbName, String(tenant.id), slug, tenantConfig).catch((err) => {
            console.error("Provisioning failed:", err);
        });

        return NextResponse.json(tenant, { status: 201 });
    } catch (error) {
        console.error("Error creating tenant:", error);
        return NextResponse.json(
            { error: "Error al crear tenant" },
            { status: 500 }
        );
    }
}

interface TenantConfigValue {
    name: string;
    slug: string;
    currency: string;
    mercadopago: {
        publicKey: string;
        accessToken: string;
        webhookSecret: string;
        clientId: string;
        clientSecret: string;
    };
    smtp: object | null;
    features: {
        blog: boolean;
        store: boolean;
        lms: boolean;
        portfolio: boolean;
        whatsapp: boolean;
        restaurant: boolean;
    };
}

async function provisionDatabase(
    dbName: string,
    tenantId: string,
    tenantSlug: string,
    configValue: TenantConfigValue
) {
    const masterUrl = process.env.DATABASE_URL;
    if (!masterUrl) throw new Error("DATABASE_URL not set");

    // Connect to postgres using the connection string directly to preserve all options (SSL, etc)
    const pool = new Pool({
        connectionString: masterUrl,
    });

    try {
        // Create database
        try {
            await pool.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database ${dbName} created successfully`);
        } catch (dbErr: any) {
            // 42P04 = Database already exists
            if (dbErr.code === '42P04') {
                console.log(`Database ${dbName} already exists, proceeding to migration...`);
            } else {
                throw dbErr;
            }
        }

        // Run migrations on the new database
        // Construct tenant-specific URL by modifying the master URL object
        // This preserves query params (SSL, schema, etc) and handles encoding automatically
        const tenantUrl = new URL(masterUrl);
        tenantUrl.pathname = `/${dbName}`;
        const tenantDbUrl = tenantUrl.toString();

        // Resolve absolute path to schema
        const path = require("path");
        const fs = require("fs");

        // Try multiple potential paths to be robust (local vs docker)
        const possiblePaths = [
            path.resolve(process.cwd(), "../../packages/database/prisma/schema.prisma"), // Local dev
            path.resolve(process.cwd(), "packages/database/prisma/schema.prisma"),       // Docker flattened?
            "/app/packages/database/prisma/schema.prisma"                                // Docker static
        ];

        let schemaPath = possiblePaths.find(p => fs.existsSync(p));

        if (!schemaPath) {
            console.error("Schema not found in paths:", possiblePaths);
            throw new Error(`Schema file not found. CWD: ${process.cwd()}`);
        }

        console.log("Found schema at:", schemaPath);

        // Copy schema to a temp location to avoid permission/path issues with Prisma CLI
        // The /tmp directory is usually writable in Docker containers
        const tempSchemaPath = `/tmp/schema-${tenantSlug}-${Date.now()}.prisma`;

        // Check environment
        const isDocker = process.env.NODE_ENV === "production" || process.cwd().startsWith("/app");
        const prismaCommand = isDocker ? "prisma" : "npx prisma@5.22.0";

        try {
            // Read and write to ensure the node process (user nextjs) owns the file
            const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
            fs.writeFileSync(tempSchemaPath, schemaContent);
            console.log("Copied schema to:", tempSchemaPath);

            // Run prisma db push with the temp schema file
            const { stdout, stderr } = await execAsync(
                `${prismaCommand} db push --schema="${tempSchemaPath}" --skip-generate --accept-data-loss`,
                { env: { ...process.env, DATABASE_URL: tenantDbUrl } }
            );

            console.log("Migration stdout:", stdout);
            if (stderr) console.warn("Migration stderr:", stderr);

        } catch (err) {
            console.error("Migration/Copy failed:", err);
            throw err;
        } finally {
            // Clean up temp file
            if (fs.existsSync(tempSchemaPath)) {
                try {
                    fs.unlinkSync(tempSchemaPath);
                } catch (e) {
                    console.error("Failed to cleanup temp schema:", e);
                }
            }
        }

        // ========================================
        // NUEVO: Insertar SystemSetting inicial
        // ========================================
        const tenantPool = getTenantPool(dbName);

        try {
            // Insertar configuración inicial en la tabla SystemSetting
            const insertQuery = `
                INSERT INTO "SystemSetting" ("id", "key", "value", "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
                ON CONFLICT ("key") DO UPDATE SET "value" = $2, "updatedAt" = NOW()
            `;

            await tenantPool.query(insertQuery, [
                "TENANT_CONFIG",
                JSON.stringify(configValue),
            ]);

            console.log(`SystemSetting TENANT_CONFIG inserted for ${tenantSlug}`);
        } finally {
            // Pool centralizado gestiona ciclo de vida
            await closeTenantPool(dbName);
        }

        // Update tenant status to ACTIVE
        await prismaManagement.tenant.update({
            where: { id: parseInt(tenantId) },
            data: { status: "ACTIVE" },
        });

        console.log(`Tenant ${tenantId} is now ACTIVE`);
    } catch (error) {
        console.error("Provisioning error:", error);
        // Update status to reflect failure
        await prismaManagement.tenant.update({
            where: { id: parseInt(tenantId) },
            data: { status: "SUSPENDED", notes: String(error) },
        });
        throw error;
    } finally {
        await pool.end();
    }
}
