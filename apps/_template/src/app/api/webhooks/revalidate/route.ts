import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const secret = process.env.REVALIDATION_SECRET;

    if (!secret) {
      console.warn("[Revalidate Webhook] Missing REVALIDATION_SECRET in environment");
      return NextResponse.json(
        { error: "Server Configuration Error" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${secret}`) {
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

    // En Next.js 15, revalidateTag requiere un segundo argumento "max" o usar updateTag
    // @ts-expect-error
    revalidateTag(tag, "max");

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
