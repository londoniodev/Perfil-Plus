import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_123'),
}));

function createMockPrismaClient() {
  return {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
}

describe('EmployeesService', () => {
  let service: EmployeesService;
  let mockClient: ReturnType<typeof createMockPrismaClient>;

  beforeEach(async () => {
    mockClient = createMockPrismaClient();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: PrismaService,
          useValue: {
            client: mockClient,
          },
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  afterEach(() => jest.clearAllMocks());

  // ============ CREATE ============

  describe('create', () => {
    const validDto = {
      name: 'Juan Mesero',
      email: 'juan@restaurant.com',
      password: 'secret123',
      role: 'WAITER' as any,
    };

    it('debe crear un empleado con rol de staff', async () => {
      mockClient.user.findUnique.mockResolvedValue(null);
      mockClient.user.create.mockResolvedValue({
        id: 'emp-1',
        email: 'juan@restaurant.com',
        name: 'Juan Mesero',
        role: 'WAITER',
        avatar: null,
        createdAt: new Date(),
      });

      const result = await service.create(validDto, 'test-tenant');

      expect(result.id).toBe('emp-1');
      expect(result.role).toBe('WAITER');
      expect(mockClient.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'juan@restaurant.com',
            password: 'hashed_password_123',
            role: 'WAITER',
            emailVerified: true,
          }),
        }),
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 12);
    });

    it('debe rechazar roles que no son de staff (USER)', async () => {
      await expect(
        service.create({ ...validDto, role: 'USER' as any }, 'test-tenant'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar roles que no son de staff (ADMIN)', async () => {
      await expect(
        service.create({ ...validDto, role: 'ADMIN' as any }, 'test-tenant'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar email duplicado', async () => {
      mockClient.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.create(validDto, 'test-tenant')).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe convertir email a lowercase', async () => {
      mockClient.user.findUnique.mockResolvedValue(null);
      mockClient.user.create.mockResolvedValue({
        id: 'emp-2',
        email: 'test@test.com',
        name: 'Test',
        role: 'KITCHEN',
        avatar: null,
        createdAt: new Date(),
      });

      await service.create(
        {
          ...validDto,
          email: 'JUAN@Restaurant.COM',
          role: 'KITCHEN' as any,
        },
        'test-tenant',
      );

      expect(mockClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'juan@restaurant.com' },
      });
    });

    it('debe crear empleado con rol CASHIER', async () => {
      mockClient.user.findUnique.mockResolvedValue(null);
      mockClient.user.create.mockResolvedValue({
        id: 'emp-3',
        email: 'caja@test.com',
        name: 'Cajero',
        role: 'CASHIER',
        avatar: null,
        createdAt: new Date(),
      });

      const result = await service.create(
        { ...validDto, role: 'CASHIER' as any },
        'test-tenant',
      );
      expect(result.role).toBe('CASHIER');
    });
  });

  // ============ FIND ALL ============

  describe('findAll', () => {
    it('debe retornar solo usuarios con roles de staff', async () => {
      const staffUsers = [
        {
          id: '1',
          name: 'Mesero',
          email: 'a@b.com',
          role: 'WAITER',
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Cocina',
          email: 'c@d.com',
          role: 'KITCHEN',
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockClient.user.findMany.mockResolvedValue(staffUsers);

      const result = await service.findAll('test-tenant');

      expect(result).toHaveLength(2);
      expect(mockClient.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: { in: ['WAITER', 'KITCHEN', 'CASHIER'] } },
        }),
      );
    });

    it('debe retornar array vacío si no hay empleados', async () => {
      mockClient.user.findMany.mockResolvedValue([]);

      const result = await service.findAll('test-tenant');
      expect(result).toEqual([]);
    });
  });

  // ============ FIND ONE ============

  describe('findOne', () => {
    it('debe retornar un empleado por ID', async () => {
      mockClient.user.findUnique.mockResolvedValue({
        id: 'emp-1',
        email: 'test@t.com',
        name: 'Test',
        role: 'WAITER',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.findOne('emp-1', 'test-tenant');
      expect(result.id).toBe('emp-1');
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockClient.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('no-exist', 'test-tenant')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar NotFoundException si el usuario no es staff', async () => {
      mockClient.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'u@u.com',
        name: 'User',
        role: 'USER',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.findOne('user-1', 'test-tenant')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============ UPDATE ============

  describe('update', () => {
    beforeEach(() => {
      // findOne will be called first for validation
      mockClient.user.findUnique.mockResolvedValue({
        id: 'emp-1',
        email: 'test@t.com',
        name: 'Test',
        role: 'WAITER',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    it('debe actualizar el nombre del empleado', async () => {
      mockClient.user.update.mockResolvedValue({
        id: 'emp-1',
        email: 'test@t.com',
        name: 'Nuevo Nombre',
        role: 'WAITER',
        avatar: null,
        updatedAt: new Date(),
      });

      const result = await service.update(
        'emp-1',
        { name: 'Nuevo Nombre' },
        'test-tenant',
      );
      expect(result.name).toBe('Nuevo Nombre');
    });

    it('debe actualizar el rol a otro rol de staff', async () => {
      mockClient.user.update.mockResolvedValue({
        id: 'emp-1',
        email: 'test@t.com',
        name: 'Test',
        role: 'KITCHEN',
        avatar: null,
        updatedAt: new Date(),
      });

      const result = await service.update(
        'emp-1',
        { role: 'KITCHEN' as any },
        'test-tenant',
      );
      expect(result.role).toBe('KITCHEN');
    });

    it('debe rechazar cambio a rol no-staff', async () => {
      await expect(
        service.update('emp-1', { role: 'ADMIN' as any }, 'test-tenant'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar cambio a rol USER', async () => {
      await expect(
        service.update('emp-1', { role: 'USER' as any }, 'test-tenant'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============ REMOVE ============

  describe('remove', () => {
    it('debe eliminar un empleado', async () => {
      mockClient.user.findUnique.mockResolvedValue({
        id: 'emp-1',
        email: 'test@t.com',
        name: 'Test',
        role: 'WAITER',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockClient.user.delete.mockResolvedValue({});

      const result = await service.remove('emp-1', 'test-tenant');
      expect(result.message).toBe('Empleado eliminado correctamente');
      expect(mockClient.user.delete).toHaveBeenCalledWith({
        where: { id: 'emp-1' },
      });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockClient.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('no-exist', 'test-tenant')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
