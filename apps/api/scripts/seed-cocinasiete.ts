
import { PrismaClient, ProductType } from '@prisma/client';

// Conectar a la base de datos de cocinasiete
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:alvarojose1998@72.62.161.199:5432/db_cocina_siete?schema=public';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});

// ============ DATOS DEL MENÚ SEMANAL DE COCINA SIETE ============

interface ModifierDef {
    name: string;
    priceAdjustment: number;
}

interface ModifierGroupDef {
    name: string;
    minSelect: number;
    maxSelect: number;
    modifiers: ModifierDef[];
}

interface ProductDef {
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    image: string;
    modifierGroups: ModifierGroupDef[];
}

interface CategoryDef {
    name: string;
    slug: string;
    platos: ProductDef[];
    postre: ProductDef;
    jugos: ProductDef[];
}

// Modificadores comunes para platos principales
const acompañamientosComunes: ModifierGroupDef = {
    name: 'Acompañamiento',
    minSelect: 0,
    maxSelect: 2,
    modifiers: [
        { name: 'Arroz extra', priceAdjustment: 2000 },
        { name: 'Patacón', priceAdjustment: 2000 },
        { name: 'Aguacate', priceAdjustment: 3000 },
        { name: 'Ensalada extra', priceAdjustment: 2500 },
    ],
};

const proteinaExtra: ModifierGroupDef = {
    name: 'Proteína adicional',
    minSelect: 0,
    maxSelect: 1,
    modifiers: [
        { name: 'Huevo frito', priceAdjustment: 2000 },
        { name: 'Chicharrón extra', priceAdjustment: 4000 },
        { name: 'Carne extra', priceAdjustment: 5000 },
    ],
};

const bebidasAdicionales: ModifierGroupDef = {
    name: 'Bebida adicional',
    minSelect: 0,
    maxSelect: 1,
    modifiers: [
        { name: 'Agua de panela', priceAdjustment: 2000 },
        { name: 'Limonada de panela', priceAdjustment: 2500 },
        { name: 'Gaseosa', priceAdjustment: 3000 },
    ],
};

const tamañoJugo: ModifierGroupDef = {
    name: 'Tamaño',
    minSelect: 0,
    maxSelect: 1,
    modifiers: [
        { name: 'Grande (16oz)', priceAdjustment: 2000 },
    ],
};

const endulzanteJugo: ModifierGroupDef = {
    name: 'Endulzante',
    minSelect: 0,
    maxSelect: 1,
    modifiers: [
        { name: 'Sin azúcar', priceAdjustment: 0 },
        { name: 'Con panela', priceAdjustment: 0 },
        { name: 'Con miel', priceAdjustment: 500 },
    ],
};

const adicionPostre: ModifierGroupDef = {
    name: 'Adición',
    minSelect: 0,
    maxSelect: 2,
    modifiers: [
        { name: 'Crema chantilly', priceAdjustment: 1500 },
        { name: 'Salsa de arequipe', priceAdjustment: 1500 },
        { name: 'Helado de vainilla', priceAdjustment: 3000 },
    ],
};

// ============ MENÚ DE LA SEMANA ============

const menuSemanal: CategoryDef[] = [
    {
        name: 'Lunes',
        slug: 'lunes',
        platos: [
            {
                name: 'Bandeja Paisa',
                slug: 'bandeja-paisa-lunes',
                description: 'El plato más emblemático de Colombia. Incluye frijoles rojos, arroz blanco, carne molida, chicharrón, huevo frito, tajada de plátano maduro, chorizo, arepa, aguacate y hogao.',
                basePrice: 25000,
                image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023882c?w=800',
                modifierGroups: [acompañamientosComunes, proteinaExtra, bebidasAdicionales],
            },
            {
                name: 'Sancocho de Gallina',
                slug: 'sancocho-gallina-lunes',
                description: 'Sopa tradicional colombiana con gallina criolla, yuca, plátano verde, papa, mazorca y cilantro. Se sirve con arroz blanco y aguacate.',
                basePrice: 22000,
                image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
                modifierGroups: [acompañamientosComunes, bebidasAdicionales],
            },
            {
                name: 'Sudado de Pollo',
                slug: 'sudado-pollo-lunes',
                description: 'Presa de pollo guisada en salsa criolla con tomate, cebolla y cilantro. Acompañado de arroz blanco, papa criolla y ensalada.',
                basePrice: 20000,
                image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800',
                modifierGroups: [acompañamientosComunes, proteinaExtra, bebidasAdicionales],
            },
        ],
        postre: {
            name: 'Arroz con Leche',
            slug: 'arroz-con-leche',
            description: 'Postre tradicional colombiano de arroz cocido con leche, canela, clavos y azúcar. Servido frío con canela espolvoreada.',
            basePrice: 10000,
            image: 'https://images.unsplash.com/photo-1621236378699-8597faf6a176?w=800',
            modifierGroups: [adicionPostre],
        },
        jugos: [
            {
                name: 'Jugo de Lulo',
                slug: 'jugo-lulo-lunes',
                description: 'Jugo natural de lulo fresco, la fruta cítrica colombiana por excelencia. Refrescante y lleno de vitamina C.',
                basePrice: 3000,
                image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800',
                modifierGroups: [tamañoJugo, endulzanteJugo],
            },
            {
                name: 'Jugo de Maracuyá',
                slug: 'jugo-maracuya-lunes',
                description: 'Jugo natural de maracuyá (fruta de la pasión). Tropical, ácido y refrescante.',
                basePrice: 3000,
                image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800',
                modifierGroups: [tamañoJugo, endulzanteJugo],
            },
        ],
    },
    {
        name: 'Martes',
        slug: 'martes',
        platos: [
            {
                name: 'Ajiaco Bogotano',
                slug: 'ajiaco-bogotano-martes',
                description: 'Sopa espesa típica de Bogotá con tres tipos de papa, pollo desmechado, mazorca y guascas. Se sirve con crema de leche, alcaparras y aguacate.',
                basePrice: 23000,
                image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
                modifierGroups: [acompañamientosComunes, bebidasAdicionales],
            },
            {
                name: 'Mojarra Frita',
                slug: 'mojarra-frita-martes',
                description: 'Mojarra entera frita al punto, crujiente por fuera y jugosa por dentro. Acompañada de arroz con coco, patacón, ensalada y limón.',
                basePrice: 24000,
                image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800',
                modifierGroups: [acompañamientosComunes, proteinaExtra, bebidasAdicionales],
            },
            {
                name: 'Carne Asada con Patacón',
                slug: 'carne-asada-patacon-martes',
                description: 'Corte de carne de res asado a la parrilla con chimichurri casero. Servido con patacones, arroz, frijoles y ensalada fresca.',
                basePrice: 25000,
                image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
                modifierGroups: [acompañamientosComunes, proteinaExtra, bebidasAdicionales],
            },
        ],
        postre: {
            name: 'Natilla con Buñuelos',
            slug: 'natilla-bunuelos',
            description: 'Natilla de maíz suave y cremosa acompañada de buñuelos de queso doraditos. Tradición colombiana en cada bocado.',
            basePrice: 10000,
            image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
            modifierGroups: [adicionPostre],
        },
        jugos: [
            {
                name: 'Jugo de Guanábana',
                slug: 'jugo-guanabana-martes',
                description: 'Jugo cremoso de guanábana fresca. Sabor tropical incomparable, dulce y refrescante.',
                basePrice: 3000,
                image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800',
                modifierGroups: [tamañoJugo, endulzanteJugo],
            },
            {
                name: 'Jugo de Tomate de Árbol',
                slug: 'jugo-tomate-arbol-martes',
                description: 'Jugo tradicional colombiano de tomate de árbol. Ligeramente ácido, rico en vitaminas y minerales.',
                basePrice: 3000,
                image: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800',
                modifierGroups: [tamañoJugo, endulzanteJugo],
            },
        ],
    },
    {
        name: 'Miercoles',
        slug: 'miercoles',
        platos: [
            {
                name: 'Cazuela de Frijoles',
                slug: 'cazuela-frijoles-miercoles',
                description: 'Cazuela humeante de frijoles rojos con pezuña de cerdo, plátano maduro y hogao. Servida con arroz blanco, aguacate y arepa.',
                basePrice: 20000,
                image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800',
                modifierGroups: [acompañamientosComunes, proteinaExtra, bebidasAdicionales],
            },
            {
                name: 'Pollo a la Criolla',
                slug: 'pollo-criolla-miercoles',
                description: 'Pechuga de pollo bañada en salsa criolla con tomate, cebolla y pimentón. Acompañada de arroz amarillo y papa salada.',
                basePrice: 21000,
                image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800',
                modifierGroups: [acompañamientosComunes, proteinaExtra, bebidasAdicionales],
            },
            {
                name: 'Sobrebarriga en Salsa',
                slug: 'sobrebarriga-salsa-miercoles',
                description: 'Sobrebarriga tierna horneada en salsa criolla colombiana. Con arroz blanco, papa chorreada, plátano maduro y ensalada.',
                basePrice: 24000,
                image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
                modifierGroups: [acompañamientosComunes, proteinaExtra, bebidasAdicionales],
            },
        ],
        postre: {
            name: 'Bocadillo con Queso',
            slug: 'bocadillo-queso',
            description: 'Dulce de guayaba artesanal (bocadillo veleño) acompañado de queso campesino fresco. La combinación perfecta colombiana.',
            basePrice: 10000,
            image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
            modifierGroups: [adicionPostre],
        },
        jugos: [
            {
                name: 'Jugo de Mango',
                slug: 'jugo-mango-miercoles',
                description: 'Jugo espeso y cremoso de mango maduro colombiano. Dulce, tropical y refrescante.',
                basePrice: 3000,
                image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800',
                modifierGroups: [tamañoJugo, endulzanteJugo],
            },
            {
                name: 'Jugo de Mora',
                slug: 'jugo-mora-miercoles',
                description: 'Jugo de mora de castilla fresca. Intenso sabor a frutos rojos, rico en antioxidantes.',
                basePrice: 3000,
                image: 'https://images.unsplash.com/photo-1564769625688-062b606168bf?w=800',
                modifierGroups: [tamañoJugo, endulzanteJugo],
            },
        ],
    },
    {
        name: 'Jueves',
        slug: 'jueves',
        platos: [
            {
                name: 'Tamales Tolimenses',
                slug: 'tamales-tolimenses-jueves',
                description: 'Tamales envueltos en hoja de plátano, rellenos de arroz, pollo, cerdo, huevo, zanahoria y arveja. Receta tradicional del Tolima.',
                basePrice: 22000,
                image: 'https://images.unsplash.com/photo-1529543544282-e981b1e4a3b5?w=800',
                modifierGroups: [acompañamientosComunes, bebidasAdicionales],
            },
            {
                name: 'Lengua en Salsa',
                slug: 'lengua-salsa-jueves',
                description: 'Lengua de res tierna cocida a fuego lento en rica salsa de tomate y especias colombianas. Con arroz, papa criolla y ensalada.',
                basePrice: 24000,
                image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
                modifierGroups: [acompañamientosComunes, proteinaExtra, bebidasAdicionales],
            },
            {
                name: 'Arroz Atollado Valluno',
                slug: 'arroz-atollado-jueves',
                description: 'Arroz cremoso estilo Valle del Cauca con cerdo, pollo, papa, hogao y condimentos criollos. Plato abundant y reconfortante.',
                basePrice: 22000,
                image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
                modifierGroups: [acompañamientosComunes, proteinaExtra, bebidasAdicionales],
            },
        ],
        postre: {
            name: 'Tres Leches Colombiano',
            slug: 'tres-leches-colombiano',
            description: 'Bizcocho esponjoso bañado en tres leches (condensada, evaporada y crema de leche), con merengue tostado encima.',
            basePrice: 10000,
            image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800',
            modifierGroups: [adicionPostre],
        },
        jugos: [
            {
                name: 'Jugo de Lulo',
                slug: 'jugo-lulo-jueves',
                description: 'Jugo natural de lulo fresco, la fruta cítrica colombiana por excelencia. Refrescante y lleno de vitamina C.',
                basePrice: 3000,
                image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800',
                modifierGroups: [tamañoJugo, endulzanteJugo],
            },
            {
                name: 'Jugo de Guayaba',
                slug: 'jugo-guayaba-jueves',
                description: 'Jugo rosado de guayaba madura. Cremoso y aromático, una de las frutas insignia colombianas.',
                basePrice: 3000,
                image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800',
                modifierGroups: [tamañoJugo, endulzanteJugo],
            },
        ],
    },
    {
        name: 'Viernes',
        slug: 'viernes',
        platos: [
            {
                name: 'Lechona Tolimense',
                slug: 'lechona-tolimense-viernes',
                description: 'Porción generosa de lechona con cerdo desmenuzado, arroz con arveja y piel crujiente. Receta tradicional del Tolima, servida con arepa.',
                basePrice: 25000,
                image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
                modifierGroups: [acompañamientosComunes, proteinaExtra, bebidasAdicionales],
            },
            {
                name: 'Cazuela de Mariscos',
                slug: 'cazuela-mariscos-viernes',
                description: 'Cazuela con camarones, calamares, pulpo y pescado en salsa de coco con especias del Pacífico. Acompañada de arroz con coco y patacón.',
                basePrice: 25000,
                image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800',
                modifierGroups: [acompañamientosComunes, bebidasAdicionales],
            },
            {
                name: 'Chicharrón con Arepa',
                slug: 'chicharron-arepa-viernes',
                description: 'Chicharrón de cerdo crujiente servido con arepa de maíz, papa criolla dorada, hogao y limón. Clásico colombiano.',
                basePrice: 21000,
                image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800',
                modifierGroups: [acompañamientosComunes, proteinaExtra, bebidasAdicionales],
            },
        ],
        postre: {
            name: 'Obleas con Arequipe',
            slug: 'obleas-arequipe',
            description: 'Obleas crujientes rellenas de arequipe (dulce de leche colombiano), con opción de coco rallado, mermelada y queso rallado.',
            basePrice: 10000,
            image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
            modifierGroups: [adicionPostre],
        },
        jugos: [
            {
                name: 'Jugo de Maracuyá',
                slug: 'jugo-maracuya-viernes',
                description: 'Jugo natural de maracuyá (fruta de la pasión). Tropical, ácido y refrescante.',
                basePrice: 3000,
                image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800',
                modifierGroups: [tamañoJugo, endulzanteJugo],
            },
            {
                name: 'Jugo de Guanábana',
                slug: 'jugo-guanabana-viernes',
                description: 'Jugo cremoso de guanábana fresca. Sabor tropical incomparable, dulce y refrescante.',
                basePrice: 3000,
                image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800',
                modifierGroups: [tamañoJugo, endulzanteJugo],
            },
        ],
    },
    {
        name: 'Sabado',
        slug: 'sabado',
        platos: [
            {
                name: 'Caldo de Costilla',
                slug: 'caldo-costilla-sabado',
                description: 'Caldo reconfortante de costilla de res con papa, cilantro y hogao. Desayuno típico colombiano servido con arepa y aguacate.',
                basePrice: 20000,
                image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
                modifierGroups: [acompañamientosComunes, proteinaExtra, bebidasAdicionales],
            },
            {
                name: 'Posta Cartagenera',
                slug: 'posta-cartagenera-sabado',
                description: 'Carne de res cocinada lentamente en salsa de panela, especias y Coca-Cola. Plato insignia de Cartagena de Indias con arroz con coco y patacón.',
                basePrice: 25000,
                image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
                modifierGroups: [acompañamientosComunes, proteinaExtra, bebidasAdicionales],
            },
            {
                name: 'Mute Santandereano',
                slug: 'mute-santandereano-sabado',
                description: 'Sopa espesa santandereana con maíz, trigo, frijol, cerdo, papa y verduras. Plato robusto de la tradición boyacense y santandereana.',
                basePrice: 22000,
                image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800',
                modifierGroups: [acompañamientosComunes, bebidasAdicionales],
            },
        ],
        postre: {
            name: 'Postre de Natas',
            slug: 'postre-de-natas',
            description: 'Postre boyacense preparado con natas de leche, azúcar y canela. Cremoso, suave y tradicional de la región cundiboyacense.',
            basePrice: 10000,
            image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800',
            modifierGroups: [adicionPostre],
        },
        jugos: [
            {
                name: 'Jugo de Mora',
                slug: 'jugo-mora-sabado',
                description: 'Jugo de mora de castilla fresca. Intenso sabor a frutos rojos, rico en antioxidantes.',
                basePrice: 3000,
                image: 'https://images.unsplash.com/photo-1564769625688-062b606168bf?w=800',
                modifierGroups: [tamañoJugo, endulzanteJugo],
            },
            {
                name: 'Jugo de Mango',
                slug: 'jugo-mango-sabado',
                description: 'Jugo espeso y cremoso de mango maduro colombiano. Dulce, tropical y refrescante.',
                basePrice: 3000,
                image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800',
                modifierGroups: [tamañoJugo, endulzanteJugo],
            },
        ],
    },
];

// ============ FUNCIÓN DE CREACIÓN ============

async function createProduct(product: ProductDef, categoryId: string) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (existing) {
        console.log(`  ⚠️  Producto ya existe: ${product.name}`);
        // Asegurarse de que está vinculado a la categoría
        await prisma.categoriesOnProducts.upsert({
            where: { productId_categoryId: { productId: existing.id, categoryId } },
            create: { productId: existing.id, categoryId },
            update: {},
        });
        return existing;
    }

    const created = await prisma.product.create({
        data: {
            name: product.name,
            slug: product.slug,
            description: product.description,
            productType: ProductType.RESTAURANT,
            basePrice: product.basePrice,
            images: product.image ? [product.image] : [],
            isAvailable: true,
            published: true,
            variants: {
                create: [
                    {
                        name: 'Porción',
                        price: product.basePrice,
                        stock: 100,
                        sku: product.slug.toUpperCase().replace(/-/g, '_'),
                        attributes: {},
                        isDefault: true,
                    },
                ],
            },
            modifierGroups: {
                create: product.modifierGroups.map((g) => ({
                    name: g.name,
                    minSelect: g.minSelect,
                    maxSelect: g.maxSelect,
                    modifiers: {
                        create: g.modifiers.map((m) => ({
                            name: m.name,
                            priceAdjustment: m.priceAdjustment,
                            stock: null, // sin límite
                            isAvailable: true,
                        })),
                    },
                })),
            },
            categories: {
                create: {
                    categoryId,
                },
            },
        },
    });

    console.log(`  ✅ Producto creado: ${product.name} ($${product.basePrice.toLocaleString()})`);
    return created;
}

async function main() {
    console.log('🇨🇴 ================================================');
    console.log('🇨🇴  SEED: Menú Semanal Cocina Siete');
    console.log('🇨🇴  6 Categorías (Lun-Sáb) | 36 productos');
    console.log('🇨🇴 ================================================\n');

    let totalProducts = 0;

    for (const dia of menuSemanal) {
        console.log(`\n📅 === ${dia.name.toUpperCase()} ===`);

        // Crear o buscar categoría
        let category = await prisma.category.findUnique({ where: { slug: dia.slug } });
        if (!category) {
            category = await prisma.category.create({
                data: {
                    name: dia.name,
                    slug: dia.slug,
                },
            });
            console.log(`  📁 Categoría creada: ${dia.name}`);
        } else {
            console.log(`  📁 Categoría ya existe: ${dia.name}`);
        }

        // Crear platos principales (3 por día)
        console.log('  🍽️  Platos principales:');
        for (const plato of dia.platos) {
            await createProduct(plato, category.id);
            totalProducts++;
        }

        // Crear postre (1 por día)
        console.log('  🍰 Postre:');
        await createProduct(dia.postre, category.id);
        totalProducts++;

        // Crear jugos (2 por día)
        console.log('  🧃 Jugos:');
        for (const jugo of dia.jugos) {
            await createProduct(jugo, category.id);
            totalProducts++;
        }
    }

    console.log('\n🇨🇴 ================================================');
    console.log(`🇨🇴  SEED COMPLETADO`);
    console.log(`🇨🇴  Categorías: 6 (Lunes a Sábado)`);
    console.log(`🇨🇴  Productos totales: ${totalProducts}`);
    console.log(`🇨🇴    - 18 Platos principales`);
    console.log(`🇨🇴    - 6 Postres`);
    console.log(`🇨🇴    - 12 Jugos`);
    console.log('🇨🇴 ================================================\n');
}

main()
    .catch((e) => {
        console.error('❌ Error en el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
