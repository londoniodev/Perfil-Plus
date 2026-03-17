import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDriverDto, UpdateDriverDto } from './dto';
import { Role, DriverStatus } from '@alvarosky/database';

@Injectable()
export class DeliveryDriversService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDriverDto, tenantId: string) {
    // Verificar que el usuario existe y tiene rol DRIVER
    const user = await this.prisma.secure.user.findFirst({
      where: { id: dto.userId, tenantId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.role !== Role.DRIVER) {
      throw new BadRequestException(
        'El usuario debe tener rol DRIVER para ser registrado como domiciliario',
      );
    }

    // Verificar que no exista ya un driver para este usuario
    const existing = await this.prisma.secure.deliveryDriver.findUnique({
      where: { userId: dto.userId },
    });

    if (existing) {
      throw new ConflictException(
        'Este usuario ya está registrado como domiciliario',
      );
    }

    return this.prisma.secure.deliveryDriver.create({
      data: {
        tenantId,
        userId: dto.userId,
        phone: dto.phone,
        vehicle: dto.vehicle,
        status: DriverStatus.OFFLINE,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.secure.deliveryDriver.findMany({
      where: { tenantId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: {
          select: {
            orders: {
              where: {
                status: { in: ['ASSIGNED', 'IN_TRANSIT'] },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAvailable(tenantId: string) {
    return this.prisma.secure.deliveryDriver.findMany({
      where: {
        tenantId,
        status: DriverStatus.AVAILABLE,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });
  }

  async findOne(id: string, tenantId: string) {
    const driver = await this.prisma.secure.deliveryDriver.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        orders: {
          where: {
            status: { in: ['ASSIGNED', 'IN_TRANSIT'] },
          },
          include: {
            items: { include: { modifiers: true } },
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException('Domiciliario no encontrado');
    }

    return driver;
  }

  async update(id: string, dto: UpdateDriverDto, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.secure.deliveryDriver.update({
      where: { id },
      data: {
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.vehicle !== undefined && { vehicle: dto.vehicle }),
        ...(dto.status && { status: dto.status }),
        ...(dto.maxCapacity !== undefined && { maxCapacity: dto.maxCapacity }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    const driver = await this.prisma.secure.deliveryDriver.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException('Perfil de domiciliario no encontrado');
    }

    return driver;
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    await this.prisma.secure.deliveryDriver.delete({
      where: { id },
    });

    return { message: 'Domiciliario eliminado correctamente' };
  }
}
