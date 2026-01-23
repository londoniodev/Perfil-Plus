import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require auth
    const publicRoutes = ["/login", "/api/auth/login", "/api/auth/logout"];

    if (publicRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Check for session cookie
    const sessionToken = request.cookies.get("platform_session")?.value;

    if (!sessionToken) {
        // Redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Verify session token (simple check - in production use JWT verification)
    try {
        const [, payload] = sessionToken.split(".");
        if (!payload) {
            throw new Error("Invalid token");
        }
        const decoded = JSON.parse(Buffer.from(payload, "base64").toString());

        // Check expiration
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("expired", "true");
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete("platform_session");
            return response;
        }
    } catch {
        const loginUrl = new URL("/login", request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("platform_session");
        return response;
    }

    return NextResponse.next();
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
