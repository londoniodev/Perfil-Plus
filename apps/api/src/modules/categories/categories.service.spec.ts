import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClsService } from 'nestjs-cls';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let mockPrisma: any;

  beforeEach(async () => {
    const models = {
      category: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      categoriesOnProducts: {
        deleteMany: jest.fn(),
      },
    };

    mockPrisma = {
      secure: models,
      raw: models,
      ...models,
      getPrometheusMetrics: jest.fn().mockResolvedValue(''),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
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
          provide: ClsService,
          useValue: {
            get: jest.fn().mockReturnValue('test-tenant'),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
