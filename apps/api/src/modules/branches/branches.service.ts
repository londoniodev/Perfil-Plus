import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.secure.branch.findMany({
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
