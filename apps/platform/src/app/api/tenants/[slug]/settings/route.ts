import { NextRequest, NextResponse } from "next/server";
import { getTenantPool } from "@alvarosky/database-management";
import {
    TenantConfigValue,
    FlattenedTenantConfig,
    flattenTenantConfig,
    unflattenTenantConfig
} from "@alvarosky/types";

interface RouteParams {
    params: Promise<{ slug: string }>;
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


        // Fetch TENANT_CONFIG from SystemSetting
        const result = await pool.query(
            `SELECT value FROM "SystemSetting" WHERE key = 'TENANT_CONFIG' LIMIT 1`
        );

        if (result.rows.length === 0) {
            // No hay config, retornar valores por defecto
            return NextResponse.json(flattenTenantConfig({}));
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

        // Fallback: Si no hay nombre en config, usar el de la tabla Tenant
        if (!configValue.name) {
            configValue.name = tenant.name || "";
        }

        // Aplanar y retornar
        // Aplanar y retornar
        return NextResponse.json(flattenTenantConfig(configValue));
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


        // Reconstruir el objeto TENANT_CONFIG
        const configValue = unflattenTenantConfig(settings as FlattenedTenantConfig);

        // Upsert TENANT_CONFIG
        await pool.query(
            `INSERT INTO "SystemSetting" (id, key, value, "isPublic", "createdAt", "updatedAt")
                 VALUES (gen_random_uuid()::text, 'TENANT_CONFIG', $1, false, NOW(), NOW())
                 ON CONFLICT (key) DO UPDATE SET value = $1, "updatedAt" = NOW()`,
            [JSON.stringify(configValue)]
        );

        // Actualizar nombre y features en la tabla Tenant de Management DB
        if (configValue.name || configValue.features) {
            const { prismaManagement } = await import("@alvarosky/database-management");

            const updateData: any = {};
            if (configValue.name) updateData.name = configValue.name;

            if (configValue.features) {
                // Convert features object to string array
                const featuresList: string[] = [];
                if (configValue.features.blog) featuresList.push('blog');
                if (configValue.features.store) featuresList.push('shop'); // store -> shop
                if (configValue.features.lms) featuresList.push('lms');

                updateData.features = featuresList;
            }

            if (Object.keys(updateData).length > 0) {
                await prismaManagement.tenant.update({
                    where: { slug },
                    data: updateData
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving settings:", error);
        return NextResponse.json(
            { error: "Failed to save settings" },
            { status: 500 }
        );
    }
}
