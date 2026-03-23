import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClsService } from 'nestjs-cls';

describe('RestaurantService', () => {
  let service: RestaurantService;
  let mockPrisma: any;

  beforeEach(async () => {
    const models = {
      restaurant: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
      category: {
        findMany: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
      },
    };

    mockPrisma = {
      secure: models,
      raw: models,
      ...models,
      $transaction: jest.fn((fn) => fn(models)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
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

    service = module.get<RestaurantService>(RestaurantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
