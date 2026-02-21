import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

// Define la estructura de tu JWT (ajusta según tu backend NestJS)
interface DecodedToken {
    sub: string // ID del usuario
    email: string
    role?: string
    name?: string
    iat: number
    exp: number
}

/**
 * Obtiene el usuario actual desde la sesión (cookie JWT)
 * Para usar en Server Actions y Server Components
 * 
 * @returns Usuario con id, email y role, o null si no hay sesión
 */
export async function getSessionUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get("Authentication")?.value || cookieStore.get("accessToken")?.value

    if (!token) return null

    try {
        // NOTA: Para producción, valida la firma con process.env.JWT_SECRET
        // jwt.verify(token, process.env.JWT_SECRET!)

        // Para MVP, solo decodificamos (sin validación de firma)
        const decoded = jwt.decode(token) as DecodedToken | null

        if (!decoded || !decoded.sub) return null

        // Validar expiración manualmente
        const now = Math.floor(Date.now() / 1000)
        if (decoded.exp && decoded.exp < now) {
            return null // Token expirado
        }

        return {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name,
            accessToken: token
        }
    } catch (error) {
        console.error("Error decodificando token:", error)
        return null
    }
}

