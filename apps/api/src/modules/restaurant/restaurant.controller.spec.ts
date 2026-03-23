import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// ============ MOCK DATA ============

const mockMenuResponse = {
  restaurant: {
    name: 'Restaurante Demo',
    slug: 'demo',
    logo: 'https://example.com/logo.png',
    slogan: 'El mejor sabor',
    coverVideo: null,
    social: { whatsapp: '+573001234567' },
    phone: '+573001234567',
  },
  categories: [{ id: 'cat-1', name: 'Hamburguesas', slug: 'hamburguesas' }],
  products: [
    {
      id: 'prod-1',
      name: 'Hamburguesa Clásica',
      basePrice: 12.5,
      categories: [{ id: 'cat-1', name: 'Hamburguesas', slug: 'hamburguesas' }],
      variants: [{ id: 'var-1', name: 'Regular', price: 12.5 }],
      modifierGroups: [],
    },
  ],
};

// ============ MOCK SERVICE ============

const mockRestaurantService = {
  getPublicMenu: jest.fn(),
  updateRestaurant: jest.fn(),
  findOne: jest.fn(),
};

// ============ TESTS ============

describe('RestaurantController', () => {
  let controller: RestaurantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantController],
      providers: [
        { provide: RestaurantService, useValue: mockRestaurantService },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RestaurantController>(RestaurantController);
    jest.clearAllMocks();
  });

  // ============ GET /public/restaurant/:slug/menu ============

  describe('getMenu', () => {
    it('debería llamar getPublicMenu con el slug correcto', async () => {
      mockRestaurantService.getPublicMenu.mockResolvedValue(mockMenuResponse);

      const result = await controller.getMenu('demo');

      expect(mockRestaurantService.getPublicMenu).toHaveBeenCalledWith('demo');
      expect(result).toEqual(mockMenuResponse);
    });

    it('debería propagar NotFoundException del servicio si el slug no existe', async () => {
      mockRestaurantService.getPublicMenu.mockRejectedValue(
        new NotFoundException('Restaurant not found'),
      );

      await expect(controller.getMenu('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería retornar menú completo con restaurant, categories y products', async () => {
      mockRestaurantService.getPublicMenu.mockResolvedValue(mockMenuResponse);

      const result = await controller.getMenu('demo');

      expect(result).toHaveProperty('restaurant');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('products');
      expect(result.restaurant.slug).toBe('demo');
    });
  });
});
