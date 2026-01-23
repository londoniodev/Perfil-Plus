import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // Get credentials from environment variables
        const adminUser = process.env.ADMIN_USER;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const sessionSecret = process.env.SESSION_SECRET;

        if (!adminUser || !adminPassword || !sessionSecret) {
            console.error("Missing ADMIN_USER, ADMIN_PASSWORD, or SESSION_SECRET in environment");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        // Validate credentials
        if (username !== adminUser || password !== adminPassword) {
            return NextResponse.json(
                { error: "Credenciales inválidas" },
                { status: 401 }
            );
        }

        // Create JWT token (expires in 8 hours)
        const secret = new TextEncoder().encode(sessionSecret);
        const token = await new SignJWT({ user: username, role: "admin" })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("8h")
            .setIssuedAt()
            .sign(secret);

        // Set cookie and return success
        const response = NextResponse.json({ success: true });
        response.cookies.set("platform_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 8, // 8 hours
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Error en el servidor" },
            { status: 500 }
        );
    }
}
