import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
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
  ) {}

  async register(dto: RegisterDto, tenantId: string) {
    // Resolver tenantId si viene como slug desde local (.env)
    let actualTenantId = tenantId;
    if (!tenantId.startsWith('c')) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { slug: tenantId },
        select: { id: true },
      });
      if (tenant) {
        actualTenantId = tenant.id;
      }
    }

    // Verificar si el email ya existe en este tenant
    const existingUser = await this.prisma.user.findFirst({
      where: { tenantId: actualTenantId, email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Crear usuario
    const user = await this.prisma.user.create({
      data: {
        tenantId: actualTenantId,
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
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      user.name,
      tenantId,
    );

    return {
      user,
      ...tokens,
      message: 'Registro exitoso. Revisa tu email para verificar tu cuenta.',
    };
  }

  async login(dto: LoginDto, tenantId: string) {
    const MAX_FAILED_ATTEMPTS = 5;
    const LOCKOUT_DURATION_MINUTES = 15;

    // Resolver tenantId si viene como slug desde local (.env)
    let actualTenantId = tenantId;
    if (!tenantId.startsWith('c')) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { slug: tenantId },
        select: { id: true },
      });
      if (tenant) {
        actualTenantId = tenant.id;
      }
    }

    // Buscar usuario
    const user = await this.prisma.user.findFirst({
      where: {
        tenantId: actualTenantId,
        email: dto.email.toLowerCase().trim(),
      },
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
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Cuenta bloqueada temporalmente.Intenta de nuevo en ${minutesLeft} minutos.`,
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
        updateData.lockedUntil = new Date(
          Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000,
        );
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      const attemptsLeft = MAX_FAILED_ATTEMPTS - newFailedAttempts;
      if (attemptsLeft > 0) {
        throw new UnauthorizedException(
          `Credenciales inválidas.${attemptsLeft} intento(s) restante(s).`,
        );
      } else {
        throw new UnauthorizedException(
          `Cuenta bloqueada por ${LOCKOUT_DURATION_MINUTES} minutos debido a múltiples intentos fallidos.`,
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
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      user.name,
      tenantId,
      user.subscription?.status,
      user.subscription?.endDate || undefined,
    );

    // Remover campos sensibles de la respuesta
    const {
      password: _,
      failedLoginAttempts: __,
      lockedUntil: ___,
      ...userWithoutSensitive
    } = user;

    return {
      user: {
        ...userWithoutSensitive,
        hasActiveSubscription:
          user.subscription?.status === 'ACTIVE' &&
          (!user.subscription?.endDate ||
            new Date(user.subscription.endDate) > new Date()),
      },
      ...tokens,
    };
  }

  async verifyEmail(token: string) {
    // Hash del token para buscar en DB
    const tokenHash = this.hashToken(token);

    // Buscar token
    const verificationToken =
      await this.prisma.emailVerificationToken.findUnique({
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
      throw new BadRequestException(
        'El token ha expirado. Solicita uno nuevo.',
      );
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

  async resendVerificationEmail(email: string, tenantId: string) {
    // Resolver tenantId si viene como slug desde local (.env)
    let actualTenantId = tenantId;
    if (!tenantId.startsWith('c')) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { slug: tenantId },
        select: { id: true },
      });
      if (tenant) {
        actualTenantId = tenant.id;
      }
    }

    const user = await this.prisma.user.findFirst({
      where: { tenantId: actualTenantId, email: email.toLowerCase() },
    });

    if (!user) {
      // No revelar si el email existe o no (seguridad)
      return {
        message:
          'Si el email está registrado, recibirás un correo de verificación.',
      };
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
      throw new BadRequestException(
        'Has solicitado demasiados emails. Intenta de nuevo en 1 hora.',
      );
    }

    // Eliminar tokens anteriores de este usuario
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Enviar nuevo email
    await this.sendVerificationEmail(user.id, user.email, user.name);

    return {
      message:
        'Si el email está registrado, recibirás un correo de verificación.',
    };
  }

  private async sendVerificationEmail(
    userId: string,
    email: string,
    name: string,
  ) {
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
      await this.prisma.refreshToken.deleteMany({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('Refresh token expirado');
    }

    // Eliminar el token usado (rotación de tokens)
    await this.prisma.refreshToken.deleteMany({
      where: { id: storedToken.id },
    });

    // Generar nuevos tokens (IMPORTANTE: pasar tenantId para que el JWT mantenga el contexto multi-tenant)
    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
      storedToken.user.name,
      storedToken.user.tenantId,
      // Nota: Si queremos suscripción real en el refresh, deberíamos hacer un include extra o
      // aceptar que se refresca con los datos del momento del login.
      // Para Zero-Trust, priorizaremos consistencia en el refresh.
    );

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
        tenantId: true,
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
        (!user.subscription?.endDate ||
          new Date(user.subscription.endDate) > new Date()),
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
    role?: string,
    name?: string,
    tenantId?: string,
    subscriptionStatus?: string,
    subscriptionEndDate?: Date,
  ) {
    const accessTokenPayload = {
      sub: userId,
      email,
      role,
      name,
      tenantId,
      subscriptionStatus,
      subscriptionEndDate,
    };

    // Generar tokens (Default 7d si no hay variable de entorno)
    const jwtExpiry = (this.configService.get('JWT_ACCESS_EXPIRES_IN', '7d') as string).replace(/"/g, '');
    const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
      expiresIn: jwtExpiry as any,
    });

    // Crear refresh token
    const refreshTokenValue = randomUUID();
    const refreshTokenExpiresIn = this.configService.get(
      'JWT_REFRESH_EXPIRES_IN_DAYS',
      30,
    );
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
      expiresIn: jwtExpiry,
    };
  }
  async forgotPassword(email: string, tenantId: string) {
    // Resolver tenantId si viene como slug desde local (.env)
    let actualTenantId = tenantId;
    if (!tenantId.startsWith('c')) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { slug: tenantId },
        select: { id: true },
      });
      if (tenant) {
        actualTenantId = tenant.id;
      }
    }

    const user = await this.prisma.user.findFirst({
      where: { tenantId: actualTenantId, email: email.toLowerCase() },
    });

    if (!user) {
      // Security: Don't reveal if user exists
      return {
        message:
          'Si el email está registrado, recibirás instrucciones para restablecer tu contraseña.',
      };
    }

    // Generate token
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Save token (invalidate previous ones)
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    await this.prisma.passwordResetToken.create({
      data: {
        token: tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // Send email
    await this.emailService.sendPasswordRecoveryEmail(
      user.email,
      user.name,
      rawToken,
    );

    return {
      message:
        'Si el email está registrado, recibirás instrucciones para restablecer tu contraseña.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token);

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException('Token inválido o expirado.');
    }

    if (new Date() > resetToken.expiresAt) {
      await this.prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      throw new BadRequestException(
        'El token ha expirado. Solicita uno nuevo.',
      );
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        password: hashedPassword,
        // Unlock account if it was locked
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Delete used token
    await this.prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    // Revoke all sessions (security best practice)
    await this.prisma.refreshToken.deleteMany({
      where: { userId: resetToken.userId },
    });

    return {
      message:
        'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
    };
  }

  async generateSseToken(userId: string, tenantId: string) {
    const payload = {
      sub: userId,
      tenantId,
      purpose: 'sse_connection',
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '60s', // Extremely short-lived
    });

    return { token };
  }
}
