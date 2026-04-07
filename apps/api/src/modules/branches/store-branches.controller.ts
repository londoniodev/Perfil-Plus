import { Controller, Get } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('store/branches')
export class StoreBranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Public()
  @Get()
  async findAll() {
    const branches = await this.branchesService.findAll();
    // Retornamos solo ID y nombre para el storefront público
    return branches.map(b => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      isDefault: b.isDefault,
    }));
  }
}
