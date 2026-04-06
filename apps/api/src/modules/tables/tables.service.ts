import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  private readonly logger = new Logger(TablesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.table.findMany({
      where: { tenantId },
      orderBy: { label: 'asc' },
    });
  }

  async resolve(id: string) {
    const table = await this.prisma.unscoped.table.findUnique({
      where: { id },
      include: {
        tenant: { select: { slug: true } },
      },
    });

    if (!table) {
      throw new NotFoundException(`Mesa con ID ${id} no encontrada`);
    }

    return {
      tableNumber: table.label,
      tenantSlug: table.tenant.slug,
      branchId: table.branchId,
    };
  }

  async findOne(tenantId: string, id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
    });

    if (!table || table.tenantId !== tenantId) {
      throw new NotFoundException(
        `Mesa con ID ${id} no encontrada en este tenant`,
      );
    }

    return table;
  }

  async create(tenantId: string, createDto: CreateTableDto) {
    const defaultBranch = await this.prisma.branch.findFirst({
      where: { tenantId, isDefault: true },
      select: { id: true },
    });

    return this.prisma.table.create({
      data: {
        tenantId,
        branchId: defaultBranch!.id,
        label: createDto.label,
        capacity: createDto.capacity ?? 4,
        status: createDto.status ?? 'ACTIVE',
        x: createDto.x ?? 0,
        y: createDto.y ?? 0,
      },
    });
  }

  async update(tenantId: string, id: string, updateDto: UpdateTableDto) {
    // Verificar propiedad the tenant antes the actualizar (Vulnerabilidad IDOR)
    const existing = await this.prisma.table.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Mesa con ID ${id} no encontrada en este tenant`,
      );
    }

    return this.prisma.table.update({
      where: { id }, // La propiedad está verificada en paso superior
      data: updateDto,
    });
  }

  async remove(tenantId: string, id: string) {
    // Prevenir IDOR en el borrado
    const existing = await this.prisma.table.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Mesa con ID ${id} no encontrada en este tenant`,
      );
    }

    // Comprobar relaciones si existieran. Las Ordenes (`Order`) tienen tableNumber pero no estan atadas a ForeignKey de Table para cascade delete en schema, sino que es un mero string (tableNumber). Así que es seguro borrar la mesa sin romper DB relations.

    await this.prisma.table.delete({
      where: { id },
    });

    this.logger.log(`Mesa eliminada ID: ${id} x Tenant ID: ${tenantId}`);
    return { success: true };
  }
}
