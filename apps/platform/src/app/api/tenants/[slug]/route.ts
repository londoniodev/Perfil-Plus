
import { NextResponse } from "next/server";
import { prismaManagement } from "@alvarosky/database-management"; // Use correct client
import { Pool } from "pg";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // 1. Verificar si el tenant existe
        const tenant = await prismaManagement.tenant.findUnique({
            where: { slug },
        });

        if (!tenant) {
            return NextResponse.json(
                { error: "Tenant no encontrado" },
                { status: 404 }
            );
        }

        // 2. Eliminar la base de datos física
        const masterUrl = process.env.DATABASE_URL;
        if (masterUrl) {
            // Connect to master DB (postgres/web-projects) to execute DROP DATABASE
            const pool = new Pool({
                connectionString: masterUrl,
            });

            try {
                // Terminate connections to the tenant DB first
                // This is crucial because DROP DATABASE fails if there are active connections
                await pool.query(`
                    SELECT pg_terminate_backend(pid)
                    FROM pg_stat_activity
                    WHERE datname = '${tenant.dbName}'
                    AND pid <> pg_backend_pid();
                `);

                // Drop the database
                await pool.query(`DROP DATABASE IF EXISTS "${tenant.dbName}"`);
                console.log(`Database ${tenant.dbName} deleted successfully`);
            } catch (dbError) {
                console.error(`Error deleting database ${tenant.dbName}:`, dbError);
                // We verify if we should abort or continue. 
                // Currently continuing to ensure the tenant record is removed even if DB drop fails (or if DB didn't exist)
            } finally {
                await pool.end();
            }
        }

        // 3. Eliminar el tenant de la BD de gestión
        await prismaManagement.tenant.delete({
            where: { slug },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error eliminando tenant:", error);
        return NextResponse.json(
            { error: "Error interno del servidor al eliminar el tenant" },
            { status: 500 }
        );
    }
}
