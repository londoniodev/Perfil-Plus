import { Controller, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { WhatsappOnboardingService } from './services/whatsapp-onboarding.service';
import { ClsService } from 'nestjs-cls';

@Controller('whatsapp/onboarding')
export class WhatsappOnboardingController {
  constructor(
    private readonly onboardingService: WhatsappOnboardingService,
    private readonly cls: ClsService,
  ) {}

  @Post('callback')
  async handleCallback(@Body('code') code: string) {
    if (!code) {
      throw new BadRequestException('El código de Meta es requerido');
    }

    const tenantId = this.cls.get('tenantId');
    if (!tenantId) {
      throw new BadRequestException('No se pudo identificar el Tenant actual');
    }

    return this.onboardingService.processOnboarding(code, tenantId);
  }
}
