import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WhatsappController } from '../src/modules/whatsapp/whatsapp.controller';
import { WhatsappProcessor } from '../src/modules/whatsapp/whatsapp.processor';
import { OpenAiProvider } from '../src/modules/whatsapp/providers/openai.provider';
import { MetaApiService } from '../src/modules/whatsapp/services/meta-api.service';
import { RestaurantContextService } from '../src/modules/whatsapp/services/restaurant-context.service';
import { UsageGuardService } from '../src/modules/whatsapp/services/usage-guard.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ClsModule, ClsService } from 'nestjs-cls';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// ============================================================
// PAYLOADS DE META WEBHOOK
// ============================================================
const buildTextPayload = (phoneNumberId: string, from: string, text: string, messageId?: string) => ({
  object: 'whatsapp_business_account',
  entry: [{
    id: 'WBA_ID',
    changes: [{
      value: {
        messaging_product: 'whatsapp',
        metadata: { display_phone_number: '15551234567', phone_number_id: phoneNumberId },
        contacts: [{ profile: { name: 'Test User' }, wa_id: from }],
        messages: [{
          from,
          id: messageId || `wamid.${Date.now()}`,
          timestamp: String(Math.floor(Date.now() / 1000)),
          text: { body: text },
          type: 'text',
        }],
      },
      field: 'messages',
    }],
  }],
});

const buildLocationPayload = (phoneNumberId: string, from: string, lat: number, lng: number) => ({
  object: 'whatsapp_business_account',
  entry: [{
    id: 'WBA_ID',
    changes: [{
      value: {
        messaging_product: 'whatsapp',
        metadata: { display_phone_number: '15551234567', phone_number_id: phoneNumberId },
        contacts: [{ profile: { name: 'Test User' }, wa_id: from }],
        messages: [{
          from,
          id: `wamid.${Date.now()}`,
          timestamp: String(Math.floor(Date.now() / 1000)),
          type: 'location',
          location: { latitude: lat, longitude: lng },
        }],
      },
      field: 'messages',
    }],
  }],
});

const buildStatusPayload = () => ({
  object: 'whatsapp_business_account',
  entry: [{
    id: 'WBA_ID',
    changes: [{
      value: {
        messaging_product: 'whatsapp',
        metadata: { display_phone_number: '15551234567', phone_number_id: 'PHONE_ID_TEST' },
        statuses: [{
          id: 'wamid.status123',
          status: 'read',
          timestamp: String(Math.floor(Date.now() / 1000)),
          recipient_id: '573001234567',
        }],
      },
      field: 'messages',
    }],
  }],
});

// ============================================================
// CONSTANTES
// ============================================================
const PHONE_ID = 'PHONE_ID_TEST';
const CUSTOMER = '573001234567';
const TENANT_ID = 'tenant-test-001';
const TENANT_SLUG = 'test-restaurant';

// ============================================================
// MOCK FACTORIES
// ============================================================
const createMockPrisma = () => ({
  storeSettings: {
    findFirst: jest.fn().mockResolvedValue({
      tenantId: TENANT_ID,
      tenant: { slug: TENANT_SLUG },
    }),
  },
  secure: {
    waConversation: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: 'conv-001', customerPhone: CUSTOMER, status: 'OPEN',
      }),
    },
    waMessage: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'msg-001' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    waCustomer: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({ id: 'cust-001', phone: CUSTOMER }),
    },
    storeSettings: {
      findFirst: jest.fn().mockResolvedValue({ storeName: 'Test', aiMonthlyLimit: 100 }),
    },
  },
});

const createMockOpenAi = () => ({
  generateResponse: jest.fn().mockResolvedValue({
    text: '¡Pedido listo! Usa el botón para pagar.',
    checkoutUrl: `https://${TENANT_SLUG}.demo.dev/checkout?wa=wa-test123`,
  }),
});

const createMockMetaApi = () => ({
  sendInteractiveCtaMessage: jest.fn().mockResolvedValue(true),
  sendTextMessage: jest.fn().mockResolvedValue(true),
});

const createMockUsageGuard = () => ({
  checkAiLimit: jest.fn().mockResolvedValue(true),
});

const createMockContextService = () => ({
  buildSystemPrompt: jest.fn().mockResolvedValue('Eres un asistente de Test Restaurant...'),
  getProductCatalog: jest.fn().mockResolvedValue([]),
});

const createMockCls = () => ({
  get: jest.fn().mockReturnValue(TENANT_ID),
  set: jest.fn(),
  runWith: jest.fn((_store: any, fn: () => Promise<void>) => fn()),
});

const createMockCache = () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
});

// ============================================================
// SUITE E2E
// ============================================================
describe('WhatsApp Webhook (e2e)', () => {
  let app: INestApplication;

  // Mocks
  let mockPrisma: ReturnType<typeof createMockPrisma>;
  let mockOpenAi: ReturnType<typeof createMockOpenAi>;
  let mockMetaApi: ReturnType<typeof createMockMetaApi>;
  let mockUsageGuard: ReturnType<typeof createMockUsageGuard>;
  let mockContextService: ReturnType<typeof createMockContextService>;
  let mockCls: ReturnType<typeof createMockCls>;

  /**
   * Helper: espera a que el EventEmitter termine de procesar.
   * El controller retorna 200 inmediatamente y emite un evento asíncrono.
   */
  const waitForAsyncProcessing = (ms = 500) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  beforeAll(async () => {
    mockPrisma = createMockPrisma();
    mockOpenAi = createMockOpenAi();
    mockMetaApi = createMockMetaApi();
    mockUsageGuard = createMockUsageGuard();
    mockContextService = createMockContextService();
    mockCls = createMockCls();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        ClsModule.forRoot({ global: true }),
      ],
      controllers: [WhatsappController],
      providers: [
        WhatsappProcessor,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ClsService, useValue: mockCls },
        { provide: CACHE_MANAGER, useValue: createMockCache() },
        // ━━━ EXTERNOS MOCKEADOS: NO se instancian clases reales ━━━
        { provide: OpenAiProvider, useValue: mockOpenAi },
        { provide: MetaApiService, useValue: mockMetaApi },
        { provide: UsageGuardService, useValue: mockUsageGuard },
        { provide: RestaurantContextService, useValue: mockContextService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Re-setear default mocks (algunos tests los overridean con mockResolvedValueOnce)
    mockPrisma.storeSettings.findFirst.mockResolvedValue({
      tenantId: TENANT_ID,
      tenant: { slug: TENANT_SLUG },
    });
    mockPrisma.secure.waConversation.findFirst.mockResolvedValue(null);
    mockPrisma.secure.waConversation.create.mockResolvedValue({
      id: 'conv-001', customerPhone: CUSTOMER, status: 'OPEN',
    });
    mockPrisma.secure.waMessage.findUnique.mockResolvedValue(null);
    mockPrisma.secure.waMessage.create.mockResolvedValue({ id: 'msg-001' });
    mockPrisma.secure.waMessage.findMany.mockResolvedValue([]);

    mockOpenAi.generateResponse.mockResolvedValue({
      text: '¡Pedido listo! Usa el botón para pagar.',
      checkoutUrl: `https://${TENANT_SLUG}.demo.dev/checkout?wa=wa-test123`,
    });

    mockUsageGuard.checkAiLimit.mockResolvedValue(true);
    mockContextService.buildSystemPrompt.mockResolvedValue('Eres un asistente...');
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET /webhook/whatsapp — Verificación de Meta
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('GET /webhook/whatsapp (Verificación)', () => {
    it('debe retornar el challenge con token correcto', () =>
      request(app.getHttpServer())
        .get('/webhook/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': 'alvaro_token_seguro_123',
          'hub.challenge': 'CHALLENGE_OK',
        })
        .expect(HttpStatus.OK)
        .expect('CHALLENGE_OK'),
    );

    it('debe retornar 403 con token incorrecto', () =>
      request(app.getHttpServer())
        .get('/webhook/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': 'TOKEN_MALO',
          'hub.challenge': 'CHALLENGE_OK',
        })
        .expect(HttpStatus.FORBIDDEN),
    );
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEST 1: Texto → Smart Cart con CTA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('TEST 1: Mensaje de texto → Respuesta CTA (Smart Cart)', () => {
    it('debe procesar un mensaje de texto y responder con botón CTA', async () => {
      const payload = buildTextPayload(
        PHONE_ID, CUSTOMER, 'Quiero 2 hamburguesas clásicas', 'wamid.text-001',
      );

      // El controller responde 200 inmediatamente
      await request(app.getHttpServer())
        .post('/webhook/whatsapp')
        .send(payload)
        .expect(HttpStatus.OK)
        .expect('EVENT_RECEIVED');

      await waitForAsyncProcessing();

      // ✅ Tenant resuelto por phone_number_id
      expect(mockPrisma.storeSettings.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { waPhoneNumberId: PHONE_ID },
        }),
      );

      // ✅ CLS ejecutó con el tenant correcto
      expect(mockCls.runWith).toHaveBeenCalledWith(
        { tenantId: TENANT_ID },
        expect.any(Function),
      );

      // ✅ Se verificó que el mensaje no era duplicado
      expect(mockPrisma.secure.waMessage.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { waMessageId: 'wamid.text-001' },
        }),
      );

      // ✅ Se persistió el mensaje del usuario
      expect(mockPrisma.secure.waMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'USER',
            content: 'Quiero 2 hamburguesas clásicas',
            tenantId: TENANT_ID,
          }),
        }),
      );

      // ✅ La IA fue consultada con los args correctos
      expect(mockOpenAi.generateResponse).toHaveBeenCalledWith(
        TENANT_ID,
        expect.any(String),   // systemPrompt
        expect.any(Array),    // history
        'Quiero 2 hamburguesas clásicas',
        CUSTOMER,
        TENANT_SLUG,
      );

      // ✅ Se envió un CTA interactivo (porque hay checkoutUrl)
      expect(mockMetaApi.sendInteractiveCtaMessage).toHaveBeenCalledWith(
        TENANT_ID,
        PHONE_ID,
        CUSTOMER,
        expect.any(String),
        'Completar Pago',
        expect.stringContaining('/checkout?wa='),
      );

      // ✅ NO se envió texto plano (porque fue CTA)
      expect(mockMetaApi.sendTextMessage).not.toHaveBeenCalled();

      // ✅ Se guardó el mensaje ASSISTANT
      const createCalls = mockPrisma.secure.waMessage.create.mock.calls;
      const assistantMsg = createCalls.find(
        (c: any[]) => c[0]?.data?.role === 'ASSISTANT',
      );
      expect(assistantMsg).toBeDefined();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEST 2: Ubicación (GPS) → pasa por IA y responde texto plano
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('TEST 2: Mensaje de ubicación (GPS)', () => {
    it('debe procesar la ubicación y responder como texto plano', async () => {
      // Override para que NO haya checkoutUrl
      mockOpenAi.generateResponse.mockResolvedValueOnce({
        text: '¡Gracias! Tu ubicación ha sido registrada.',
      });

      const payload = buildLocationPayload(PHONE_ID, CUSTOMER, 4.6097, -74.0817);

      await request(app.getHttpServer())
        .post('/webhook/whatsapp')
        .send(payload)
        .expect(HttpStatus.OK)
        .expect('EVENT_RECEIVED');

      await waitForAsyncProcessing();

      // ✅ Tenant fue resuelto
      expect(mockPrisma.storeSettings.findFirst).toHaveBeenCalled();

      // ✅ La IA recibió '[Mensaje no es de texto]'
      // (processor: message.type === 'text' ? text.body : '[Mensaje no es de texto]')
      expect(mockOpenAi.generateResponse).toHaveBeenCalledWith(
        TENANT_ID,
        expect.any(String),
        expect.any(Array),
        '[Mensaje no es de texto]',
        CUSTOMER,
        TENANT_SLUG,
      );

      // ✅ Se envió texto plano (no CTA, porque no hay checkoutUrl)
      expect(mockMetaApi.sendTextMessage).toHaveBeenCalledWith(
        TENANT_ID,
        PHONE_ID,
        CUSTOMER,
        '¡Gracias! Tu ubicación ha sido registrada.',
      );

      // ✅ NO se envió CTA
      expect(mockMetaApi.sendInteractiveCtaMessage).not.toHaveBeenCalled();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEST 3: Payloads inválidos o status — no invocar IA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('TEST 3: Payloads inválidos / Status events', () => {
    it('debe retornar 200 para status events sin invocar la IA', async () => {
      await request(app.getHttpServer())
        .post('/webhook/whatsapp')
        .send(buildStatusPayload())
        .expect(HttpStatus.OK)
        .expect('EVENT_RECEIVED');

      await waitForAsyncProcessing(300);

      expect(mockOpenAi.generateResponse).not.toHaveBeenCalled();
      expect(mockMetaApi.sendTextMessage).not.toHaveBeenCalled();
      expect(mockMetaApi.sendInteractiveCtaMessage).not.toHaveBeenCalled();
    });

    it('debe retornar 404 para objetos que no son whatsapp_business_account', async () => {
      await request(app.getHttpServer())
        .post('/webhook/whatsapp')
        .send({ object: 'instagram', entry: [] })
        .expect(HttpStatus.NOT_FOUND);

      expect(mockOpenAi.generateResponse).not.toHaveBeenCalled();
    });

    it('debe retornar 200 sin crashear con payload sin messages', async () => {
      await request(app.getHttpServer())
        .post('/webhook/whatsapp')
        .send({
          object: 'whatsapp_business_account',
          entry: [{
            id: 'ID',
            changes: [{
              value: {
                messaging_product: 'whatsapp',
                metadata: { phone_number_id: 'PHONE_ID' },
                // Sin "messages"
              },
              field: 'messages',
            }],
          }],
        })
        .expect(HttpStatus.OK);

      await waitForAsyncProcessing(300);
      expect(mockOpenAi.generateResponse).not.toHaveBeenCalled();
    });

    it('debe retornar 200 con payload sin entry', async () => {
      await request(app.getHttpServer())
        .post('/webhook/whatsapp')
        .send({ object: 'whatsapp_business_account' })
        .expect(HttpStatus.OK);

      await waitForAsyncProcessing(200);
      expect(mockOpenAi.generateResponse).not.toHaveBeenCalled();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EXTRA: Duplicados de Meta
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('EXTRA: Mensajes duplicados', () => {
    it('debe ignorar mensajes duplicados sin invocar la IA', async () => {
      const dupId = 'wamid.DUPLICATE_001';

      // Simular que ya existe en DB
      mockPrisma.secure.waMessage.findUnique.mockResolvedValueOnce({
        id: 'existing', waMessageId: dupId,
      });

      const payload = buildTextPayload(PHONE_ID, CUSTOMER, 'Duplicado', dupId);

      await request(app.getHttpServer())
        .post('/webhook/whatsapp')
        .send(payload)
        .expect(HttpStatus.OK);

      await waitForAsyncProcessing();

      // ✅ Se verificó duplicado
      expect(mockPrisma.secure.waMessage.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { waMessageId: dupId } }),
      );

      // ✅ NO se invocó la IA
      expect(mockOpenAi.generateResponse).not.toHaveBeenCalled();
      expect(mockMetaApi.sendTextMessage).not.toHaveBeenCalled();
      expect(mockMetaApi.sendInteractiveCtaMessage).not.toHaveBeenCalled();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EXTRA: Tenant no encontrado
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('EXTRA: Tenant no encontrado', () => {
    it('debe ignorar el mensaje si no hay tenant para ese phone_number_id', async () => {
      mockPrisma.storeSettings.findFirst.mockResolvedValueOnce(null);

      const payload = buildTextPayload('UNKNOWN_PHONE', CUSTOMER, 'Hola');

      await request(app.getHttpServer())
        .post('/webhook/whatsapp')
        .send(payload)
        .expect(HttpStatus.OK);

      await waitForAsyncProcessing();

      expect(mockPrisma.storeSettings.findFirst).toHaveBeenCalled();
      expect(mockCls.runWith).not.toHaveBeenCalled();
      expect(mockOpenAi.generateResponse).not.toHaveBeenCalled();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EXTRA: Límite de IA alcanzado
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('EXTRA: Límite mensual de IA excedido', () => {
    it('debe responder con mensaje de límite sin consultar IA', async () => {
      mockUsageGuard.checkAiLimit.mockResolvedValueOnce(false);

      const payload = buildTextPayload(PHONE_ID, CUSTOMER, 'Quiero pizza');

      await request(app.getHttpServer())
        .post('/webhook/whatsapp')
        .send(payload)
        .expect(HttpStatus.OK);

      await waitForAsyncProcessing();

      // ✅ NO se invocó la IA
      expect(mockOpenAi.generateResponse).not.toHaveBeenCalled();

      // ✅ Se envió mensaje de límite alcanzado
      expect(mockMetaApi.sendTextMessage).toHaveBeenCalledWith(
        TENANT_ID,
        PHONE_ID,
        CUSTOMER,
        expect.stringContaining('no está disponible'),
      );
    });
  });
});
