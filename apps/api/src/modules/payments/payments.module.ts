import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { BoldService } from './bold.service';
import { PaymentWebhookListener } from './payment-webhook.listener';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, BoldService, PaymentWebhookListener],
  exports: [PaymentsService, BoldService],
})
export class PaymentsModule {}
