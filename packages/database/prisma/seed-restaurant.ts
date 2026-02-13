import { PrismaClient, ProductType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🍔 Iniciando siembra del Menú de Restaurante...');

    // 1. Hamburguesa Clásica (Con término y adiciones)
    const burger = await prisma.product.create({
        data: {
            name: 'Hamburguesa Chesse Bacon',
            slug: 'hamburguesa-cheese-bacon',
            description: 'Carne angus 180g, queso cheddar fundido, tocineta crujiente, lechuga, tomate y salsa de la casa.',
            productType: 'RESTAURANT',
            basePrice: 12.50,
            isAvailable: true,
            published: true,
            images: [], // Sin imagen por ahora
            modifierGroups: {
                create: [
                    {
                        name: 'Término de la carne',
                        minSelect: 1,
                        maxSelect: 1,
                        modifiers: {
                            create: [
                                { name: 'Bien Cocido', priceAdjustment: 0 },
                                { name: '3/4', priceAdjustment: 0 },
                                { name: 'Medio', priceAdjustment: 0 },
                                { name: 'Azul', priceAdjustment: 0 }
                            ]
                        }
                    },
                    {
                        name: 'Adiciones',
                        minSelect: 0,
                        maxSelect: 3,
                        modifiers: {
                            create: [
                                { name: 'Tocineta Extra', priceAdjustment: 2.00 },
                                { name: 'Queso Extra', priceAdjustment: 1.50 },
                                { name: 'Huevo Frito', priceAdjustment: 1.00 },
                                { name: 'Pepinillos', priceAdjustment: 0.50 }
                            ]
                        }
                    },
                    {
                        name: '¿Desea combo?',
                        minSelect: 0,
                        maxSelect: 1,
                        modifiers: {
                            create: [
                                { name: 'Sí, con papas y gaseosa', priceAdjustment: 4.50 },
                                { name: 'Solo papas', priceAdjustment: 2.50 },
                                { name: 'No, gracias', priceAdjustment: 0 }
                            ]
                        }
                    }
                ]
            }
        }
    });
    console.log(`✅ Creada: ${burger.name}`);

    // 2. Pizza Personalizable
    const pizza = await prisma.product.create({
        data: {
            name: 'Pizza Artesanal Personalizada',
            slug: 'pizza-artesanal-personalizada',
            description: 'Base de masa madre con salsa napolitana y queso mozzarella. Elige tus ingredientes.',
            productType: 'RESTAURANT',
            basePrice: 10.00,
            isAvailable: true,
            published: true,
            images: [],
            modifierGroups: {
                create: [
                    {
                        name: 'Ingredientes (Elige hasta 4)',
                        minSelect: 0,
                        maxSelect: 4,
                        modifiers: {
                            create: [
                                { name: 'Pepperoni', priceAdjustment: 0 },
                                { name: 'Jamón', priceAdjustment: 0 },
                                { name: 'Champiñones', priceAdjustment: 0 },
                                { name: 'Pimentón', priceAdjustment: 0 },
                                { name: 'Aceitunas', priceAdjustment: 0 },
                                { name: 'Pollo Desmechado', priceAdjustment: 1.00 },
                                { name: 'Salami', priceAdjustment: 1.00 }
                            ]
                        }
                    },
                    {
                        name: 'Borde',
                        minSelect: 1,
                        maxSelect: 1,
                        modifiers: {
                            create: [
                                { name: 'Tradicional', priceAdjustment: 0 },
                                { name: 'Borde de Queso', priceAdjustment: 2.50 },
                                { name: 'Borde de Bocadillo', priceAdjustment: 2.00 }
                            ]
                        }
                    }
                ]
            }
        }
    });
    console.log(`✅ Creada: ${pizza.name}`);

    // 3. Bebida (Jugos Naturales)
    const juice = await prisma.product.create({
        data: {
            name: 'Jugo Natural',
            slug: 'jugo-natural',
            description: 'Jugos de fruta fresca preparados al instante.',
            productType: 'RESTAURANT',
            basePrice: 3.50,
            isAvailable: true,
            published: true,
            images: [],
            modifierGroups: {
                create: [
                    {
                        name: 'Sabor',
                        minSelect: 1,
                        maxSelect: 1,
                        modifiers: {
                            create: [
                                { name: 'Fresa', priceAdjustment: 0 },
                                { name: 'Mora', priceAdjustment: 0 },
                                { name: 'Mango', priceAdjustment: 0 },
                                { name: 'Maracuyá', priceAdjustment: 0.50 },
                                { name: 'Lulo', priceAdjustment: 0.50 }
                            ]
                        }
                    },
                    {
                        name: 'Base',
                        minSelect: 1,
                        maxSelect: 1,
                        modifiers: {
                            create: [
                                { name: 'En Agua', priceAdjustment: 0 },
                                { name: 'En Leche', priceAdjustment: 1.00 },
                                { name: 'En Leche de Almendras', priceAdjustment: 2.00 }
                            ]
                        }
                    },
                    {
                        name: 'Endulzante',
                        minSelect: 1,
                        maxSelect: 1,
                        modifiers: {
                            create: [
                                { name: 'Azúcar', priceAdjustment: 0 },
                                { name: 'Stevia', priceAdjustment: 0 },
                                { name: 'Miel', priceAdjustment: 0.50 },
                                { name: 'Sin dulce', priceAdjustment: 0 }
                            ]
                        }
                    }
                ]
            }
        }
    });
    console.log(`✅ Creada: ${juice.name}`);
}

main()
    .catch((e) => {
        console.error('❌ Error en seed restaurante:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
