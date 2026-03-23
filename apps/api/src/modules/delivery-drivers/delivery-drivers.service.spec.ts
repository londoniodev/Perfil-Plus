import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryDriversService } from './delivery-drivers.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Role, DriverStatus } from '@alvarosky/database';

// ============================================================
//  TAREA 2: Tests del Servicio de Delivery Drivers
//  Usa mocks profundos de PrismaService.secure
// ============================================================

// ─────────── MOCK DATA ───────────

const MOCK_USER_DRIVER = {
  id: 'user-driver-1',
  name: 'Carlos Domiciliario',
  email: 'carlos@driver.com',
  role: Role.DRIVER,
  tenantId: 'tenant-1',
  avatar: null,
};

const MOCK_USER_ADMIN = {
  id: 'user-admin-1',
  name: 'Admin',
  email: 'admin@test.com',
  role: Role.ADMIN,
  tenantId: 'tenant-1',
  avatar: null,
};

const MOCK_DRIVER = {
  id: 'driver-1',
  userId: 'user-driver-1',
  tenantId: 'tenant-1',
  phone: '3001234567',
  vehicle: 'Moto Honda',
  status: DriverStatus.OFFLINE,
  maxCapacity: 3,
  currentActiveOrders: 0,
  createdAt: new Date(),
  user: {
    id: 'user-driver-1',
    name: 'Carlos Domiciliario',
    email: 'carlos@driver.com',
    avatar: null,
  },
};

// ─────────── MOCK PRISMA ───────────

function createMockPrisma() {
  const models = {
    user: {
      findFirst: jest.fn(),
    },
    deliveryDriver: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return {
    secure: models,
    raw: models,
    ...models, // Fallback for any direct calls
    getPrometheusMetrics: jest.fn().mockResolvedValue(''),
  };
}

describe('DeliveryDriversService', () => {
  let service: DeliveryDriversService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryDriversService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<DeliveryDriversService>(DeliveryDriversService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============ 1. Crear driver exitosamente ============

  describe('create', () => {
    it('debería crear un driver cuando el usuario existe con rol DRIVER', async () => {
      mockPrisma.secure.user.findFirst.mockResolvedValue(MOCK_USER_DRIVER);
      mockPrisma.secure.deliveryDriver.findUnique.mockResolvedValue(null); // No existe duplicado
      mockPrisma.secure.deliveryDriver.create.mockResolvedValue(MOCK_DRIVER);

      const dto = {
        userId: 'user-driver-1',
        phone: '3001234567',
        vehicle: 'Moto Honda',
      };

      const result = await service.create(dto, 'tenant-1');

      expect(mockPrisma.secure.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user-driver-1', tenantId: 'tenant-1' },
      });
      expect(mockPrisma.secure.deliveryDriver.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-1',
            userId: 'user-driver-1',
            phone: '3001234567',
            vehicle: 'Moto Honda',
            status: DriverStatus.OFFLINE,
          }),
        }),
      );
      expect(result).toEqual(MOCK_DRIVER);
    });

    // ============ 2. ❌ Crear con rol incorrecto ============

    it('debería lanzar BadRequestException si el usuario no tiene rol DRIVER', async () => {
      mockPrisma.secure.user.findFirst.mockResolvedValue(MOCK_USER_ADMIN);

      const dto = { userId: 'user-admin-1', phone: '3001234567' };

      await expect(service.create(dto, 'tenant-1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(dto, 'tenant-1')).rejects.toThrow(
        /rol DRIVER/,
      );
    });

    // ============ 3. ❌ Crear duplicado ============

    it('debería lanzar ConflictException si el usuario ya es domiciliario', async () => {
      mockPrisma.secure.user.findFirst.mockResolvedValue(MOCK_USER_DRIVER);
      mockPrisma.secure.deliveryDriver.findUnique.mockResolvedValue(
        MOCK_DRIVER,
      ); // Ya existe

      const dto = { userId: 'user-driver-1', phone: '3001234567' };

      await expect(service.create(dto, 'tenant-1')).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(dto, 'tenant-1')).rejects.toThrow(
        /ya está registrado/,
      );
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockPrisma.secure.user.findFirst.mockResolvedValue(null);

      const dto = { userId: 'no-existe', phone: '3001234567' };

      await expect(service.create(dto, 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============ 4. Listar drivers disponibles ============

  describe('findAvailable', () => {
    it('debería retornar solo drivers con status AVAILABLE', async () => {
      const availableDrivers = [
        { ...MOCK_DRIVER, status: DriverStatus.AVAILABLE },
      ];
      mockPrisma.secure.deliveryDriver.findMany.mockResolvedValue(
        availableDrivers,
      );

      const result = await service.findAvailable('tenant-1');

      expect(mockPrisma.secure.deliveryDriver.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 'tenant-1',
          status: DriverStatus.AVAILABLE,
        },
        include: expect.objectContaining({
          user: expect.objectContaining({
            select: expect.objectContaining({ name: true }),
          }),
        }),
        orderBy: { user: { name: 'asc' } },
      });

      expect(result).toEqual(availableDrivers);
    });
  });

  // ============ 5. Actualizar capacidad ============

  describe('update', () => {
    it('debería actualizar maxCapacity correctamente', async () => {
      const updatedDriver = { ...MOCK_DRIVER, maxCapacity: 5 };
      mockPrisma.secure.deliveryDriver.findFirst.mockResolvedValue(MOCK_DRIVER);
      mockPrisma.secure.deliveryDriver.update.mockResolvedValue(updatedDriver);

      const result = await service.update(
        'driver-1',
        { maxCapacity: 5 },
        'tenant-1',
      );

      expect(mockPrisma.secure.deliveryDriver.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'driver-1' },
          data: expect.objectContaining({ maxCapacity: 5 }),
        }),
      );
      expect(result.maxCapacity).toBe(5);
    });

    // ============ 6. Actualizar estado ============

    it('debería hacer toggle AVAILABLE ↔ OFFLINE', async () => {
      const onlineDriver = {
        ...MOCK_DRIVER,
        status: DriverStatus.AVAILABLE,
      };
      mockPrisma.secure.deliveryDriver.findFirst.mockResolvedValue(MOCK_DRIVER);
      mockPrisma.secure.deliveryDriver.update.mockResolvedValue(onlineDriver);

      const result = await service.update(
        'driver-1',
        { status: DriverStatus.AVAILABLE },
        'tenant-1',
      );

      expect(mockPrisma.secure.deliveryDriver.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: DriverStatus.AVAILABLE }),
        }),
      );
      expect(result.status).toBe(DriverStatus.AVAILABLE);
    });
  });

  // ============ 7. Eliminar driver ============

  describe('remove', () => {
    it('debería eliminar el driver y retornar mensaje de éxito', async () => {
      mockPrisma.secure.deliveryDriver.findFirst.mockResolvedValue(MOCK_DRIVER);
      mockPrisma.secure.deliveryDriver.delete.mockResolvedValue(MOCK_DRIVER);

      const result = await service.remove('driver-1', 'tenant-1');

      expect(mockPrisma.secure.deliveryDriver.delete).toHaveBeenCalledWith({
        where: { id: 'driver-1' },
      });
      expect(result).toEqual({
        message: 'Domiciliario eliminado correctamente',
      });
    });
  });

  // ============ 8. ❌ findOne inexistente ============

  describe('findOne', () => {
    it('debería lanzar NotFoundException si el driver no existe', async () => {
      mockPrisma.secure.deliveryDriver.findFirst.mockResolvedValue(null);

      await expect(service.findOne('no-existe', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería retornar el driver con sus órdenes activas', async () => {
      const driverWithOrders = {
        ...MOCK_DRIVER,
        orders: [],
      };
      mockPrisma.secure.deliveryDriver.findFirst.mockResolvedValue(
        driverWithOrders,
      );

      const result = await service.findOne('driver-1', 'tenant-1');

      expect(mockPrisma.secure.deliveryDriver.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'driver-1', tenantId: 'tenant-1' },
        }),
      );
      expect(result).toEqual(driverWithOrders);
    });
  });

  // ============ 9. findByUserId ============

  describe('findByUserId', () => {
    it('debería retornar el perfil del driver por userId', async () => {
      mockPrisma.secure.deliveryDriver.findUnique.mockResolvedValue(
        MOCK_DRIVER,
      );

      const result = await service.findByUserId('user-driver-1');

      expect(mockPrisma.secure.deliveryDriver.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-driver-1' },
        include: expect.objectContaining({
          user: expect.objectContaining({
            select: expect.objectContaining({ name: true }),
          }),
        }),
      });
      expect(result).toEqual(MOCK_DRIVER);
    });

    it('debería lanzar NotFoundException si no hay perfil de driver', async () => {
      mockPrisma.secure.deliveryDriver.findUnique.mockResolvedValue(null);

      await expect(service.findByUserId('user-sin-driver')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByUserId('user-sin-driver')).rejects.toThrow(
        /no encontrado/,
      );
    });
  });

  // ============ findAll ============

  describe('findAll', () => {
    it('debería retornar todos los drivers del tenant', async () => {
      const drivers = [MOCK_DRIVER];
      mockPrisma.secure.deliveryDriver.findMany.mockResolvedValue(drivers);

      const result = await service.findAll('tenant-1');

      expect(mockPrisma.secure.deliveryDriver.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result).toEqual(drivers);
    });
  });
});
