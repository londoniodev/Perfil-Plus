import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

describe('Zero-Trust Multi-tenant Isolation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Mock environment variables for services that crash on init or required by ConfigModule
  process.env.OPENAI_API_KEY = 'sk-test-dummy-key-for-e2e-isolation-tests';
  process.env.DATABASE_URL = 'postgresql://admin:password123@localhost:5432/mauromera_local';
  process.env.JWT_SECRET = 'super-secret-jwt-key-development-only';
  process.env.S3_ENDPOINT = 'http://localhost:9000';
  process.env.S3_ACCESS_KEY = 'minioadmin';
  process.env.S3_SECRET_KEY = 'minioadmin';
  process.env.REDIS_HOST = 'localhost';
  process.env.DOKPLOY_API_KEY = 'dummy';
  process.env.DOKPLOY_API_URL = 'http://localhost:3000';

  // Fixtures IDs
  const TENANT_ALPHA_ID = 'tenant-alpha-' + randomBytes(4).toString('hex');
  const TENANT_BETA_ID = 'tenant-beta-' + randomBytes(4).toString('hex');
  
  let USER_ALPHA_ID: string;
  let USER_BETA_ID: string;
  
  let ORDER_ALPHA_ID: string;
  let PRODUCT_ALPHA_ID: string;

  let JWT_ALPHA: string;
  let JWT_BETA: string;
  let JWT_SUPERADMIN: string;

  beforeAll(async () => {
    try {
      console.log('--- STARTING E2E BOOTSTRAP ---');
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      prisma = app.get<PrismaService>(PrismaService);
      jwtService = app.get<JwtService>(JwtService);

      console.log('--- SETTING UP FIXTURES ---');
      // 1. SETUP FIXTURES (Usando prisma.raw para bypassar filtros durante o setup)
      
      // Crear Tenants
      await prisma.raw.tenant.createMany({
        data: [
          { id: TENANT_ALPHA_ID, name: 'Tenant Alpha', slug: TENANT_ALPHA_ID, dbName: 'test-db', features: ['SHOP', 'RESTAURANT'] },
          { id: TENANT_BETA_ID, name: 'Tenant Beta', slug: TENANT_BETA_ID, dbName: 'test-db', features: ['SHOP', 'RESTAURANT'] },
        ],
      });

      // Crear Users
      const userAlpha = await prisma.raw.user.create({
        data: {
          email: `admin-${TENANT_ALPHA_ID}@alpha.com`,
          name: 'Admin Alpha',
          password: 'password',
          role: 'ADMIN',
          tenantId: TENANT_ALPHA_ID,
        },
      });
      USER_ALPHA_ID = userAlpha.id;

      const userBeta = await prisma.raw.user.create({
        data: {
          email: `admin-${TENANT_BETA_ID}@beta.com`,
          name: 'Admin Beta',
          password: 'password',
          role: 'ADMIN',
          tenantId: TENANT_BETA_ID,
        },
      });
      USER_BETA_ID = userBeta.id;

      const superAdmin = await prisma.raw.user.create({
        data: {
          email: `super-${TENANT_ALPHA_ID}@system.com`,
          name: 'Super Admin',
          password: 'password',
          role: 'SUPERADMIN',
          tenantId: TENANT_ALPHA_ID,
        },
      });

      // Crear Producto y Orden para ALPHA
      const productAlpha = await prisma.raw.product.create({
        data: {
          name: 'Product Alpha',
          slug: 'product-alpha-' + randomBytes(2).toString('hex'),
          description: 'Description Alpha',
          basePrice: 100,
          tenantId: TENANT_ALPHA_ID,
          productType: 'PHYSICAL',
        },
      });
      PRODUCT_ALPHA_ID = productAlpha.id;

      const variantAlpha = await prisma.raw.productVariant.create({
        data: {
          productId: PRODUCT_ALPHA_ID,
          sku: 'SKU-ALPHA-' + randomBytes(2).toString('hex'),
          price: 100,
          tenantId: TENANT_ALPHA_ID,
        }
      });

      const orderAlpha = await prisma.raw.order.create({
        data: {
          tenantId: TENANT_ALPHA_ID,
          orderNumber: 'ORD-ALPHA-' + randomBytes(2).toString('hex'),
          totalAmount: 100,
          status: 'PENDING',
          items: {
            create: {
              productName: 'Product Alpha',
              price: 100,
              quantity: 1,
              variantId: variantAlpha.id,
            }
          }
        },
      });
      ORDER_ALPHA_ID = orderAlpha.id;

      // 2. GENERATE JWTs
      JWT_ALPHA = jwtService.sign({ 
        sub: USER_ALPHA_ID, 
        email: userAlpha.email,
        role: 'ADMIN', 
        name: 'Admin Alpha',
        tenantId: TENANT_ALPHA_ID, 
        subscriptionStatus: 'ACTIVE',
        subscriptionEndDate: null
      });
      JWT_BETA = jwtService.sign({ 
        sub: USER_BETA_ID, 
        email: userBeta.email,
        role: 'ADMIN', 
        name: 'Admin Beta',
        tenantId: TENANT_BETA_ID, 
        subscriptionStatus: 'ACTIVE',
        subscriptionEndDate: null
      });
      JWT_SUPERADMIN = jwtService.sign({ 
        sub: superAdmin.id, 
        email: superAdmin.email,
        role: 'SUPERADMIN', 
        name: 'Super Admin',
        tenantId: TENANT_ALPHA_ID,
        subscriptionStatus: 'ACTIVE',
        subscriptionEndDate: null
      });
      console.log('--- E2E SETUP COMPLETE ---');
    } catch (err) {
      console.error('CRITICAL BOOTSTRAP ERROR:', err);
      throw err;
    }
  });

  afterAll(async () => {
    // Cleanup
    if (prisma) {
      await prisma.raw.orderItem.deleteMany({ where: { order: { tenantId: { in: [TENANT_ALPHA_ID, TENANT_BETA_ID] } } } });
      await prisma.raw.order.deleteMany({ where: { tenantId: { in: [TENANT_ALPHA_ID, TENANT_BETA_ID] } } });
      await prisma.raw.productVariant.deleteMany({ where: { tenantId: { in: [TENANT_ALPHA_ID, TENANT_BETA_ID] } } });
      await prisma.raw.product.deleteMany({ where: { tenantId: { in: [TENANT_ALPHA_ID, TENANT_BETA_ID] } } });
      await prisma.raw.user.deleteMany({ where: { tenantId: { in: [TENANT_ALPHA_ID, TENANT_BETA_ID] } } });
      await prisma.raw.tenant.deleteMany({ where: { id: { in: [TENANT_ALPHA_ID, TENANT_BETA_ID] } } });
    }
    if (app) {
      await app.close();
    }
  });

  it('SHOULD BE DEFINED', () => {
    expect(app).toBeDefined();
    expect(prisma).toBeDefined();
    expect(prisma.secure).toBeDefined();
  });

  describe('Infiltration Tests', () => {
    
    it('SCENARIO 1: SUCCESSFUL ACCESS (Control) - Admin Alpha reads its own order', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${ORDER_ALPHA_ID}`)
        .set('Authorization', `Bearer ${JWT_ALPHA}`)
        .expect(HttpStatus.OK);

      expect(response.body.id).toBe(ORDER_ALPHA_ID);
      expect(response.body.tenantId).toBe(TENANT_ALPHA_ID);
    });

    it('SCENARIO 2: READ INFILTRATION (The Leak) - Admin Beta tries to read Alpha order', async () => {
      await request(app.getHttpServer())
        .get(`/orders/${ORDER_ALPHA_ID}`)
        .set('Authorization', `Bearer ${JWT_BETA}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('SCENARIO 3: COLLECTION INFILTRATION - Admin Beta list orders (should not see Alpha)', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/orders')
        .set('Authorization', `Bearer ${JWT_BETA}`)
        .expect(HttpStatus.OK);

      const hasAlphaOrder = response.body.some((o: any) => o.id === ORDER_ALPHA_ID);
      expect(hasAlphaOrder).toBe(false);
    });

    it('SCENARIO 4: WRITE INFILTRATION (The Hijack) - Admin Beta tries to cancel Alpha order', async () => {
      await request(app.getHttpServer())
        .patch(`/admin/orders/${ORDER_ALPHA_ID}/status`)
        .set('Authorization', `Bearer ${JWT_BETA}`)
        .send({ status: 'CANCELLED' })
        .expect(HttpStatus.NOT_FOUND);

      const order = await prisma.raw.order.findUnique({ where: { id: ORDER_ALPHA_ID } });
      expect(order?.status).toBe('PENDING');
    });

    it('SCENARIO 5: CROSS-TENANT CREATION - Admin Beta tries to create product for Alpha', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/products')
        .set('Authorization', `Bearer ${JWT_BETA}`)
        .send({
          name: 'Hacker Product',
          slug: 'hacker-product-' + randomBytes(2).toString('hex'),
          description: 'Hacked description',
          basePrice: 1,
          tenantId: TENANT_ALPHA_ID, 
          productType: 'PHYSICAL'
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.tenantId).toBe(TENANT_BETA_ID);
      
      const dbProduct = await prisma.raw.product.findUnique({ where: { id: response.body.id } });
      expect(dbProduct?.tenantId).toBe(TENANT_BETA_ID);
    });

    it('SCENARIO 6: INFRASTRUCTURE VALIDATION - SuperAdmin can see all tenants', async () => {
        const response = await request(app.getHttpServer())
          .get('/tenant')
          .set('Authorization', `Bearer ${JWT_SUPERADMIN}`)
          .expect(HttpStatus.OK);
  
        const hasAlpha = response.body.some((t: any) => t.id === TENANT_ALPHA_ID);
        const hasBeta = response.body.some((t: any) => t.id === TENANT_BETA_ID);
        
        expect(hasAlpha).toBe(true);
        expect(hasBeta).toBe(true);
      });
  });
});
