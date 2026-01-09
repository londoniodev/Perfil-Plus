import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { Public, CurrentUser } from '../../common/decorators';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshToken(dto.refreshToken);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @CurrentUser('id') userId: string,
        @Body('refreshToken') refreshToken?: string,
    ) {
        return this.authService.logout(userId, refreshToken);
    }

    @Get('me')
    async getMe(@CurrentUser('id') userId: string) {
        return this.authService.getMe(userId);
    }

    // ============ Email Verification ============

    @Public()
    @Get('verify-email')
    async verifyEmail(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    @Public()
    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    async resendVerification(@Body('email') email: string) {
        return this.authService.resendVerificationEmail(email);
    }
}
