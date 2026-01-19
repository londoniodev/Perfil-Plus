import { Controller, Get, Patch, Delete, Post, Body, Query, Param, ParseIntPipe, DefaultValuePipe, Inject, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { PaymentsService } from '../payments/payments.service';
import { UpdateUserDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    async getProfile(@CurrentUser('id') userId: string) {
        return this.usersService.getProfile(userId);
    }

    @Patch('profile')
    async updateProfile(
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateUserDto,
    ) {
        return this.usersService.updateProfile(userId, dto);
    }
}

@Controller('admin/users')
@Roles(Role.ADMIN)
export class AdminUsersController {
    constructor(
        private readonly usersService: UsersService,
        @Inject(forwardRef(() => PaymentsService))
        private readonly paymentsService: PaymentsService,
    ) { }

    @Get()
    @Get()
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query('search') search?: string,
        @Query('role') role?: Role,
        @Query('subscription') subscription?: string,
    ) {
        return this.usersService.findAll(page, limit, search, role, subscription);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Patch(':id/role')
    async updateRole(
        @Param('id') id: string,
        @Body('role') role: Role,
    ) {
        return this.usersService.updateRole(id, role);
    }

    @Post(':id/subscription')
    async assignSubscription(
        @Param('id') id: string,
        @Body('months') months?: number,
    ) {
        return this.paymentsService.assignManualSubscription(id, months);
    }

    @Delete(':id/subscription')
    async cancelSubscription(@Param('id') id: string) {
        return this.paymentsService.cancelSubscription(id);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}

