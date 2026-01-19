import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    Headers,
    HttpCode,
    HttpStatus,
    RawBodyRequest,
    Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreateSubscriptionDto, CreateEbookPurchaseDto } from './dto';
import { Public, CurrentUser, Roles } from '../../common/decorators';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    // ==================== SUBSCRIPTIONS ====================

    @Post('subscription/checkout')
    async createSubscriptionCheckout(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateSubscriptionDto,
    ) {
        return this.paymentsService.createSubscriptionCheckout(userId, dto.email, dto.frontUrl);
    }

    @Get('subscription/status')
    async getSubscriptionStatus(@CurrentUser('id') userId: string) {
        return this.paymentsService.getSubscriptionStatus(userId);
    }

    @Delete('subscription')
    async cancelSubscription(@CurrentUser('id') userId: string) {
        return this.paymentsService.cancelSubscription(userId);
    }

    // ==================== EBOOK PURCHASES ====================

    @Post('ebook/checkout')
    async createEbookPurchaseCheckout(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateEbookPurchaseDto,
    ) {
        return this.paymentsService.createEbookPurchaseCheckout(
            userId,
            dto.ebookId,
            dto.email,
            dto.frontUrl,
        );
    }

    // ==================== WEBHOOKS ====================

    @Post('webhook')
    @Public()
    @HttpCode(HttpStatus.OK)
    async handleWebhook(
        @Body() body: any,
        @Headers('x-signature') xSignature: string,
        @Headers('x-request-id') xRequestId: string,
    ) {
        // Validación de firma (Seguridad)
        const isValid = await this.paymentsService.verifyWebhookSignature(
            xSignature,
            xRequestId,
            body?.data?.id || body?.id
        );

        if (!isValid) {
            return { status: 'error', reason: 'invalid signature' };
        }

        // Mercado Pago envía el tipo de notificación y el ID
        const type = body.type || body.topic;
        const dataId = body.data?.id || body.id;

        if (!type || !dataId) {
            return { status: 'ignored', reason: 'missing type or data.id' };
        }

        return this.paymentsService.handleWebhook(type, dataId.toString());
    }

    // ==================== ADMIN ====================

    @Get('admin/stats')
    @Roles('ADMIN')
    async getPaymentStats() {
        return this.paymentsService.getPaymentStats();
    }
}

