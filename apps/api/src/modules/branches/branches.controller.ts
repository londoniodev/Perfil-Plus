import {
    Controller,
    Get,
    Param,
    Patch,
    Body,
    UseGuards,
  } from '@nestjs/common';
  import { BranchesService } from './branches.service';
  import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../../common/guards/roles.guard';
  import { Roles } from '../../common/decorators/roles.decorator';
  import { Role } from '@alvarosky/database';
  
  @Controller('branches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class BranchesController {
    constructor(private readonly branchesService: BranchesService) {}
  
    @Get()
    @Roles(Role.ADMIN)
    async findAll() {
      return this.branchesService.findAll();
    }
  
    @Get(':id')
    @Roles(Role.ADMIN)
    async findOne(@Param('id') id: string) {
      return this.branchesService.findOne(id);
    }
  
    @Patch(':id/settings')
    @Roles(Role.ADMIN)
    async updateSettings(
      @Param('id') id: string,
      @Body() data: any,
    ) {
      return this.branchesService.updateSettings(id, data);
    }
  }
  
