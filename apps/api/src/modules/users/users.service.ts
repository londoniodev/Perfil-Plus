import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
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
                (!user.subscription?.endDate || new Date(user.subscription.endDate) > new Date()),
        };
    }

    async updateProfile(userId: string, dto: UpdateUserDto) {
        const user = await this.prisma.user.update({
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
        return this.prisma.user.findUnique({
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

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
    }

    // Admin: Lista de usuarios
    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
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
            this.prisma.user.count(),
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
        const user = await this.prisma.user.update({
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
        await this.prisma.user.delete({
            where: { id: userId },
        });
        return { message: 'Usuario eliminado correctamente' };
    }
}
