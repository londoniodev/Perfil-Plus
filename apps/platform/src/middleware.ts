import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require auth
    const publicRoutes = ["/login", "/api/auth/login", "/api/auth/logout"];

    if (publicRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Check for session cookie
    const sessionToken = request.cookies.get("platform_session")?.value;

    if (!sessionToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Verify JWT with signature validation
    try {
        const secret = process.env.SESSION_SECRET;
        if (!secret) {
            console.error("SESSION_SECRET not set");
            throw new Error("Configuration error");
        }

        const secretKey = new TextEncoder().encode(secret);
        const { payload } = await jwtVerify(sessionToken, secretKey);

        // Token is valid and not expired (jwtVerify checks exp automatically)
        // Optionally add user info to headers for downstream use
        const response = NextResponse.next();
        response.headers.set("x-user", String(payload.user || ""));
        response.headers.set("x-role", String(payload.role || ""));
        return response;

    } catch (error) {
        // Token invalid, expired, or signature mismatch
        console.warn("JWT verification failed:", error instanceof Error ? error.message : "Unknown error");

        const loginUrl = new URL("/login", request.url);

        // Check if it's an expiration error
        if (error instanceof Error && error.message.includes("exp")) {
            loginUrl.searchParams.set("expired", "true");
        }

        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("platform_session");
        return response;
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
    ],
};
