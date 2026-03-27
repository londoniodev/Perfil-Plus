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
  Query,
} from '@nestjs/common';
import * as express from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentsService } from './payments.service';
import { CreateSubscriptionDto, CreateCheckoutDto } from './dto';
import { Public, CurrentUser, Roles } from '../../common/decorators';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ==================== SUBSCRIPTIONS ====================

  @Post('subscription/checkout')
  async createSubscriptionCheckout(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.paymentsService.createSubscriptionCheckout(
      userId,
      dto.email,
      dto.frontUrl,
    );
  }

  @Get('subscription/status')
  async getSubscriptionStatus(@CurrentUser('id') userId: string) {
    return this.paymentsService.getSubscriptionStatus(userId);
  }

  @Delete('subscription')
  async cancelSubscription(@CurrentUser('id') userId: string) {
    return this.paymentsService.cancelSubscription(userId);
  }

  @Post('product/checkout')
  @Public()
  async createProductCheckout(
    @Req() req: express.Request,
    @Body() dto: CreateCheckoutDto,
  ) {
    // Obtenemos el tenantId inyectado en la request por el middleware Multi-tenant
    const tenantId =
      (req as any).tenantId || req.headers['x-tenant-id'] || 'default';
    return this.paymentsService.createProductCheckout(dto, tenantId);
  }

  // ==================== WEBHOOKS ====================

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: any,
    @Headers('x-signature') xSignature: string,
    @Headers('x-request-id') xRequestId: string,
    @Query('tenantId') tenantId: string,
  ) {
    const dataId = body?.data?.id || body?.id;

    if (!tenantId) {
      return { status: 'error', reason: 'tenantId missing from query' };
    }

    const isValid = await this.paymentsService.verifyWebhookSignature(
      xSignature,
      xRequestId,
      dataId,
    );

    if (!isValid) {
      return { status: 'error', reason: 'invalid signature' };
    }

    const type = body.type || body.topic;

    if (type === 'payment') {
      this.eventEmitter.emit('payment.received', {
        tenantId,
        dataId: dataId.toString(),
        body,
      });
    }

    return { status: 'received', message: 'Payment processing triggered' };
  }

  @Post('webhook/bold')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleBoldWebhook(
    @Req() req: RawBodyRequest<express.Request>,
    @Body() body: any,
    @Headers('x-bold-signature') signature: string,
    @Query('tenantId') tenantId: string,
  ) {
    if (!tenantId) {
      return { status: 'error', reason: 'tenantId missing from query' };
    }

    // Pasamos el rawBody para la validación de firma HMAC
    return this.paymentsService.processBoldWebhook(
      body,
      tenantId,
      signature,
      req.rawBody,
    );
  }

  // ==================== ADMIN ====================

  @Get('admin/stats')
  @Roles('ADMIN')
  async getPaymentStats() {
    return this.paymentsService.getPaymentStats();
  }
}
