import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

/**
 * Webhook de Revalidación On-Demand (Cross-App)
 * 
 * Acepta peticiones POST desde la API (NestJS) para invalidar la caché ISR
 * de Next.js cuando se actualizan datos del tenant (BrandSettings, branding, etc.)
 * 
 * Seguridad: Valida contra REVALIDATION_SECRET o INTERNAL_API_KEY.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tag, path } = body;

        // Validar secreto — soporta tanto el header como el body
        const secret = req.headers.get("x-revalidate-secret") || body.secret;
        const expectedSecret = process.env.REVALIDATION_SECRET;

        // Validar estrictamente que exista el secreto configurado y coincida
        if (!expectedSecret || secret !== expectedSecret) {
            console.warn(`[Revalidate Webhook] Intento con secreto inválido o no configurado`);
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (!tag && !path) {
            return NextResponse.json({ message: "Missing tag or path parameter" }, { status: 400 });
        }

        if (tag) {
            // @ts-ignore - Next.js 16 type restrictiveness
            revalidateTag(tag);
            console.log(`[Revalidate Webhook] Tag invalidado: ${tag}`);
        }

        if (path) {
            revalidatePath(path);
            console.log(`[Revalidate Webhook] Path invalidado: ${path}`);
        }

        return NextResponse.json({ revalidated: true, now: Date.now(), tag, path });
    } catch (err: any) {
        console.error(`[Revalidate Webhook] Error:`, err.message);
        return NextResponse.json({ message: "Error revalidating", error: err.message }, { status: 500 });
    }
}
