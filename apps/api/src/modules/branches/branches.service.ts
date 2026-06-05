import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class BranchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {}

  async findAll(tenantId?: string) {
    const activeTenantId = tenantId || this.cls.get('tenantId');
    if (!activeTenantId) {
      return [];
    }
    return this.prisma.branch.findMany({
      where: { tenantId: activeTenantId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.secure.branch.findUnique({
      where: { id },
      include: {
        branchSettings: true,
      },
    });

    if (!branch) {
      throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
    }

    return branch;
  }

  async updateSettings(branchId: string, data: any) {
    // Asegurar que la sucursal existe dentro del tenant
    await this.findOne(branchId);

    return this.prisma.secure.branchSettings.update({
      where: { branchId },
      data,
    });
  }
}
