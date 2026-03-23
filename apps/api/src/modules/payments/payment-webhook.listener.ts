import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ClsService } from 'nestjs-cls';
import { PaymentsService } from './payments.service';

@Injectable()
export class PaymentWebhookListener {
  private readonly logger = new Logger(PaymentWebhookListener.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly cls: ClsService,
  ) {}

  @OnEvent('payment.received', { async: true })
  async handlePaymentEvent(payload: {
    tenantId: string;
    dataId: string;
    body: any;
  }) {
    this.logger.log(
      `Processing payment event for tenant: ${payload.tenantId}, dataId: ${payload.dataId}`,
    );

    // Inyectar el contexto del tenant en CLS para que PaymentsService y Prisma lo detecten
    await this.cls.runWith({ tenantId: payload.tenantId } as any, async () => {
      try {
        const type = payload.body.type || payload.body.topic;
        await this.paymentsService.handleWebhook(type, payload.dataId);
        this.logger.log(
          `Payment event processed successfully for dataId: ${payload.dataId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error processing payment event for dataId: ${payload.dataId}`,
          error.stack,
        );
      }
    });
  }
}
