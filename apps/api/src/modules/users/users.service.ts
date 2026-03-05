import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.secure.user.findUnique({
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
        _count: {
          select: {
            purchases: true,
            progress: true,
            evaluations: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      ...user,
      hasActiveSubscription:
        user.subscription?.status === 'ACTIVE' &&
        (!user.subscription?.endDate ||
          new Date(user.subscription.endDate) > new Date()),
    };
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.secure.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findById(userId: string) {
    return this.prisma.secure.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });
  }

  async findByEmail(email: string, tenantId: string) {
    return this.prisma.secure.user.findFirst({
      where: { tenantId, email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  // Admin: Lista de usuarios
  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    search?: string,
    role?: Role,
    subscription?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    // Búsqueda por nombre o email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtro por rol
    if (role) {
      where.role = role;
    }

    // Filtro por suscripción
    if (subscription === 'active') {
      where.subscription = { status: 'ACTIVE' };
    } else if (subscription === 'inactive') {
      where.OR = [
        { subscription: null },
        { subscription: { status: { not: 'ACTIVE' } } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.secure.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          subscription: {
            select: {
              status: true,
            },
          },
        },
      }),
      this.prisma.secure.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Admin: Cambiar rol de usuario
  async updateRole(userId: string, role: Role) {
    const user = await this.prisma.secure.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    return user;
  }

  // Admin: Eliminar usuario
  async remove(userId: string) {
    await this.prisma.secure.user.delete({
      where: { id: userId },
    });
    return { message: 'Usuario eliminado correctamente' };
  }
}
