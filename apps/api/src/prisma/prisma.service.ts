import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@alvarosky/database';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  /**
   * ⚠️ MANDAMIENTO #3 (Seguridad Primero) - REGLAS DE USO PARA EL ESCAPE HATCH:
   * 1. Solo en módulos de infraestructura: TenantService (SuperAdmin), Cron Jobs Globales.
   * 2. Prohibido en Controladores/Servicios de Negocio: Ningún Administrador de restaurante
   *    debe invocar lógica que use .unscoped.
   * 3. El uso de .unscoped anula el aislamiento Zero-Trust. Debe auditarse con extrema precaución.
   */
  public unscoped: PrismaClient;

  constructor(private readonly cls: ClsService) {
    super({
      log:
        process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

    // Este objeto 'target' es esencialmente la instancia cruda
    this.unscoped = this;

    // Generamos el cliente seguro con RLS Global
    const secureClient = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const globalModels = [
              'User',
              'EmailVerificationToken',
              'RefreshToken',
              'PasswordResetToken',
              'Tenant',
              'OrderItem',
              'OrderItemModifier',
              'Payment',
              'WarehouseStock',
              'RecipeIngredient',
              'InventoryCountLine',
              'CategoriesOnPosts',
              'CategoriesOnProducts',
              'TagsOnPosts',
              'LessonAttachment',
              'PostAttachment',
              'Evaluation',
              'Question',
              'EvaluationResult',
              'UserProgress',
              'Purchase',
              'OrderDeliveryAnalytics',
              'Subscription',
            ];

            if (globalModels.includes(model)) {
              return query(args);
            }

            const safeTenantId = cls.get('tenantId');
            const role = cls.get('role');

            // ✅ SUPERADMIN Bypass: Los administradores globales pueden ver/editar cualquier registro
            if (role === 'SUPERADMIN') {
              return query(args);
            }

            if (safeTenantId) {
              if (
                [
                  'findMany',
                  'findFirst',
                  'findUnique',
                  'findUniqueOrThrow',
                  'count',
                  'update',
                  'updateMany',
                  'delete',
                  'deleteMany',
                  'aggregate',
                  'groupBy',
                ].includes(operation)
              ) {
                // @ts-ignore
                args.where = { ...args.where, tenantId: safeTenantId };
              }

              if (operation === 'create' && safeTenantId) {
                // @ts-ignore
                args.data = { ...args.data, tenantId: safeTenantId };
              }

              if (operation === 'createMany' && safeTenantId && args.data) {
                if (Array.isArray(args.data)) {
                  args.data = args.data.map((item) => ({
                    ...item,
                    tenantId: safeTenantId,
                  }));
                } else {
                  // @ts-ignore
                  args.data = { ...args.data, tenantId: safeTenantId };
                }
              }
            }

            return query(args);
          },
        },
      },
    });

    // Inversión de Control: Retornamos un Proxy para que la clase exponga
    // por defecto al Cliente Seguro
    return new Proxy(this, {
      get: (target, prop) => {
        // Excepciones explícitas de capa de Servicio
        if (prop === 'unscoped') return target;
        if (prop === 'logger') return target.logger;
        if (prop === 'onModuleInit') return target.onModuleInit.bind(target);
        if (prop === 'onModuleDestroy')
          return target.onModuleDestroy.bind(target);

        // Todo lo demás se redirige al cliente seguro por defecto (.product, .user, .$transaction, etc)
        const secureFeature = (secureClient as any)[prop];
        if (typeof secureFeature === 'function') {
          // Envolver o retornar directo. Prisma pre-hace bind en `$extends`.
          return secureFeature;
        }

        return secureFeature ?? (target as any)[prop];
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Base de datos conectada (Capa: Secure By Default)');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }
}
