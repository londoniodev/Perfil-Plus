import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto, LoginDto } from './dto';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private emailService: EmailService,
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
                emailVerified: false,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                emailVerified: true,
                createdAt: true,
            },
        });

        // Generar y enviar email de verificación
        await this.sendVerificationEmail(user.id, user.email, user.name);

        // Generar tokens (el usuario puede loguearse pero no está verificado)
        const tokens = await this.generateTokens(user.id, user.email);

        return {
            user,
            ...tokens,
            message: 'Registro exitoso. Revisa tu email para verificar tu cuenta.',
        };
    }

    async login(dto: LoginDto) {
        const MAX_FAILED_ATTEMPTS = 5;
        const LOCKOUT_DURATION_MINUTES = 15;

        // Buscar usuario
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                password: true,
                emailVerified: true,
                failedLoginAttempts: true,
                lockedUntil: true,
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

        // Verificar si la cuenta está bloqueada
        if (user.lockedUntil && new Date() < user.lockedUntil) {
            const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
            throw new UnauthorizedException(
                `Cuenta bloqueada temporalmente. Intenta de nuevo en ${minutesLeft} minutos.`
            );
        }

        // Si el bloqueo ya expiró, resetear el contador
        if (user.lockedUntil && new Date() >= user.lockedUntil) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { failedLoginAttempts: 0, lockedUntil: null },
            });
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            // Incrementar contador de intentos fallidos
            const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;

            const updateData: { failedLoginAttempts: number; lockedUntil?: Date } = {
                failedLoginAttempts: newFailedAttempts,
            };

            // Si alcanzó el límite, bloquear cuenta
            if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
                updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
            }

            await this.prisma.user.update({
                where: { id: user.id },
                data: updateData,
            });

            const attemptsLeft = MAX_FAILED_ATTEMPTS - newFailedAttempts;
            if (attemptsLeft > 0) {
                throw new UnauthorizedException(
                    `Credenciales inválidas. ${attemptsLeft} intento(s) restante(s).`
                );
            } else {
                throw new UnauthorizedException(
                    `Cuenta bloqueada por ${LOCKOUT_DURATION_MINUTES} minutos debido a múltiples intentos fallidos.`
                );
            }
        }

        // Login exitoso: resetear contador de intentos fallidos
        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { failedLoginAttempts: 0, lockedUntil: null },
            });
        }

        // Generar tokens
        const tokens = await this.generateTokens(user.id, user.email);

        // Remover campos sensibles de la respuesta
        const { password: _, failedLoginAttempts: __, lockedUntil: ___, ...userWithoutSensitive } = user;

        return {
            user: {
                ...userWithoutSensitive,
                hasActiveSubscription:
                    user.subscription?.status === 'ACTIVE' &&
                    (!user.subscription?.endDate || new Date(user.subscription.endDate) > new Date()),
            },
            ...tokens,
        };
    }

    async verifyEmail(token: string) {
        // Hash del token para buscar en DB
        const tokenHash = this.hashToken(token);

        // Buscar token
        const verificationToken = await this.prisma.emailVerificationToken.findUnique({
            where: { token: tokenHash },
            include: { user: true },
        });

        if (!verificationToken) {
            throw new BadRequestException('Token de verificación inválido');
        }

        // Verificar expiración
        if (new Date() > verificationToken.expiresAt) {
            // Eliminar token expirado
            await this.prisma.emailVerificationToken.delete({
                where: { id: verificationToken.id },
            });
            throw new BadRequestException('El token ha expirado. Solicita uno nuevo.');
        }

        // Marcar email como verificado
        await this.prisma.user.update({
            where: { id: verificationToken.userId },
            data: { emailVerified: true },
        });

        // Eliminar token usado
        await this.prisma.emailVerificationToken.delete({
            where: { id: verificationToken.id },
        });

        return {
            message: '¡Email verificado correctamente!',
            email: verificationToken.user.email,
        };
    }

    async resendVerificationEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            // No revelar si el email existe o no (seguridad)
            return { message: 'Si el email está registrado, recibirás un correo de verificación.' };
        }

        if (user.emailVerified) {
            throw new BadRequestException('Este email ya está verificado');
        }

        // Rate limiting: máximo 3 tokens en la última hora
        const recentTokens = await this.prisma.emailVerificationToken.count({
            where: {
                userId: user.id,
                createdAt: { gte: new Date(Date.now() - 3600000) }, // última hora
            },
        });

        if (recentTokens >= 3) {
            throw new BadRequestException('Has solicitado demasiados emails. Intenta de nuevo en 1 hora.');
        }

        // Eliminar tokens anteriores de este usuario
        await this.prisma.emailVerificationToken.deleteMany({
            where: { userId: user.id },
        });

        // Enviar nuevo email
        await this.sendVerificationEmail(user.id, user.email, user.name);

        return { message: 'Si el email está registrado, recibirás un correo de verificación.' };
    }

    private async sendVerificationEmail(userId: string, email: string, name: string) {
        // Generar token aleatorio (64 caracteres hex)
        const rawToken = randomBytes(32).toString('hex');

        // Guardar hash del token en la base de datos
        const tokenHash = this.hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        await this.prisma.emailVerificationToken.create({
            data: {
                token: tokenHash,
                userId,
                expiresAt,
            },
        });

        // Enviar email con el token raw (no el hash)
        await this.emailService.sendVerificationEmail(email, name, rawToken);
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
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
                emailVerified: true,
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

        // Generar tokens (Default 7 días si no hay variable de entorno)
        const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '7d'),
        });

        // Crear refresh token
        const refreshTokenValue = randomUUID();
        const refreshTokenExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN_DAYS', 30);
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
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '7d'),
        };
    }
}
