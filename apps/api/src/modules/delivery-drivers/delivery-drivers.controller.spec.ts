import { Test, TestingModule } from '@nestjs/testing';
import {
  AdminDeliveryDriversController,
  DriverController,
} from './delivery-drivers.controller';
import { DeliveryDriversService } from './delivery-drivers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { DriverStatus } from '@alvarosky/database';

// ============================================================
//  TAREA 3: Tests de Controladores REST (Admin + Driver)
//  Verifica que los controladores deleguen correctamente
//  al servicio con los parámetros adecuados.
// ============================================================

// ─────────── MOCK DATA ───────────

const MOCK_DRIVER = {
  id: 'driver-1',
  userId: 'user-driver-1',
  tenantId: 'tenant-1',
  phone: '3001234567',
  vehicle: 'Moto Honda',
  status: DriverStatus.OFFLINE,
  maxCapacity: 3,
  currentActiveOrders: 0,
  user: {
    id: 'user-driver-1',
    name: 'Carlos',
    email: 'carlos@test.com',
    avatar: null,
  },
};

const mockDriversService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAvailable: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByUserId: jest.fn(),
};

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

// ============ ADMIN CONTROLLER ============

describe('AdminDeliveryDriversController', () => {
  let controller: AdminDeliveryDriversController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDeliveryDriversController],
      providers: [
        { provide: DeliveryDriversService, useValue: mockDriversService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<AdminDeliveryDriversController>(
      AdminDeliveryDriversController,
    );
    jest.clearAllMocks();
  });

  // ============ 1. POST admin/delivery-drivers ============

  describe('create', () => {
    it('debería llamar driversService.create con dto y tenantId', async () => {
      const dto = {
        userId: 'user-driver-1',
        phone: '3001234567',
        vehicle: 'Moto',
      };
      mockDriversService.create.mockResolvedValue(MOCK_DRIVER);

      const result = await controller.create(dto, 'tenant-1');

      expect(mockDriversService.create).toHaveBeenCalledWith(dto, 'tenant-1');
      expect(result).toEqual(MOCK_DRIVER);
    });
  });

  // ============ 2. GET admin/delivery-drivers ============

  describe('findAll', () => {
    it('debería llamar driversService.findAll con tenantId', async () => {
      const drivers = [MOCK_DRIVER];
      mockDriversService.findAll.mockResolvedValue(drivers);

      const result = await controller.findAll('tenant-1');

      expect(mockDriversService.findAll).toHaveBeenCalledWith('tenant-1');
      expect(result).toEqual(drivers);
    });
  });

  // ============ 3. GET admin/delivery-drivers/available ============

  describe('findAvailable', () => {
    it('debería llamar driversService.findAvailable con tenantId', async () => {
      const available = [{ ...MOCK_DRIVER, status: DriverStatus.AVAILABLE }];
      mockDriversService.findAvailable.mockResolvedValue(available);

      const result = await controller.findAvailable('tenant-1');

      expect(mockDriversService.findAvailable).toHaveBeenCalledWith('tenant-1');
      expect(result).toEqual(available);
    });
  });

  // ============ 4. PATCH admin/delivery-drivers/:id ============

  describe('update', () => {
    it('debería llamar driversService.update con id, dto, y tenantId', async () => {
      const dto = { maxCapacity: 5, status: DriverStatus.AVAILABLE };
      const updatedDriver = { ...MOCK_DRIVER, ...dto };
      mockDriversService.update.mockResolvedValue(updatedDriver);

      const result = await controller.update('driver-1', dto, 'tenant-1');

      expect(mockDriversService.update).toHaveBeenCalledWith(
        'driver-1',
        dto,
        'tenant-1',
      );
      expect(result.maxCapacity).toBe(5);
    });
  });

  // ============ 5. DELETE admin/delivery-drivers/:id ============

  describe('remove', () => {
    it('debería llamar driversService.remove con id y tenantId', async () => {
      mockDriversService.remove.mockResolvedValue({
        message: 'Domiciliario eliminado correctamente',
      });

      const result = await controller.remove('driver-1', 'tenant-1');

      expect(mockDriversService.remove).toHaveBeenCalledWith(
        'driver-1',
        'tenant-1',
      );
      expect(result.message).toContain('eliminado');
    });
  });

  // GET by ID
  describe('findOne', () => {
    it('debería llamar driversService.findOne con id y tenantId', async () => {
      mockDriversService.findOne.mockResolvedValue(MOCK_DRIVER);

      const result = await controller.findOne('driver-1', 'tenant-1');

      expect(mockDriversService.findOne).toHaveBeenCalledWith(
        'driver-1',
        'tenant-1',
      );
      expect(result).toEqual(MOCK_DRIVER);
    });
  });
});

// ============ DRIVER CONTROLLER ============

describe('DriverController', () => {
  let controller: DriverController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverController],
      providers: [
        { provide: DeliveryDriversService, useValue: mockDriversService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<DriverController>(DriverController);
    jest.clearAllMocks();
  });

  // ============ 6. GET driver/profile ============

  describe('getProfile', () => {
    it('debería llamar driversService.findByUserId con userId del JWT', async () => {
      mockDriversService.findByUserId.mockResolvedValue(MOCK_DRIVER);

      const result = await controller.getProfile('user-driver-1');

      expect(mockDriversService.findByUserId).toHaveBeenCalledWith(
        'user-driver-1',
      );
      expect(result).toEqual(MOCK_DRIVER);
    });
  });

  // ============ 7. PATCH driver/status ============

  describe('updateStatus', () => {
    it('debería hacer toggle de estado del driver autenticado', async () => {
      const onlineDriver = { ...MOCK_DRIVER, status: DriverStatus.AVAILABLE };
      mockDriversService.findByUserId.mockResolvedValue(MOCK_DRIVER);
      mockDriversService.update.mockResolvedValue(onlineDriver);

      const dto = { status: DriverStatus.AVAILABLE };
      const result = await controller.updateStatus('user-driver-1', dto);

      // Primero busca el driver por userId
      expect(mockDriversService.findByUserId).toHaveBeenCalledWith(
        'user-driver-1',
      );
      // Luego actualiza con el id del driver, no el userId
      expect(mockDriversService.update).toHaveBeenCalledWith(
        'driver-1',
        { status: DriverStatus.AVAILABLE },
        'tenant-1',
      );
      expect(result.status).toBe(DriverStatus.AVAILABLE);
    });

    it('debería poder ponerse OFFLINE', async () => {
      const offlineDriver = { ...MOCK_DRIVER, status: DriverStatus.OFFLINE };
      mockDriversService.findByUserId.mockResolvedValue({
        ...MOCK_DRIVER,
        status: DriverStatus.AVAILABLE,
      });
      mockDriversService.update.mockResolvedValue(offlineDriver);

      const dto = { status: DriverStatus.OFFLINE };
      const result = await controller.updateStatus('user-driver-1', dto);

      expect(mockDriversService.update).toHaveBeenCalledWith(
        'driver-1',
        { status: DriverStatus.OFFLINE },
        'tenant-1',
      );
      expect(result.status).toBe(DriverStatus.OFFLINE);
    });
  });
});
