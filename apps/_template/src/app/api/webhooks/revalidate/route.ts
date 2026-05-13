import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.REVALIDATION_SECRET;

    if (!secret) {
      console.warn("[Revalidate Webhook] Missing REVALIDATION_SECRET in environment");
      return NextResponse.json(
        { error: "Server Configuration Error" },
        { status: 500 }
      );
    }

    // Soportar ambos headers: el custom x-revalidate-secret (usado por landing-builder)
    // y el estándar Authorization Bearer (para clientes genéricos)
    const customHeader = req.headers.get("x-revalidate-secret");
    const authHeader = req.headers.get("Authorization");
    const isAuthorized = customHeader === secret || authHeader === `Bearer ${secret}`;

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { tag } = body;

    if (!tag || typeof tag !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'tag' in request body" },
        { status: 400 }
      );
    }

    // Revalidar el tag (Next.js 15 requiere segundo argumento)
    revalidateTag(tag, "max" as any);

    return NextResponse.json(
      { revalidated: true, now: Date.now(), tag },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Revalidate Webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
