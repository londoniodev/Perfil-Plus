import { Controller, Post, Body, Get, Query, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { Public, CurrentUser } from '../../common/decorators';

// Cookie configuration
const COOKIE_OPTIONS = (isProduction: boolean) => ({
    httpOnly: true,
    secure: isProduction, // Solo HTTPS en producción
    sameSite: isProduction ? 'strict' as const : 'lax' as const,
    path: '/',
});

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private configService: ConfigService,
    ) { }

    private isProduction(): boolean {
        return this.configService.get('NODE_ENV') === 'production';
    }

    @Public()
    @Post('register')
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.register(dto);

        // Establecer cookies
        this.setAuthCookies(res, result.accessToken, result.refreshToken);

        // Retornar usuario sin tokens en el body
        return {
            user: result.user,
            message: result.message,
        };
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.login(dto);

        // Establecer cookies
        this.setAuthCookies(res, result.accessToken, result.refreshToken);

        // Retornar usuario sin tokens en el body
        return {
            user: result.user,
        };
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        // Leer refresh token de la cookie
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            res.status(401);
            return { message: 'No refresh token provided' };
        }

        const tokens = await this.authService.refreshToken(refreshToken);

        // Establecer nuevas cookies
        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

        return { message: 'Tokens refreshed successfully' };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @CurrentUser('id') userId: string,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.refreshToken;

        await this.authService.logout(userId, refreshToken);

        // Limpiar cookies
        this.clearAuthCookies(res);

        return { message: 'Sesión cerrada correctamente' };
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

    // ============ Cookie Helpers ============

    private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
        const isProd = this.isProduction();

        // Access token cookie (15 minutos)
        res.cookie('accessToken', accessToken, {
            ...COOKIE_OPTIONS(isProd),
            maxAge: 15 * 60 * 1000, // 15 minutos
        });

        // Refresh token cookie (7 días)
        res.cookie('refreshToken', refreshToken, {
            ...COOKIE_OPTIONS(isProd),
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        });
    }

    private clearAuthCookies(res: Response) {
        const isProd = this.isProduction();

        res.cookie('accessToken', '', {
            ...COOKIE_OPTIONS(isProd),
            maxAge: 0,
        });

        res.cookie('refreshToken', '', {
            ...COOKIE_OPTIONS(isProd),
            maxAge: 0,
        });
    }
}
