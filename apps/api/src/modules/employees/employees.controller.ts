import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@alvarosky/database';
import { CurrentTenant } from '../../common/decorators';

@Controller('admin/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  async create(
    @Body() dto: CreateEmployeeDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.employeesService.create(dto, tenantId);
  }

  @Get()
  async findAll(@CurrentTenant() tenantId: string) {
    return this.employeesService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.employeesService.findOne(id, tenantId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.employeesService.update(id, dto, tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.employeesService.remove(id, tenantId);
  }
}
