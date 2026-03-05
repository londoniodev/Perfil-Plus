import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { OrdersGateway } from './orders.gateway';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

// ============ MOCK FACTORIES ============

const MOCK_VARIANT = {
  id: 'var-1',
  productId: 'prod-1',
  sku: 'BURG-001',
  price: new Decimal(15.99),
  stock: 50,
  isDefault: true,
  name: 'Standard',
  product: {
    id: 'prod-1',
    name: 'Hamburguesa Clásica',
    published: true,
    isAvailable: true,
    modifierGroups: [
      {
        id: 'mg-1',
        productId: 'prod-1',
        name: 'Extras',
        minSelect: 0,
        maxSelect: 3,
        modifiers: [
          {
            id: 'mod-1',
            name: 'Queso Extra',
            priceAdjustment: new Decimal(2),
            stock: 20,
            isAvailable: true,
          },
          {
            id: 'mod-2',
            name: 'Tocino',
            priceAdjustment: new Decimal(3.5),
            stock: 15,
            isAvailable: true,
          },
        ],
      },
      {
        id: 'mg-2',
        productId: 'prod-1',
        name: 'Tamaño',
        minSelect: 1,
        maxSelect: 1,
        modifiers: [
          {
            id: 'mod-3',
            name: 'Regular',
            priceAdjustment: new Decimal(0),
            stock: null,
            isAvailable: true,
          },
          {
            id: 'mod-4',
            name: 'Grande',
            priceAdjustment: new Decimal(4),
            stock: null,
            isAvailable: true,
          },
        ],
      },
    ],
  },
};

const MOCK_ORDER = {
  id: 'order-1',
  userId: 'user-1',
  orderNumber: 'ORD-2026-0001',
  totalAmount: new Decimal(21.49),
  orderType: 'DINE_IN',
  tableNumber: '5',
  status: 'PENDING',
  items: [
    {
      id: 'oi-1',
      variantId: 'var-1',
      quantity: 1,
      price: new Decimal(21.49),
      productName: 'Hamburguesa Clásica',
      variantName: 'Standard',
      notes: 'Sin cebolla',
      modifiers: [
        {
          modifierId: 'mod-1',
          modifierName: 'Queso Extra',
          priceAdjustment: new Decimal(2),
          quantity: 1,
        },
        {
          modifierId: 'mod-2',
          modifierName: 'Tocino',
          priceAdjustment: new Decimal(3.5),
          quantity: 1,
        },
      ],
      variant: {
        id: 'var-1',
        product: { id: 'prod-1', name: 'Hamburguesa Clásica' },
      },
    },
  ],
};

function createMockTx() {
  const tx: any = {
    order: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    productVariant: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    modifier: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return tx;
}

describe('OrdersService', () => {
  let service: OrdersService;
  let mockClient: any;
  let mockTx: ReturnType<typeof createMockTx>;
  let mockGateway: any;
  let module: TestingModule;

  beforeEach(async () => {
    mockTx = createMockTx();
    mockClient = {
      ...mockTx,
      $transaction: jest.fn((fn) => fn(mockTx)),
    };
    mockGateway = { emit: jest.fn() };

    module = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: { client: mockClient },
        },
        {
          provide: StorageService,
          useValue: { getSignedUrl: jest.fn() },
        },
        {
          provide: OrdersGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  // ============ CREAR ORDEN ============

  describe('createOrder', () => {
    it('debería crear orden con cálculo de precio server-side', async () => {
      // Variante con precio 15.99, modificadores de +2, +3.5 (Extras) y +0 (Tamaño Regular)
      mockTx.productVariant.findUnique.mockResolvedValue(MOCK_VARIANT);
      mockTx.modifier.findUnique
        // Resolver mod-1 (Queso Extra, grupo Extras)
        .mockResolvedValueOnce({
          ...MOCK_VARIANT.product.modifierGroups[0].modifiers[0],
          group: MOCK_VARIANT.product.modifierGroups[0],
        })
        // Resolver mod-2 (Tocino, grupo Extras)
        .mockResolvedValueOnce({
          ...MOCK_VARIANT.product.modifierGroups[0].modifiers[1],
          group: MOCK_VARIANT.product.modifierGroups[0],
        })
        // Resolver mod-3 (Regular, grupo Tamaño) — satisface minSelect:1
        .mockResolvedValueOnce({
          ...MOCK_VARIANT.product.modifierGroups[1].modifiers[0],
          group: MOCK_VARIANT.product.modifierGroups[1],
        })
        // Para el decrement check de mod-1 y mod-2 (stock check)
        .mockResolvedValueOnce({ stock: 20 })
        .mockResolvedValueOnce({ stock: 15 });

      mockTx.order.create.mockResolvedValue(MOCK_ORDER);

      const dto = {
        orderType: 'DINE_IN' as any,
        tableNumber: '5',
        items: [
          {
            variantId: 'var-1',
            quantity: 1,
            notes: 'Sin cebolla',
            modifiers: [
              { modifierId: 'mod-1', quantity: 1 },
              { modifierId: 'mod-2', quantity: 1 },
              { modifierId: 'mod-3', quantity: 1 }, // Tamaño Regular
            ],
          },
        ],
      };

      const result = await service.createOrder('user-1', dto);

      // Verifica que se creó la orden con los datos correctos
      expect(mockTx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            orderType: 'DINE_IN',
            tableNumber: '5',
          }),
        }),
      );

      // Verifica que se decrementó stock de la variante
      expect(mockTx.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'var-1' },
        data: { stock: { decrement: 1 } },
      });

      expect(result).toEqual(MOCK_ORDER);

      // Verifica que se emitió evento SSE
      expect(mockGateway.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'new_order',
          orderId: MOCK_ORDER.id,
          data: expect.objectContaining({
            orderNumber: MOCK_ORDER.orderNumber,
          }),
        }),
      );
    });

    it('debería lanzar NotFoundException si la variante no existe', async () => {
      mockTx.productVariant.findUnique.mockResolvedValue(null);

      const dto = {
        items: [{ variantId: 'no-existe', quantity: 1 }],
      };

      await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería lanzar BadRequestException si stock es insuficiente', async () => {
      const lowStockVariant = {
        ...MOCK_VARIANT,
        stock: 2,
      };
      mockTx.productVariant.findUnique.mockResolvedValue(lowStockVariant);

      const dto = {
        items: [{ variantId: 'var-1', quantity: 5 }], // quiere 5, solo hay 2
      };

      await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(
        /Stock insuficiente/,
      );
    });

    it('debería lanzar BadRequestException si producto no está publicado', async () => {
      const unpublishedVariant = {
        ...MOCK_VARIANT,
        product: { ...MOCK_VARIANT.product, published: false },
      };
      mockTx.productVariant.findUnique.mockResolvedValue(unpublishedVariant);

      const dto = { items: [{ variantId: 'var-1', quantity: 1 }] };
      await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(
        /no disponible/,
      );
    });

    it('debería lanzar BadRequestException si producto no está disponible (isAvailable)', async () => {
      const unavailableVariant = {
        ...MOCK_VARIANT,
        product: { ...MOCK_VARIANT.product, isAvailable: false },
      };
      mockTx.productVariant.findUnique.mockResolvedValue(unavailableVariant);

      const dto = { items: [{ variantId: 'var-1', quantity: 1 }] };
      await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(
        /no disponible/,
      );
    });

    it('debería validar minSelect — lanzar error si se requiere selección mínima y no se envía', async () => {
      // El grupo "Tamaño" tiene minSelect: 1, pero no se envían modifiers de ese grupo
      mockTx.productVariant.findUnique.mockResolvedValue(MOCK_VARIANT);

      const dto = {
        items: [{ variantId: 'var-1', quantity: 1 }], // sin modifiers
      };

      await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(
        /requiere mínimo/,
      );
    });

    it('debería validar maxSelect — lanzar error si se excede el máximo', async () => {
      mockTx.productVariant.findUnique.mockResolvedValue(MOCK_VARIANT);

      // Grupo "Tamaño" tiene maxSelect: 1, enviamos 2 selecciones
      // Usamos mockImplementation para que cada llamada devuelva correctamente
      mockTx.modifier.findUnique.mockImplementation((args: any) => {
        if (args.where.id === 'mod-3') {
          return Promise.resolve({
            ...MOCK_VARIANT.product.modifierGroups[1].modifiers[0],
            group: MOCK_VARIANT.product.modifierGroups[1],
          });
        }
        if (args.where.id === 'mod-4') {
          return Promise.resolve({
            ...MOCK_VARIANT.product.modifierGroups[1].modifiers[1],
            group: MOCK_VARIANT.product.modifierGroups[1],
          });
        }
        return Promise.resolve(null);
      });

      const dto = {
        items: [
          {
            variantId: 'var-1',
            quantity: 1,
            modifiers: [
              { modifierId: 'mod-3', quantity: 1 },
              { modifierId: 'mod-4', quantity: 1 }, // ya son 2, maxSelect es 1
            ],
          },
        ],
      };

      await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(
        /permite máximo/,
      );
    });

    it('debería lanzar error si modificador no está disponible', async () => {
      const unavailableModifier = {
        ...MOCK_VARIANT.product.modifierGroups[0].modifiers[0],
        isAvailable: false,
        group: MOCK_VARIANT.product.modifierGroups[0],
      };

      mockTx.productVariant.findUnique.mockResolvedValue(MOCK_VARIANT);
      mockTx.modifier.findUnique.mockResolvedValueOnce(unavailableModifier);

      const dto = {
        items: [
          {
            variantId: 'var-1',
            quantity: 1,
            modifiers: [{ modifierId: 'mod-1', quantity: 1 }],
          },
        ],
      };

      await expect(service.createOrder('user-1', dto as any)).rejects.toThrow(
        /no disponible/,
      );
    });

    it('debería NO decrementar stock si variante es digital (stock = -1)', async () => {
      const digitalVariant = {
        ...MOCK_VARIANT,
        stock: -1,
        product: {
          ...MOCK_VARIANT.product,
          productType: 'DIGITAL',
          modifierGroups: [], // digital sin modifiers
        },
      };

      mockTx.productVariant.findUnique.mockResolvedValue(digitalVariant);
      mockTx.order.create.mockResolvedValue({ ...MOCK_ORDER, items: [] });

      const dto = {
        items: [{ variantId: 'var-1', quantity: 1 }],
      };

      await service.createOrder('user-1', dto as any);

      // NO debería llamar update en productVariant (no decrement)
      expect(mockTx.productVariant.update).not.toHaveBeenCalled();
    });

    describe('Guest Checkout', () => {
      it('debería crear orden para usuario invitado (userId null) con detalles de cliente', async () => {
        mockTx.productVariant.findUnique.mockResolvedValue(MOCK_VARIANT);
        // Mock modifier findUnique for the required size modifier
        mockTx.modifier.findUnique.mockResolvedValue({
          id: 'mod-3',
          name: 'Regular',
          priceAdjustment: new Decimal(0),
          stock: null,
          isAvailable: true,
          group: MOCK_VARIANT.product.modifierGroups[1],
        });

        // @ts-ignore
        mockTx.order.create.mockResolvedValue({ ...MOCK_ORDER, userId: null });

        const dto = {
          items: [
            {
              variantId: 'var-1',
              quantity: 1,
              modifiers: [{ modifierId: 'mod-3', quantity: 1 }], // Add required modifier
            },
          ],
          customerName: 'Guest User',
          customerPhone: '555-1234',
          orderType: 'DINE_IN' as any,
          tableNumber: '10',
        };

        await service.createOrder(undefined, dto as any);

        expect(mockTx.order.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              userId: null,
              customerName: 'Guest User',
              customerPhone: '555-1234',
              tableNumber: '10',
              orderType: 'DINE_IN',
            }),
          }),
        );
      });

      it('debería persistir datos de envío para delivery', async () => {
        mockTx.productVariant.findUnique.mockResolvedValue(MOCK_VARIANT);
        // Mock modifier findUnique
        mockTx.modifier.findUnique.mockResolvedValue({
          id: 'mod-3',
          name: 'Regular',
          priceAdjustment: new Decimal(0),
          stock: null,
          isAvailable: true,
          group: MOCK_VARIANT.product.modifierGroups[1],
        });

        // @ts-ignore
        mockTx.order.create.mockResolvedValue({
          ...MOCK_ORDER,
          userId: null,
          orderType: 'DELIVERY',
        });

        const shippingData = { address: 'Calle 123', city: 'Ciudad' };
        const dto = {
          items: [
            {
              variantId: 'var-1',
              quantity: 1,
              modifiers: [{ modifierId: 'mod-3', quantity: 1 }], // Add required modifier
            },
          ],
          customerName: 'Delivery User',
          customerPhone: '555-9876',
          orderType: 'DELIVERY' as any,
          shippingData,
        };

        await service.createOrder(undefined, dto as any);

        expect(mockTx.order.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              userId: null,
              orderType: 'DELIVERY',
              shippingData: expect.objectContaining(shippingData),
            }),
          }),
        );
      });
    });
  });

  // ============ CAMBIO DE ESTADO ============

  describe('updateStatus', () => {
    it('debería cambiar estado de orden existente', async () => {
      const updatedOrder = { ...MOCK_ORDER, status: 'PREPARING' };
      mockClient.order.findUnique.mockResolvedValue(MOCK_ORDER);
      mockClient.order.update.mockResolvedValue(updatedOrder);

      const result = await service.updateStatus(
        'order-1',
        { status: 'PREPARING' as any },
        'ADMIN' as any,
      );

      expect(mockClient.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'PREPARING' },
        include: expect.objectContaining({
          items: expect.objectContaining({
            include: expect.objectContaining({ modifiers: true }),
          }),
        }),
      });

      expect(result.status).toBe('PREPARING');
    });

    it('debería lanzar NotFoundException si la orden no existe', async () => {
      mockClient.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus(
          'no-existe',
          { status: 'PREPARING' as any },
          'ADMIN' as any,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============ LISTAR ÓRDENES ADMIN ============

  describe('findAllAdmin', () => {
    it('debería listar todas las órdenes sin filtro', async () => {
      const orders = [MOCK_ORDER];
      mockClient.order.findMany.mockResolvedValue(orders);

      const result = await service.findAllAdmin();

      expect(mockClient.order.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: expect.objectContaining({
          user: expect.objectContaining({
            select: expect.objectContaining({ email: true }),
          }),
          items: expect.anything(),
        }),
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual(orders);
    });

    it('debería filtrar órdenes por status', async () => {
      const pendingOrders = [MOCK_ORDER];
      mockClient.order.findMany.mockResolvedValue(pendingOrders);

      const result = await service.findAllAdmin('PENDING' as any);

      expect(mockClient.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PENDING' },
        }),
      );

      expect(result).toEqual(pendingOrders);
    });
  });

  // ============ FLUJO POS → COCINA (Status Inicial) ============

  describe('createOrder con status inicial', () => {
    it('debería crear orden con status PREPARING cuando POS lo envía (flujo mesero)', async () => {
      const variantNoModGroups = {
        ...MOCK_VARIANT,
        product: { ...MOCK_VARIANT.product, modifierGroups: [] },
      };
      mockTx.productVariant.findUnique.mockResolvedValue(variantNoModGroups);
      mockTx.order.create.mockResolvedValue({
        ...MOCK_ORDER,
        status: 'PREPARING',
      });

      const dto = {
        orderType: 'DINE_IN' as any,
        tableNumber: '5',
        status: 'PREPARING' as any, // POS envía directamente a cocina
        items: [{ variantId: 'var-1', quantity: 1 }],
      };

      await service.createOrder('user-1', dto);

      expect(mockTx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PREPARING',
          }),
        }),
      );
    });

    it('debería defaultear a PENDING si no se envía status', async () => {
      const variantNoModGroups = {
        ...MOCK_VARIANT,
        product: { ...MOCK_VARIANT.product, modifierGroups: [] },
      };
      mockTx.productVariant.findUnique.mockResolvedValue(variantNoModGroups);
      mockTx.order.create.mockResolvedValue(MOCK_ORDER);

      const dto = {
        orderType: 'DINE_IN' as any,
        tableNumber: '5',
        // sin status — debe defaultear a PENDING
        items: [{ variantId: 'var-1', quantity: 1 }],
      };

      await service.createOrder('user-1', dto);

      expect(mockTx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PENDING',
          }),
        }),
      );
    });
  });

  // ============ FILTRO ACTIVO PARA KDS ============

  describe('findAllAdmin con activeOnly', () => {
    it('debería filtrar por activeOnly=true retornando PENDING,APPROVED,PROCESSING,PREPARING,READY', async () => {
      const activeOrders = [
        { ...MOCK_ORDER, status: 'PREPARING' },
        { ...MOCK_ORDER, id: 'order-2', status: 'READY' },
      ];
      mockClient.order.findMany.mockResolvedValue(activeOrders);

      const result = await service.findAllAdmin(undefined, true);

      // Debe haber llamado findMany al menos una vez con los statuses activos
      expect(mockClient.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: {
              in: ['PENDING', 'APPROVED', 'PROCESSING', 'PREPARING', 'READY'],
            },
          },
        }),
      );
    });

    it('debería listar todas sin filtro cuando activeOnly=false', async () => {
      mockClient.order.findMany.mockResolvedValue([MOCK_ORDER]);

      await service.findAllAdmin(undefined, false);

      expect(mockClient.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: undefined,
        }),
      );
    });
  });

  // ============ CICLO COMPLETO: PENDING → PREPARING → READY → SERVED ============

  describe('Ciclo de vida completo de orden', () => {
    it('debería transicionar PENDING → PREPARING', async () => {
      const pendingOrder = { ...MOCK_ORDER, status: 'PENDING' };
      const preparingOrder = { ...MOCK_ORDER, status: 'PREPARING' };
      mockClient.order.findUnique.mockResolvedValue(pendingOrder);
      mockClient.order.update.mockResolvedValue(preparingOrder);

      const result = await service.updateStatus(
        'order-1',
        { status: 'PREPARING' as any },
        'ADMIN' as any,
      );
      expect(result.status).toBe('PREPARING');
    });

    it('debería transicionar PREPARING → READY (cocinero marca listo)', async () => {
      const preparingOrder = { ...MOCK_ORDER, status: 'PREPARING' };
      const readyOrder = { ...MOCK_ORDER, status: 'READY' };
      mockClient.order.findUnique.mockResolvedValue(preparingOrder);
      mockClient.order.update.mockResolvedValue(readyOrder);

      const result = await service.updateStatus(
        'order-1',
        { status: 'READY' as any },
        'ADMIN' as any,
      );
      expect(result.status).toBe('READY');
    });

    it('debería transicionar READY → SERVED (mesero entrega al cliente)', async () => {
      const readyOrder = { ...MOCK_ORDER, status: 'READY' };
      const servedOrder = { ...MOCK_ORDER, status: 'SERVED' };
      mockClient.order.findUnique.mockResolvedValue(readyOrder);
      mockClient.order.update.mockResolvedValue(servedOrder);

      const result = await service.updateStatus(
        'order-1',
        { status: 'SERVED' as any },
        'ADMIN' as any,
      );
      expect(result.status).toBe('SERVED');
    });

    it('debería permitir cancelar en cualquier estado', async () => {
      const preparingOrder = { ...MOCK_ORDER, status: 'PREPARING' };
      const cancelledOrder = { ...MOCK_ORDER, status: 'CANCELLED' };
      mockClient.order.findUnique.mockResolvedValue(preparingOrder);
      mockClient.order.update.mockResolvedValue(cancelledOrder);

      const result = await service.updateStatus(
        'order-1',
        { status: 'CANCELLED' as any },
        'ADMIN' as any,
      );
      expect(result.status).toBe('CANCELLED');
    });

    it('debería recuperar stock de variante y modificadores al cancelar orden', async () => {
      const preparingOrder = {
        ...MOCK_ORDER,
        status: 'PREPARING',
        items: [
          {
            ...MOCK_ORDER.items[0],
            variantId: 'var-1',
            quantity: 2,
            modifiers: [{ modifierId: 'mod-1', quantity: 1 }],
          },
        ],
      };
      const cancelledOrder = { ...preparingOrder, status: 'CANCELLED' };

      mockClient.order.findUnique.mockResolvedValue(preparingOrder);
      mockClient.order.update.mockResolvedValue(cancelledOrder);

      // Mock para findUnique de cada modifier para recuperar su stock original
      mockClient.modifier.findUnique.mockResolvedValue({
        id: 'mod-1',
        stock: 10,
      });

      await service.updateStatus(
        'order-1',
        { status: 'CANCELLED' as any },
        'ADMIN' as any,
      );

      // Verifica incremento de stock de la variante (2 unidades)
      expect(mockClient.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'var-1' },
        data: { stock: { increment: 2 } },
      });

      // Verifica incremento de stock del modificador (1 unidad * 2 items = 2?)
      // OJO: Mi lógica actual en service hace: item.quantity * mod.quantity
      expect(mockClient.modifier.update).toHaveBeenCalledWith({
        where: { id: 'mod-1' },
        data: { stock: { increment: 2 } }, // 2 (items) * 1 (mod/item)
      });
    });
  });

  // ============ MIS ÓRDENES (POS / Mesero) ============

  describe('findMyOrders', () => {
    it('debería retornar órdenes del usuario filtradas por status activos', async () => {
      const userOrders = [MOCK_ORDER];
      mockClient.order.findMany.mockResolvedValue(userOrders);

      const result = await service.findMyOrders('user-1');

      expect(mockClient.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 'user-1',
            status: {
              in: [
                'APPROVED',
                'DELIVERED',
                'SHIPPED',
                'PROCESSING',
                'PREPARING',
                'READY',
                'SERVED',
              ],
            },
          },
        }),
      );

      expect(result).toEqual(userOrders);
    });

    it('debería retornar array vacío si el usuario no tiene órdenes', async () => {
      mockClient.order.findMany.mockResolvedValue([]);

      const result = await service.findMyOrders('user-sin-ordenes');

      expect(result).toEqual([]);
    });

    it('debería ordenar por createdAt descendiente', async () => {
      mockClient.order.findMany.mockResolvedValue([]);

      await service.findMyOrders('user-1');

      expect(mockClient.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('debería incluir items con modifiers y variant.product', async () => {
      mockClient.order.findMany.mockResolvedValue([]);

      await service.findMyOrders('user-1');

      expect(mockClient.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            items: expect.objectContaining({
              include: expect.objectContaining({
                modifiers: true,
                variant: expect.objectContaining({
                  include: expect.objectContaining({
                    product: true,
                  }),
                }),
              }),
            }),
          }),
        }),
      );
    });
  });

  // ============ PAGOS (CAJA) ============

  describe('createPayment', () => {
    beforeEach(() => {
      // createPayment usa $transaction, así que reutilizamos mockTx
      mockTx.order.findUnique = jest.fn();
      mockTx.payment = { create: jest.fn() };
      mockTx.orderItem = {
        updateMany: jest.fn(),
        count: jest.fn(),
      };
      mockTx.order.update = jest.fn();
    });

    it('debería crear pago y marcar items como pagados', async () => {
      mockTx.order.findUnique.mockResolvedValue(MOCK_ORDER);
      mockTx.payment.create.mockResolvedValue({
        id: 'pay-1',
        amount: 21.49,
        method: 'CASH',
      });
      mockTx.orderItem.updateMany.mockResolvedValue({ count: 1 });
      mockTx.orderItem.count.mockResolvedValue(0); // No quedan items sin pagar

      const dto = {
        amount: 21.49,
        method: 'CASH',
        itemIds: ['oi-1'],
      };

      const result = await service.createPayment('order-1', dto as any);

      expect(mockTx.payment.create).toHaveBeenCalledWith({
        data: {
          orderId: 'order-1',
          amount: 21.49,
          method: 'CASH',
          reference: undefined,
        },
      });

      expect(mockTx.orderItem.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['oi-1'] },
          orderId: 'order-1',
        },
        data: { isPaid: true },
      });

      // Verifica que se emitió evento SSE de pago recibido
      expect(mockGateway.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'payment_received',
          orderId: 'order-1',
          data: expect.objectContaining({ amount: 21.49, closed: true }),
        }),
      );
    });

    it('debería cerrar orden automáticamente cuando todos los items están pagados', async () => {
      mockTx.order.findUnique.mockResolvedValue(MOCK_ORDER);
      mockTx.payment.create.mockResolvedValue({ id: 'pay-1' });
      mockTx.orderItem.updateMany.mockResolvedValue({ count: 1 });
      mockTx.orderItem.count.mockResolvedValue(0); // 0 items sin pagar

      const dto = { amount: 21.49, method: 'CASH', itemIds: ['oi-1'] };

      await service.createPayment('order-1', dto as any);

      // Debería cerrar la orden (status → DELIVERED)
      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'DELIVERED' },
      });
    });

    it('debería forzar cierre con closeOrder: true aunque queden items', async () => {
      mockTx.order.findUnique.mockResolvedValue(MOCK_ORDER);
      mockTx.payment.create.mockResolvedValue({ id: 'pay-1' });
      mockTx.orderItem.count.mockResolvedValue(2); // Quedan 2 items sin pagar

      const dto = { amount: 10, method: 'CARD', closeOrder: true };

      await service.createPayment('order-1', dto as any);

      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'DELIVERED' },
      });
    });

    it('debería NO cerrar orden si quedan items sin pagar y closeOrder no es true', async () => {
      mockTx.order.findUnique.mockResolvedValue(MOCK_ORDER);
      mockTx.payment.create.mockResolvedValue({ id: 'pay-1' });
      mockTx.orderItem.count.mockResolvedValue(1); // Queda 1 item sin pagar

      const dto = { amount: 10, method: 'CASH' };

      await service.createPayment('order-1', dto as any);

      // NO debería cerrar la orden
      expect(mockTx.order.update).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si la orden no existe', async () => {
      mockTx.order.findUnique.mockResolvedValue(null);

      const dto = { amount: 10, method: 'CASH' };

      await expect(
        service.createPayment('no-existe', dto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería aceptar pagos sin itemIds (pago parcial genérico)', async () => {
      mockTx.order.findUnique.mockResolvedValue(MOCK_ORDER);
      mockTx.payment.create.mockResolvedValue({ id: 'pay-1' });
      mockTx.orderItem.count.mockResolvedValue(1);

      const dto = { amount: 10, method: 'CASH' };

      const result = await service.createPayment('order-1', dto as any);

      // No debería llamar updateMany si no hay itemIds
      expect(mockTx.orderItem.updateMany).not.toHaveBeenCalled();
    });
  });

  // ============ CANCELACIÓN + RESTAURACIÓN DE STOCK ============

  describe('updateStatus — Cancelación con restauración de stock', () => {
    it('debería restaurar stock de variantes al cancelar orden', async () => {
      const orderWithVariantStock = {
        ...MOCK_ORDER,
        status: 'PREPARING',
        items: [
          {
            ...MOCK_ORDER.items[0],
            quantity: 2,
            modifiers: [],
            variant: { id: 'var-1', stock: 48, product: { id: 'prod-1' } },
          },
        ],
      };

      // findUnique en el check inicial (usa mockClient directamente)
      mockClient.order.findUnique.mockResolvedValue({
        ...MOCK_ORDER,
        status: 'PREPARING',
      });

      // findUnique dentro de la transacción (para obtener items con stock)
      mockTx.order.findUnique.mockResolvedValue(orderWithVariantStock);
      mockTx.order.update.mockResolvedValue({
        ...MOCK_ORDER,
        status: 'CANCELLED',
      });

      await service.updateStatus(
        'order-1',
        { status: 'CANCELLED' as any },
        'ADMIN' as any,
      );

      // Verificar que se incrementó stock de la variante
      expect(mockTx.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'var-1' },
        data: { stock: { increment: 2 } },
      });
    });

    it('debería restaurar stock de modificadores al cancelar orden', async () => {
      const orderWithModifiers = {
        ...MOCK_ORDER,
        status: 'PREPARING',
        items: [
          {
            ...MOCK_ORDER.items[0],
            quantity: 1,
            modifiers: [
              {
                modifierId: 'mod-1',
                modifierName: 'Queso Extra',
                priceAdjustment: new Decimal(2),
                quantity: 1,
              },
            ],
            variant: { id: 'var-1', stock: -1, product: { id: 'prod-1' } }, // -1 = infinito
          },
        ],
      };

      mockClient.order.findUnique.mockResolvedValue({
        ...MOCK_ORDER,
        status: 'PREPARING',
      });
      mockTx.order.findUnique.mockResolvedValue(orderWithModifiers);
      mockTx.order.update.mockResolvedValue({
        ...MOCK_ORDER,
        status: 'CANCELLED',
      });

      // El modificador original en la DB tiene stock controlado
      mockTx.modifier.findUnique.mockResolvedValue({ id: 'mod-1', stock: 19 });

      await service.updateStatus(
        'order-1',
        { status: 'CANCELLED' as any },
        'ADMIN' as any,
      );

      // Verificar que se incrementó stock del modificador
      expect(mockTx.modifier.update).toHaveBeenCalledWith({
        where: { id: 'mod-1' },
        data: { stock: { increment: 1 } },
      });
    });

    it('debería NO restaurar stock de variante digital (stock = -1)', async () => {
      const orderDigital = {
        ...MOCK_ORDER,
        status: 'PREPARING',
        items: [
          {
            ...MOCK_ORDER.items[0],
            quantity: 1,
            modifiers: [],
            variant: { id: 'var-1', stock: -1, product: { id: 'prod-1' } },
          },
        ],
      };

      mockClient.order.findUnique.mockResolvedValue({
        ...MOCK_ORDER,
        status: 'PREPARING',
      });
      mockTx.order.findUnique.mockResolvedValue(orderDigital);
      mockTx.order.update.mockResolvedValue({
        ...MOCK_ORDER,
        status: 'CANCELLED',
      });

      await service.updateStatus(
        'order-1',
        { status: 'CANCELLED' as any },
        'ADMIN' as any,
      );

      // No debería incrementar stock
      expect(mockTx.productVariant.update).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException al intentar cancelar orden ya cancelada', async () => {
      mockClient.order.findUnique.mockResolvedValue({
        ...MOCK_ORDER,
        status: 'CANCELLED',
      });

      await expect(
        service.updateStatus(
          'order-1',
          { status: 'CANCELLED' as any },
          'ADMIN' as any,
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateStatus(
          'order-1',
          { status: 'CANCELLED' as any },
          'ADMIN' as any,
        ),
      ).rejects.toThrow(/ya fue cancelada/);
    });
  });

  // ============ EVENTOS SSE ============

  describe('Emisión de eventos SSE', () => {
    it('debería emitir evento new_order al crear orden', async () => {
      const variantNoModGroups = {
        ...MOCK_VARIANT,
        product: { ...MOCK_VARIANT.product, modifierGroups: [] },
      };
      mockTx.productVariant.findUnique.mockResolvedValue(variantNoModGroups);
      mockTx.order.create.mockResolvedValue(MOCK_ORDER);

      const dto = {
        orderType: 'DINE_IN' as any,
        tableNumber: '5',
        items: [{ variantId: 'var-1', quantity: 1 }],
      };

      await service.createOrder('user-1', dto);

      // Obtener mock del gateway
      const mockGateway = (service as any).ordersGateway;
      expect(mockGateway.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'new_order',
          orderId: MOCK_ORDER.id,
        }),
      );
    });

    it('debería emitir evento status_changed al actualizar estado', async () => {
      mockClient.order.findUnique.mockResolvedValue(MOCK_ORDER);
      mockClient.order.update.mockResolvedValue({
        ...MOCK_ORDER,
        status: 'PREPARING',
      });

      await service.updateStatus(
        'order-1',
        { status: 'PREPARING' as any },
        'ADMIN' as any,
      );

      const mockGateway = (service as any).ordersGateway;
      expect(mockGateway.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'status_changed',
          orderId: 'order-1',
          data: { status: 'PREPARING' },
        }),
      );
    });

    it('debería emitir evento payment_received al crear pago', async () => {
      // Setup createPayment mocks
      mockTx.order.findUnique = jest.fn().mockResolvedValue(MOCK_ORDER);
      mockTx.payment = { create: jest.fn().mockResolvedValue({ id: 'pay-1' }) };
      mockTx.orderItem = {
        updateMany: jest.fn(),
        count: jest.fn().mockResolvedValue(1), // hay items sin pagar
      };
      mockTx.order.update = jest.fn();

      const dto = { amount: 21.49, method: 'CASH' };

      await service.createPayment('order-1', dto as any);

      const mockGateway = (service as any).ordersGateway;
      expect(mockGateway.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'payment_received',
          orderId: 'order-1',
          data: expect.objectContaining({
            amount: 21.49,
            method: 'CASH',
          }),
        }),
      );
    });
  });

  // ============ DESCARGAS DIGITALES ============

  describe('getDownloadUrl', () => {
    beforeEach(() => {
      // Reset mocks para este bloque
      mockClient.order = {
        ...mockClient.order,
        findFirst: jest.fn(),
      };
      mockClient.product = {
        findUnique: jest.fn(),
      };
    });

    it('debería retornar URL firmada para descarga digital válida (con orderId)', async () => {
      mockClient.order.findFirst.mockResolvedValue({
        id: 'order-1',
        items: [{ variantId: 'var-1' }],
      });

      mockClient.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        digitalFileUrl: 'uploads/ebook.pdf',
        productType: 'DIGITAL',
      });

      // Mock storage
      const mockStorage = (service as any).storage;
      mockStorage.getSignedUrl.mockResolvedValue(
        'https://signed-url.com/ebook.pdf',
      );

      const result = await service.getDownloadUrl(
        'user-1',
        'order-1',
        'prod-1',
      );

      expect(result).toEqual({
        downloadUrl: 'https://signed-url.com/ebook.pdf',
      });
    });

    it('debería lanzar ForbiddenException si el usuario no ha comprado el producto', async () => {
      mockClient.order.findFirst.mockResolvedValue(null);

      const { ForbiddenException } = require('@nestjs/common');
      await expect(
        service.getDownloadUrl('user-1', 'order-1', 'prod-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar NotFoundException si el producto no existe', async () => {
      mockClient.order.findFirst.mockResolvedValue({
        id: 'order-1',
        items: [],
      });
      mockClient.product.findUnique.mockResolvedValue(null);

      await expect(
        service.getDownloadUrl('user-1', 'order-1', 'prod-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar NotFoundException si producto no tiene archivo digital', async () => {
      mockClient.order.findFirst.mockResolvedValue({
        id: 'order-1',
        items: [],
      });
      mockClient.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        digitalFileUrl: null,
        productType: 'DIGITAL',
      });

      await expect(
        service.getDownloadUrl('user-1', 'order-1', 'prod-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería buscar orden sin orderId específico (cualquier orden válida)', async () => {
      mockClient.order.findFirst.mockResolvedValue({ id: 'order-any' });

      mockClient.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        digitalFileUrl: 'uploads/file.pdf',
        productType: 'DIGITAL',
      });

      const mockStorage = (service as any).storage;
      mockStorage.getSignedUrl.mockResolvedValue('https://signed.com/file.pdf');

      const result = await service.getDownloadUrl('user-1', null, 'prod-1');

      expect(mockClient.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            items: expect.objectContaining({
              some: expect.objectContaining({
                variant: { productId: 'prod-1' },
              }),
            }),
          }),
        }),
      );

      expect(result).toEqual({ downloadUrl: 'https://signed.com/file.pdf' });
    });
  });

  // ============ ORDEN CON MÚLTIPLES ITEMS ============

  describe('createOrder con múltiples items', () => {
    it('debería calcular totalAmount correctamente con múltiples items', async () => {
      // Variante 1: precio 15.99, sin modificadores
      const variant1 = {
        ...MOCK_VARIANT,
        id: 'var-1',
        price: new Decimal(15.99),
        product: { ...MOCK_VARIANT.product, modifierGroups: [] },
      };

      // Variante 2: precio 5.00, sin modificadores
      const variant2 = {
        ...MOCK_VARIANT,
        id: 'var-2',
        price: new Decimal(5.0),
        stock: 100,
        product: {
          ...MOCK_VARIANT.product,
          id: 'prod-2',
          name: 'Coca Cola',
          modifierGroups: [],
        },
      };

      mockTx.productVariant.findUnique
        .mockResolvedValueOnce(variant1)
        .mockResolvedValueOnce(variant2);

      // Total esperado: 15.99 * 1 + 5.00 * 3 = 30.99
      mockTx.order.create.mockResolvedValue({
        ...MOCK_ORDER,
        totalAmount: new Decimal(30.99),
      });

      const dto = {
        orderType: 'DINE_IN' as any,
        tableNumber: '5',
        items: [
          { variantId: 'var-1', quantity: 1 },
          { variantId: 'var-2', quantity: 3 },
        ],
      };

      await service.createOrder('user-1', dto);

      // Verificar que orden se creó con totalAmount correcto
      expect(mockTx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: new Decimal(30.99),
          }),
        }),
      );
    });

    it('debería decrementar stock de cada variante independientemente', async () => {
      const variant1 = {
        ...MOCK_VARIANT,
        id: 'var-1',
        stock: 50,
        product: { ...MOCK_VARIANT.product, modifierGroups: [] },
      };

      const variant2 = {
        ...MOCK_VARIANT,
        id: 'var-2',
        stock: 30,
        product: {
          ...MOCK_VARIANT.product,
          id: 'prod-2',
          name: 'Bebida',
          modifierGroups: [],
        },
      };

      mockTx.productVariant.findUnique
        .mockResolvedValueOnce(variant1)
        .mockResolvedValueOnce(variant2);

      mockTx.order.create.mockResolvedValue(MOCK_ORDER);

      const dto = {
        orderType: 'DINE_IN' as any,
        items: [
          { variantId: 'var-1', quantity: 2 },
          { variantId: 'var-2', quantity: 5 },
        ],
      };

      await service.createOrder('user-1', dto);

      expect(mockTx.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'var-1' },
        data: { stock: { decrement: 2 } },
      });
      expect(mockTx.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'var-2' },
        data: { stock: { decrement: 5 } },
      });
    });
  });
});
