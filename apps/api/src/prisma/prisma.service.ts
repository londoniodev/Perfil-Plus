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

  public readonly secure: ReturnType<typeof this.createExtendedClient>;

  /**
   * ⚠️ MANDAMIENTO #3 (Seguridad Primero) - REGLAS DE USO PARA RAW:
   * 1. Solo en módulos de infraestructura: TenantService (SuperAdmin), WaCartCronService (Limpieza Global).
   * 2. Prohibido en Controladores/Servicios de Negocio: Ningún Administrador de restaurante
   *    debe invocar lógica que use .raw.
   * 3. El uso de .raw anula el aislamiento Zero-Trust. Debe auditarse con extrema precaución.
   */
  public readonly raw: PrismaClient;

  constructor(private readonly cls: ClsService) {
    super({
      log:
        process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    this.raw = this; // El cliente base sin la extensión de seguridad
    this.secure = this.createExtendedClient();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Base de datos conectada (Instancia Singleton Global)');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }

  private createExtendedClient() {
    // CRÍTICO: Capturamos cls en una variable de closure porque
    // dentro de $extends, 'this' ya NO se refiere a PrismaService.
    const cls = this.cls;
    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const globalModels = [
              'User',
              'EmailVerificationToken',
              'RefreshToken',
              'PasswordResetToken',
              'SystemSetting',
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
              'Lesson',
              'LessonAttachment',
              'PostAttachment',
              'Evaluation',
              'Question',
              'EvaluationResult',
              'UserProgress',
              'Purchase',
            ];

            if (globalModels.includes(model)) {
              return query(args);
            }

            const safeTenantId = cls.get('tenantId');

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

              if (['create', 'createMany'].includes(operation) && safeTenantId) {
                // @ts-ignore
                args.data = { ...args.data, tenantId: safeTenantId };
              }
            }

            return query(args);
          },
        },
      },
    });
  }
}
