import { NextRequest, NextResponse } from "next/server";
import { prismaManagement } from "@alvarosky/database-management";
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

        const dbName = `tenants_${slug.replace(/-/g, "_")}`;

        // 1. Create tenant record (DEPLOYING status)
        const tenant = await prismaManagement.tenant.create({
            data: {
                name,
                slug,
                dbName,
                ownerEmail: ownerEmail || null,
                plan: plan || "free",
                status: "DEPLOYING",
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

    // Parse connection string to get host/user/pass
    const url = new URL(masterUrl);
    const host = url.hostname;
    const port = url.port || "5432";
    const user = url.username;
    const password = url.password;

    // Connect to postgres (default db) to create new database
    const pool = new Pool({
        host,
        port: parseInt(port),
        user,
        password,
        database: "postgres",
    });

    try {
        // Create database
        await pool.query(`CREATE DATABASE "${dbName}"`);
        console.log(`Database ${dbName} created successfully`);

        // Run migrations on the new database
        const tenantDbUrl = `postgresql://${user}:${password}@${host}:${port}/${dbName}?schema=public`;

        // Use prisma db push for the tenant schema
        const { stdout, stderr } = await execAsync(
            `cd ../../packages/database && DATABASE_URL="${tenantDbUrl}" npx prisma db push --skip-generate`,
            { env: { ...process.env, DATABASE_URL: tenantDbUrl } }
        );

        console.log("Migration stdout:", stdout);
        if (stderr) console.warn("Migration stderr:", stderr);

        // ========================================
        // NUEVO: Insertar SystemSetting inicial
        // ========================================
        const tenantPool = new Pool({
            host,
            port: parseInt(port),
            user,
            password,
            database: dbName,
        });

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
            await tenantPool.end();
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
