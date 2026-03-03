import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tag } = body;

        // Check if a secret is provided to protect the endpoint
        const secret = req.headers.get("x-revalidate-secret") || body.secret;
        const expectedSecret = process.env.INTERNAL_API_KEY || "default_dev_secret_key";

        if (secret !== expectedSecret) {
            return NextResponse.json({ message: "Invalid secret tokens" }, { status: 401 });
        }

        if (!tag) {
            return NextResponse.json({ message: "Missing tag parameter" }, { status: 400 });
        }

        // @ts-ignore - Next.js 15 cache types might expect a profile depending on experimental flags
        revalidateTag(tag);

        return NextResponse.json({ revalidated: true, now: Date.now(), tag });
    } catch (err: any) {
        return NextResponse.json({ message: "Error revalidating", error: err.message }, { status: 500 });
    }
}
