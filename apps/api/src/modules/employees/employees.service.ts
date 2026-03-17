import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
import { Role } from '@alvarosky/database';
import * as bcrypt from 'bcryptjs';

const STAFF_ROLES: Role[] = [Role.WAITER, Role.KITCHEN, Role.CASHIER, Role.DRIVER];

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto, tenantId: string) {
    // Validar que el rol sea de staff
    if (!STAFF_ROLES.includes(dto.role)) {
      throw new BadRequestException(
        `El rol debe ser uno de: ${STAFF_ROLES.join(', ')}`,
      );
    }

    // Verificar email duplicado
    const existing = await this.prisma.secure.user.findFirst({
      where: { tenantId, email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Ya existe un usuario con este email');
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const employee = await this.prisma.secure.user.create({
      data: {
        tenantId,
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.name,
        role: dto.role,
        avatar: dto.avatar,
        emailVerified: true, // Empleados no necesitan verificar email
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return employee;
  }

  async findAll(tenantId: string) {
    const users = await this.prisma.secure.user.findMany({
      where: {
        tenantId,
        role: { in: STAFF_ROLES },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    console.log(`[EmployeesService] Found ${users.length} employees`);
    if (users.length > 0)
      console.log(
        `[EmployeesService] Sample: ${users[0].email} (${users[0].role})`,
      );
    return users;
  }

  async findOne(id: string, tenantId: string) {
    const employee = await this.prisma.secure.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    if (!STAFF_ROLES.includes(employee.role)) {
      throw new NotFoundException('Empleado no encontrado');
    }

    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto, tenantId: string) {
    // Verificar que existe y es staff
    await this.findOne(id, tenantId);

    // Si se cambia el rol, validar que sea de staff
    if (dto.role && !STAFF_ROLES.includes(dto.role)) {
      throw new BadRequestException(
        `El rol debe ser uno de: ${STAFF_ROLES.join(', ')}`,
      );
    }

    const updated = await this.prisma.secure.user.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.role && { role: dto.role }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async remove(id: string, tenantId: string) {
    // Verificar que existe y es staff
    await this.findOne(id, tenantId);

    await this.prisma.secure.user.delete({
      where: { id },
    });

    return { message: 'Empleado eliminado correctamente' };
  }
}
