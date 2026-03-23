import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from './tenant.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { StorageService } from '../storage/storage.service';
import { CorsCacheService } from '../core/cors-cache.service';
import { DokployService } from '../core/dokploy.service';
import { ConfigService } from '@nestjs/config';

describe('TenantService', () => {
  let service: TenantService;
  let mockPrisma: any;

  beforeEach(async () => {
    const models = {
      tenant: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      domain: {
        findUnique: jest.fn(),
      },
      brandSettings: {
        upsert: jest.fn(),
      },
      systemSetting: {
        findFirst: jest.fn(),
      },
    };

    mockPrisma = {
      secure: models,
      raw: models,
      ...models,
      $transaction: jest.fn((fn) => fn(models)),
      getPrometheusMetrics: jest.fn().mockResolvedValue(''),
      getTenantBySlug: jest.fn(),
      getTenantClient: jest.fn().mockReturnValue(models),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            provisionBuckets: jest.fn(),
          },
        },
        {
          provide: CorsCacheService,
          useValue: {
            getBaseDomain: jest.fn().mockReturnValue('alvarolondono.dev'),
            addOrigin: jest.fn(),
          },
        },
        {
          provide: DokployService,
          useValue: {
            provisionDomain: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('some-id'),
          },
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
