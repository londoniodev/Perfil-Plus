import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WaCartController } from './wa-cart.controller';
import { WhatsappProcessor } from './whatsapp.processor';
import { OpenAiProvider } from './providers/openai.provider';
import { RestaurantContextService } from './services/restaurant-context.service';
import { MetaApiService } from './services/meta-api.service';
import { UsageGuardService } from './services/usage-guard.service';
import { WhatsappOnboardingService } from './services/whatsapp-onboarding.service';
import { WhatsappOnboardingController } from './whatsapp-onboarding.controller';
import { WaCartCronService } from './services/wa-cart.cron';
import { FeedbackCronService } from './services/feedback.cron';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [
    WhatsappController,
    WaCartController,
    WhatsappOnboardingController,
  ],
  providers: [
    WhatsappProcessor,
    OpenAiProvider,
    RestaurantContextService,
    MetaApiService,
    UsageGuardService,
    WhatsappOnboardingService,
    WaCartCronService,
    FeedbackCronService,
  ],
  exports: [MetaApiService],
})
export class WhatsappModule {}

