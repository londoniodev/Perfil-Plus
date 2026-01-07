import { Controller, Get, Patch, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { UsersService } from './users.service';
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
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    ) {
        return this.usersService.findAll(page, limit);
    }
}
