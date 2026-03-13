import { Controller, Get, Param, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller('wa-cart')
export class WaCartController {
  private readonly logger = new Logger(WaCartController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /api/wa-cart/:id
   * Endpoint público que retorna los datos del carrito temporal de WhatsApp.
   */
  @Get(':id')
  async getCart(@Param('id') id: string) {
    const cart = await (this.prisma as any).waCart.findUnique({
      where: { id },
    });

    if (!cart) {
      this.logger.warn(`Carrito no encontrado: ${id}`);
      throw new NotFoundException('Carrito no encontrado.');
    }

    // Verificar expiración
    if (new Date() > new Date(cart.expiresAt)) {
      this.logger.warn(`Carrito expirado: ${id}`);
      throw new NotFoundException('Este enlace de carrito ha expirado.');
    }

    return {
      items: cart.cartData,
      customerData: cart.customerData, // Perfil pre-llenado
      createdAt: cart.createdAt,
      expiresAt: cart.expiresAt,
    };
  }
}
