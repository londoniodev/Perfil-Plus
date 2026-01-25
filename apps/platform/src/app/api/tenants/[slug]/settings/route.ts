import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

interface RouteParams {
    params: Promise<{ slug: string }>;
}

async function getTenantPool(dbName: string) {
    const masterUrl = process.env.DATABASE_URL;
    if (!masterUrl) throw new Error("DATABASE_URL not set");

    const url = new URL(masterUrl);
    url.pathname = `/${dbName}`;

    return new Pool({
        connectionString: url.toString(),
        max: 2,
    });
}

// Estructura esperada del TENANT_CONFIG en la DB
interface TenantConfigValue {
    name?: string;
    slug?: string;
    currency?: string;
    mercadopago?: {
        publicKey?: string;
        accessToken?: string;
        webhookSecret?: string;
        clientId?: string;
        clientSecret?: string;
    };
    smtp?: {
        host?: string;
        port?: number;
        secure?: boolean;
        auth?: {
            user?: string;
            pass?: string;
        };
    };
    features?: {
        blog?: boolean;
        store?: boolean;
        lms?: boolean;
    };
    theme?: string;
    primary_color?: string;
    api_key_openai?: string;
}

// Aplanar el objeto TENANT_CONFIG para el editor
function flattenConfig(config: TenantConfigValue): Record<string, unknown> {
    return {
        // Básicos
        theme: config.theme || "",
        primary_color: config.primary_color || "#000000",
        currency: config.currency || "COP",

        // Features
        enable_blog: config.features?.blog !== false,
        enable_store: config.features?.store !== false,
        enable_lms: config.features?.lms === true,

        // APIs
        api_key_openai: config.api_key_openai || "",

        // MercadoPago
        mp_public_key: config.mercadopago?.publicKey || "",
        mp_access_token: config.mercadopago?.accessToken || "",
        mp_webhook_secret: config.mercadopago?.webhookSecret || "",
        mp_client_id: config.mercadopago?.clientId || "",
        mp_client_secret: config.mercadopago?.clientSecret || "",

        // SMTP
        smtp_host: config.smtp?.host || "",
        smtp_port: config.smtp?.port || 587,
        smtp_secure: config.smtp?.secure || false,
        smtp_user: config.smtp?.auth?.user || "",
        smtp_pass: config.smtp?.auth?.pass || "",
    };
}

// Reconstruir la estructura de TENANT_CONFIG desde los datos aplanados
function unflattenConfig(flat: Record<string, unknown>): TenantConfigValue {
    return {
        theme: String(flat.theme || ""),
        primary_color: String(flat.primary_color || "#000000"),
        currency: String(flat.currency || "COP"),
        api_key_openai: String(flat.api_key_openai || ""),
        mercadopago: {
            publicKey: String(flat.mp_public_key || ""),
            accessToken: String(flat.mp_access_token || ""),
            webhookSecret: String(flat.mp_webhook_secret || ""),
            clientId: String(flat.mp_client_id || ""),
            clientSecret: String(flat.mp_client_secret || ""),
        },
        smtp: {
            host: String(flat.smtp_host || ""),
            port: Number(flat.smtp_port) || 587,
            secure: Boolean(flat.smtp_secure),
            auth: {
                user: String(flat.smtp_user || ""),
                pass: String(flat.smtp_pass || ""),
            },
        },
        features: {
            blog: Boolean(flat.enable_blog),
            store: Boolean(flat.enable_store),
            lms: Boolean(flat.enable_lms),
        },
    };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { slug } = await params;

    try {
        // Get tenant info from management DB
        const { prismaManagement } = await import("@alvarosky/database-management");
        const tenant = await prismaManagement.tenant.findUnique({
            where: { slug },
        });

        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        // Connect to tenant's database
        const pool = await getTenantPool(tenant.dbName);

        try {
            // Fetch TENANT_CONFIG from SystemSetting
            const result = await pool.query(
                `SELECT value FROM "SystemSetting" WHERE key = 'TENANT_CONFIG' LIMIT 1`
            );

            if (result.rows.length === 0) {
                // No hay config, retornar valores por defecto
                return NextResponse.json(flattenConfig({}));
            }

            // Parsear el JSON almacenado
            let configValue: TenantConfigValue = {};
            try {
                const rawValue = result.rows[0].value;
                configValue = typeof rawValue === "string"
                    ? JSON.parse(rawValue)
                    : rawValue;
            } catch (parseError) {
                console.error("Error parsing TENANT_CONFIG:", parseError);
            }

            // Aplanar y retornar
            return NextResponse.json(flattenConfig(configValue));
        } finally {
            await pool.end();
        }
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    const { slug } = await params;

    try {
        const body = await request.json();
        const { settings, dbName } = body;

        if (!settings || typeof settings !== "object") {
            return NextResponse.json(
                { error: "Invalid settings format" },
                { status: 400 }
            );
        }

        const pool = await getTenantPool(dbName);

        try {
            // Reconstruir el objeto TENANT_CONFIG
            const configValue = unflattenConfig(settings);

            // Upsert TENANT_CONFIG
            await pool.query(
                `INSERT INTO "SystemSetting" (id, key, value, "isPublic", "createdAt", "updatedAt")
                 VALUES (gen_random_uuid()::text, 'TENANT_CONFIG', $1, false, NOW(), NOW())
                 ON CONFLICT (key) DO UPDATE SET value = $1, "updatedAt" = NOW()`,
                [JSON.stringify(configValue)]
            );

            return NextResponse.json({ success: true });
        } finally {
            await pool.end();
        }
    } catch (error) {
        console.error("Error saving settings:", error);
        return NextResponse.json(
            { error: "Failed to save settings" },
            { status: 500 }
        );
    }
}
