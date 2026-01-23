import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("platform_session");
    return response;
}

export async function GET() {
    const response = NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:4000"));
    response.cookies.delete("platform_session");
    return response;
}
