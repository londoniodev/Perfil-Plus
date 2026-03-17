import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tag, path } = body;

        // Check if a secret is provided to protect the endpoint
        const secret = req.headers.get("x-revalidate-secret") || body.secret;
        const expectedSecret = process.env.INTERNAL_API_KEY || "default_dev_secret_key";

        if (secret !== expectedSecret) {
            return NextResponse.json({ message: "Invalid secret tokens" }, { status: 401 });
        }

        if (!tag && !path) {
            return NextResponse.json({ message: "Missing tag or path parameter" }, { status: 400 });
        }

        if (tag) {
            // @ts-ignore
            revalidateTag(tag);
        }

        if (path) {
            revalidatePath(path);
        }

        return NextResponse.json({ revalidated: true, now: Date.now(), tag, path });
    } catch (err: any) {
        return NextResponse.json({ message: "Error revalidating", error: err.message }, { status: 500 });
    }
}
