import { Controller, Post, Body, Get, Query, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { Public, CurrentUser } from '../../common/decorators';

// Cookie configuration
// Cookie configuration helpers
const getCookieOptions = (isProduction: boolean, domain?: string) => ({
    httpOnly: true,
    secure: isProduction, // HTTPS required for Secure
    sameSite: isProduction ? 'none' as const : 'lax' as const, // 'none' para máxima compatibilidad cross-domain
    path: '/',
    domain: domain, // Dynamic domain
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
        @Req() req: Request,
    ) {
        const result = await this.authService.register(dto);

        // Establecer cookies
        const hostname = req.get('host') || req.hostname;
        this.setAuthCookies(res, result.accessToken, result.refreshToken, hostname);

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
        @Req() req: Request,
    ) {
        const result = await this.authService.login(dto);

        // Retornar usuario sin tokens en el body
        const hostname = req.get('host') || req.hostname;
        const domain = (hostname && hostname.includes('mauromera.com')) ? '.mauromera.com' : undefined;

        console.log('🔍 Login Debug:', {
            hostHeader: req.get('host'),
            hostname: req.hostname,
            calculatedDomain: domain,
            isProduction: this.isProduction(),
            timestamp: new Date().toISOString(),
        });

        // Establecer cookies
        this.setAuthCookies(res, result.accessToken, result.refreshToken, hostname);

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
        const hostname = req.get('host') || req.hostname;
        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken, hostname);

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
        const hostname = req.get('host') || req.hostname;
        this.clearAuthCookies(res, hostname);

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

    private setAuthCookies(res: Response, accessToken: string, refreshToken: string, hostname?: string) {
        const isProd = this.isProduction();
        // Determinar dominio: si el hostname incluye mauromera.com, usamos .mauromera.com (subdominios)
        const domain = (hostname && hostname.includes('mauromera.com')) ? '.mauromera.com' : undefined;

        // Access token cookie (7 días)
        res.cookie('accessToken', accessToken, {
            ...getCookieOptions(isProd, domain),
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        });

        // Refresh token cookie (30 días)
        res.cookie('refreshToken', refreshToken, {
            ...getCookieOptions(isProd, domain),
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
        });
    }

    private clearAuthCookies(res: Response, hostname?: string) {
        const isProd = this.isProduction();

        // Clear cookies with the domain they were set on
        const clearOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' as const : 'lax' as const,
            path: '/',
        };

        // Clear with .mauromera.com domain (production)
        if (hostname && hostname.includes('mauromera.com')) {
            res.clearCookie('accessToken', { ...clearOptions, domain: '.mauromera.com' });
            res.clearCookie('refreshToken', { ...clearOptions, domain: '.mauromera.com' });
        }

        // Also clear without domain (for localhost/development and as fallback)
        res.clearCookie('accessToken', clearOptions);
        res.clearCookie('refreshToken', clearOptions);

        // Extra: set expired cookies as final fallback
        res.cookie('accessToken', '', { ...clearOptions, maxAge: 0 });
        res.cookie('refreshToken', '', { ...clearOptions, maxAge: 0 });

        if (hostname && hostname.includes('mauromera.com')) {
            res.cookie('accessToken', '', { ...clearOptions, domain: '.mauromera.com', maxAge: 0 });
            res.cookie('refreshToken', '', { ...clearOptions, domain: '.mauromera.com', maxAge: 0 });
        }
    }

}
