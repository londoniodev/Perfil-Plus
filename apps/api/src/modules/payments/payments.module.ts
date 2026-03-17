import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentWebhookListener } from './payment-webhook.listener';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentWebhookListener],
  exports: [PaymentsService],
})
export class PaymentsModule {}
