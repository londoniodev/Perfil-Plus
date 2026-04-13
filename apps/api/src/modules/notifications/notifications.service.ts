import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@alvarosky/database';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una notificación efímera de alto impacto.
   * Solo para alertas críticas (NEW_ORDER, HANDOFF, ALERT).
   */
  async create(
    tenantId: string,
    title: string,
    message: string,
    type: NotificationType,
    branchId?: string,
  ) {
    const notification = await this.prisma.appNotification.create({
      data: {
        tenantId,
        branchId: branchId || null,
        title,
        message,
        type,
      },
    });

    this.logger.log(
      `[Tenant: ${tenantId}] Notificación creada: ${type} — ${title}`,
    );

    return notification;
  }

  /**
   * Lista todas las notificaciones del tenant actual (por CLS o tenantId explícito).
   * Sin paginado por diseño: el hub efímero debe tener pocas notificaciones activas.
   */
  async findAll(tenantId?: string) {
    return this.prisma.appNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Eliminación FÍSICA de una notificación.
   * El admin descarta = se borra para siempre de la DB.
   */
  async delete(id: string) {
    const notification = await this.prisma.appNotification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }

    await this.prisma.appNotification.delete({
      where: { id },
    });

    this.logger.log(`Notificación ${id} eliminada físicamente de la DB`);

    return { deleted: true };
  }
}
