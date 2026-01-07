import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        // Verificar si el email ya existe
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (existingUser) {
            throw new ConflictException('El email ya está registrado');
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(dto.password, 12);

        // Crear usuario
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                password: hashedPassword,
                name: dto.name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        // Generar tokens
        const tokens = await this.generateTokens(user.id, user.email);

        return {
            user,
            ...tokens,
        };
    }

    async login(dto: LoginDto) {
        // Buscar usuario
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                password: true,
                subscription: {
                    select: {
                        status: true,
                        endDate: true,
                    },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Generar tokens
        const tokens = await this.generateTokens(user.id, user.email);

        // Remover password de la respuesta
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: {
                ...userWithoutPassword,
                hasActiveSubscription:
                    user.subscription?.status === 'ACTIVE' &&
                    (!user.subscription?.endDate || new Date(user.subscription.endDate) > new Date()),
            },
            ...tokens,
        };
    }

    async refreshToken(refreshToken: string) {
        // Buscar refresh token en la base de datos
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!storedToken) {
            throw new UnauthorizedException('Refresh token inválido');
        }

        // Verificar si ha expirado
        if (new Date() > storedToken.expiresAt) {
            // Eliminar token expirado
            await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
            throw new UnauthorizedException('Refresh token expirado');
        }

        // Eliminar el token usado (rotación de tokens)
        await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

        // Generar nuevos tokens
        const tokens = await this.generateTokens(storedToken.user.id, storedToken.user.email);

        return tokens;
    }

    async logout(userId: string, refreshToken?: string) {
        if (refreshToken) {
            // Eliminar solo el token específico
            await this.prisma.refreshToken.deleteMany({
                where: {
                    userId,
                    token: refreshToken,
                },
            });
        } else {
            // Eliminar todos los refresh tokens del usuario (logout de todos los dispositivos)
            await this.prisma.refreshToken.deleteMany({
                where: { userId },
            });
        }

        return { message: 'Sesión cerrada correctamente' };
    }

    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                createdAt: true,
                subscription: {
                    select: {
                        status: true,
                        startDate: true,
                        endDate: true,
                    },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        return {
            ...user,
            hasActiveSubscription:
                user.subscription?.status === 'ACTIVE' &&
                (!user.subscription?.endDate || new Date(user.subscription.endDate) > new Date()),
        };
    }

    private async generateTokens(userId: string, email: string) {
        const accessTokenPayload = { sub: userId, email };

        const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
        });

        // Crear refresh token
        const refreshTokenValue = uuidv4();
        const refreshTokenExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN_DAYS', 7);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresIn);

        // Guardar refresh token en la base de datos
        await this.prisma.refreshToken.create({
            data: {
                token: refreshTokenValue,
                userId,
                expiresAt,
            },
        });

        return {
            accessToken,
            refreshToken: refreshTokenValue,
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
        };
    }
}
