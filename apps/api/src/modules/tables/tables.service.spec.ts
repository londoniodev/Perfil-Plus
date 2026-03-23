import { Test, TestingModule } from '@nestjs/testing';
import { TablesService } from './tables.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TablesService', () => {
  let service: TablesService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      secure: {
        table: {
          findMany: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      },
      raw: {},
      getPrometheusMetrics: jest.fn().mockResolvedValue(''),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TablesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<TablesService>(TablesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
