import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Reflector } from '@nestjs/core';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let service: EmployeesService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findMany: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        { provide: EmployeesService, useValue: mockService },
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EmployeesController>(EmployeesController);
    service = module.get<EmployeesService>(EmployeesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe delegar al servicio', async () => {
      const dto = {
        name: 'Test',
        email: 'test@t.com',
        password: '123456',
        role: 'WAITER' as any,
      };
      const expected = { id: '1', ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto, 'test-tenant');

      expect(result).toEqual(expected);
      expect(mockService.create).toHaveBeenCalledWith(dto, 'test-tenant');
    });
  });

  describe('findAll', () => {
    it('debe retornar lista de empleados', async () => {
      const employees = [
        { id: '1', name: 'A' },
        { id: '2', name: 'B' },
      ];
      mockService.findAll.mockResolvedValue(employees);

      const result = await controller.findAll('test-tenant');

      expect(result).toEqual(employees);
      expect(mockService.findAll).toHaveBeenCalledWith('test-tenant');
    });
  });

  describe('findOne', () => {
    it('debe retornar un empleado', async () => {
      const employee = { id: '1', name: 'A', role: 'WAITER' };
      mockService.findOne.mockResolvedValue(employee);

      const result = await controller.findOne('1', 'test-tenant');

      expect(result).toEqual(employee);
      expect(mockService.findOne).toHaveBeenCalledWith('1', 'test-tenant');
    });
  });

  describe('update', () => {
    it('debe actualizar y retornar empleado', async () => {
      const dto = { name: 'Updated' };
      const expected = { id: '1', name: 'Updated', role: 'WAITER' };
      mockService.update.mockResolvedValue(expected);

      const result = await controller.update('1', dto, 'test-tenant');

      expect(result).toEqual(expected);
      expect(mockService.update).toHaveBeenCalledWith('1', dto, 'test-tenant');
    });
  });

  describe('remove', () => {
    it('debe eliminar y retornar mensaje', async () => {
      const expected = { message: 'Empleado eliminado correctamente' };
      mockService.remove.mockResolvedValue(expected);

      const result = await controller.remove('1', 'test-tenant');

      expect(result).toEqual(expected);
      expect(mockService.remove).toHaveBeenCalledWith('1', 'test-tenant');
    });
  });
});
