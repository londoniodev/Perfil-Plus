import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { compare } from "bcryptjs";
import { prismaManagement } from "@alvarosky/database-management";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: "Usuario y contraseña son requeridos" },
                { status: 400 }
            );
        }

        const sessionSecret = process.env.SESSION_SECRET;
        if (!sessionSecret) {
            console.error("SESSION_SECRET not set in environment");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        // Find user in database (email = username for platform)
        const user = await prismaManagement.platformUser.findUnique({
            where: { email: username },
        });

        // Fallback to environment variables if no user in DB
        if (!user) {
            const envUser = process.env.ADMIN_USER;
            const envPass = process.env.ADMIN_PASSWORD;

            if (envUser && envPass && username === envUser && password === envPass) {
                // Create JWT for env-based login
                const secret = new TextEncoder().encode(sessionSecret);
                const token = await new SignJWT({
                    user: envUser,
                    name: "Admin (ENV)",
                    role: "SUPER_ADMIN",
                })
                    .setProtectedHeader({ alg: "HS256" })
                    .setExpirationTime("8h")
                    .setIssuedAt()
                    .sign(secret);

                const response = NextResponse.json({
                    success: true,
                    user: { email: envUser, name: "Admin", role: "SUPER_ADMIN" },
                });

                response.cookies.set("platform_session", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 60 * 60 * 8,
                    path: "/",
                });

                return response;
            }

            return NextResponse.json(
                { error: "Credenciales inválidas" },
                { status: 401 }
            );
        }

        // Verify password with bcrypt
        const isValidPassword = await compare(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Credenciales inválidas" },
                { status: 401 }
            );
        }

        // Create JWT token (expires in 8 hours)
        const secret = new TextEncoder().encode(sessionSecret);
        const token = await new SignJWT({
            userId: user.id,
            user: user.email,
            name: user.name,
            role: user.role,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("8h")
            .setIssuedAt()
            .sign(secret);

        // Set cookie and return success
        const response = NextResponse.json({
            success: true,
            user: {
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });

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
