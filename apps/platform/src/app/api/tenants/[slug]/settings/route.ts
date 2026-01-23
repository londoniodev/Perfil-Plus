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
            // Fetch all SystemSettings
            const result = await pool.query(
                'SELECT key, value FROM "SystemSetting"'
            );

            const settings: Record<string, unknown> = {};
            for (const row of result.rows) {
                settings[row.key] = row.value;
            }

            return NextResponse.json(settings);
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
            // Upsert each setting
            for (const [key, value] of Object.entries(settings)) {
                if (value === undefined || value === null || value === "") {
                    // Delete empty settings
                    await pool.query('DELETE FROM "SystemSetting" WHERE key = $1', [key]);
                } else {
                    // Upsert setting
                    await pool.query(
                        `INSERT INTO "SystemSetting" (id, key, value, "isPublic", "createdAt", "updatedAt")
             VALUES (gen_random_uuid()::text, $1, $2, false, NOW(), NOW())
             ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = NOW()`,
                        [key, JSON.stringify(value)]
                    );
                }
            }

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
