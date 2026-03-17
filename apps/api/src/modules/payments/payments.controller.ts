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
import type { Request } from 'express';
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
    @Req() req: Request,
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
    // 1. Validación de firma (Seguridad) - FAIL CLOSE
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
      // Retornamos 200 para que MP no reintente, pero registramos el error
      return { status: 'error', reason: 'invalid signature' };
    }

    // 2. Emitir evento para procesamiento asíncrono (Fast Acknowledgement)
    const type = body.type || body.topic;
    
    if (type === 'payment') {
      this.eventEmitter.emit('payment.received', {
        tenantId,
        dataId: dataId.toString(),
        body
      });
    }

    // 3. Retorno rápido 200 OK
    return { status: 'received', message: 'Payment processing triggered' };
  }

  // ==================== ADMIN ====================

  @Get('admin/stats')
  @Roles('ADMIN')
  async getPaymentStats() {
    return this.paymentsService.getPaymentStats();
  }
}
