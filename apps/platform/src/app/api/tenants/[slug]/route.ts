
import { NextResponse } from "next/server";
import { prisma } from "@alvarosky/database";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }

) {
    try {
        const { slug } = await params;

        // 1. Verificar si el tenant existe
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
        });

        if (!tenant) {
            return NextResponse.json(
                { error: "Tenant no encontrado" },
                { status: 404 }
            );
        }

        // 2. Eliminar el tenant de la BD de gestión
        // NOTA: Esto NO elimina la base de datos del tenant ni los recursos de Docker.
        // Eso debería ser manejado por un job en background o un servicio separado.
        await prisma.tenant.delete({
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
