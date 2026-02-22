const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:alvarojose1998@72.62.161.199:5432/db_cocina_siete';

function slugify(text) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function cuid() {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 10);
    return 'cl' + ts + rand;
}

// ============ DATOS ============

const acompModifiers = [
    { name: 'Arroz extra', price: 2000 },
    { name: 'Patacón', price: 2000 },
    { name: 'Aguacate', price: 3000 },
    { name: 'Ensalada extra', price: 2500 },
];

const proteinaModifiers = [
    { name: 'Huevo frito', price: 2000 },
    { name: 'Chicharrón extra', price: 4000 },
    { name: 'Carne extra', price: 5000 },
];

const bebidaModifiers = [
    { name: 'Agua de panela', price: 2000 },
    { name: 'Limonada de panela', price: 2500 },
    { name: 'Gaseosa', price: 3000 },
];

const tamanoJugoMod = [
    { name: 'Grande (16oz)', price: 2000 },
];

const endulzanteJugoMod = [
    { name: 'Sin azúcar', price: 0 },
    { name: 'Con panela', price: 0 },
    { name: 'Con miel', price: 500 },
];

const adicionPostreMod = [
    { name: 'Crema chantilly', price: 1500 },
    { name: 'Salsa de arequipe', price: 1500 },
    { name: 'Helado de vainilla', price: 3000 },
];

const menuSemanal = [
    {
        dia: 'Lunes', slug: 'lunes',
        platos: [
            { name: 'Bandeja Paisa', desc: 'El plato más emblemático de Colombia. Incluye frijoles rojos, arroz blanco, carne molida, chicharrón, huevo frito, tajada de plátano maduro, chorizo, arepa, aguacate y hogao.', price: 25000, modGroups: ['acomp', 'prot', 'beb'] },
            { name: 'Sancocho de Gallina', desc: 'Sopa tradicional colombiana con gallina criolla, yuca, plátano verde, papa, mazorca y cilantro. Se sirve con arroz blanco y aguacate.', price: 22000, modGroups: ['acomp', 'beb'] },
            { name: 'Sudado de Pollo', desc: 'Presa de pollo guisada en salsa criolla con tomate, cebolla y cilantro. Acompañado de arroz blanco, papa criolla y ensalada.', price: 20000, modGroups: ['acomp', 'prot', 'beb'] },
        ],
        postre: { name: 'Arroz con Leche', desc: 'Postre tradicional colombiano de arroz cocido con leche, canela, clavos y azúcar. Servido frío con canela espolvoreada.', price: 10000 },
        jugos: [
            { name: 'Jugo de Lulo', desc: 'Jugo natural de lulo fresco, la fruta cítrica colombiana por excelencia. Refrescante y lleno de vitamina C.', price: 3000 },
            { name: 'Jugo de Maracuyá', desc: 'Jugo natural de maracuyá (fruta de la pasión). Tropical, ácido y refrescante.', price: 3000 },
        ],
    },
    {
        dia: 'Martes', slug: 'martes',
        platos: [
            { name: 'Ajiaco Bogotano', desc: 'Sopa espesa típica de Bogotá con tres tipos de papa, pollo desmechado, mazorca y guascas. Se sirve con crema de leche, alcaparras y aguacate.', price: 23000, modGroups: ['acomp', 'beb'] },
            { name: 'Mojarra Frita', desc: 'Mojarra entera frita al punto, crujiente por fuera y jugosa por dentro. Acompañada de arroz con coco, patacón, ensalada y limón.', price: 24000, modGroups: ['acomp', 'prot', 'beb'] },
            { name: 'Carne Asada con Patacón', desc: 'Corte de carne de res asado a la parrilla con chimichurri casero. Servido con patacones, arroz, frijoles y ensalada fresca.', price: 25000, modGroups: ['acomp', 'prot', 'beb'] },
        ],
        postre: { name: 'Natilla con Buñuelos', desc: 'Natilla de maíz suave y cremosa acompañada de buñuelos de queso doraditos. Tradición colombiana en cada bocado.', price: 10000 },
        jugos: [
            { name: 'Jugo de Guanábana', desc: 'Jugo cremoso de guanábana fresca. Sabor tropical incomparable, dulce y refrescante.', price: 3000 },
            { name: 'Jugo de Tomate de Árbol', desc: 'Jugo tradicional colombiano de tomate de árbol. Ligeramente ácido, rico en vitaminas y minerales.', price: 3000 },
        ],
    },
    {
        dia: 'Miercoles', slug: 'miercoles',
        platos: [
            { name: 'Cazuela de Frijoles', desc: 'Cazuela humeante de frijoles rojos con pezuña de cerdo, plátano maduro y hogao. Servida con arroz blanco, aguacate y arepa.', price: 20000, modGroups: ['acomp', 'prot', 'beb'] },
            { name: 'Pollo a la Criolla', desc: 'Pechuga de pollo bañada en salsa criolla con tomate, cebolla y pimentón. Acompañada de arroz amarillo y papa salada.', price: 21000, modGroups: ['acomp', 'prot', 'beb'] },
            { name: 'Sobrebarriga en Salsa', desc: 'Sobrebarriga tierna horneada en salsa criolla colombiana. Con arroz blanco, papa chorreada, plátano maduro y ensalada.', price: 24000, modGroups: ['acomp', 'prot', 'beb'] },
        ],
        postre: { name: 'Bocadillo con Queso', desc: 'Dulce de guayaba artesanal (bocadillo veleño) acompañado de queso campesino fresco. La combinación perfecta colombiana.', price: 10000 },
        jugos: [
            { name: 'Jugo de Mango', desc: 'Jugo espeso y cremoso de mango maduro colombiano. Dulce, tropical y refrescante.', price: 3000 },
            { name: 'Jugo de Mora', desc: 'Jugo de mora de castilla fresca. Intenso sabor a frutos rojos, rico en antioxidantes.', price: 3000 },
        ],
    },
    {
        dia: 'Jueves', slug: 'jueves',
        platos: [
            { name: 'Tamales Tolimenses', desc: 'Tamales envueltos en hoja de plátano, rellenos de arroz, pollo, cerdo, huevo, zanahoria y arveja. Receta tradicional del Tolima.', price: 22000, modGroups: ['acomp', 'beb'] },
            { name: 'Lengua en Salsa', desc: 'Lengua de res tierna cocida a fuego lento en rica salsa de tomate y especias colombianas. Con arroz, papa criolla y ensalada.', price: 24000, modGroups: ['acomp', 'prot', 'beb'] },
            { name: 'Arroz Atollado Valluno', desc: 'Arroz cremoso estilo Valle del Cauca con cerdo, pollo, papa, hogao y condimentos criollos. Plato abundante y reconfortante.', price: 22000, modGroups: ['acomp', 'prot', 'beb'] },
        ],
        postre: { name: 'Tres Leches Colombiano', desc: 'Bizcocho esponjoso bañado en tres leches (condensada, evaporada y crema de leche), con merengue tostado encima.', price: 10000 },
        jugos: [
            { name: 'Jugo de Lulo', desc: 'Jugo natural de lulo fresco, la fruta cítrica colombiana por excelencia.', price: 3000 },
            { name: 'Jugo de Guayaba', desc: 'Jugo rosado de guayaba madura. Cremoso y aromático, una de las frutas insignia colombianas.', price: 3000 },
        ],
    },
    {
        dia: 'Viernes', slug: 'viernes',
        platos: [
            { name: 'Lechona Tolimense', desc: 'Porción generosa de lechona con cerdo desmenuzado, arroz con arveja y piel crujiente. Receta tradicional del Tolima, servida con arepa.', price: 25000, modGroups: ['acomp', 'prot', 'beb'] },
            { name: 'Cazuela de Mariscos', desc: 'Cazuela con camarones, calamares, pulpo y pescado en salsa de coco con especias del Pacífico. Acompañada de arroz con coco y patacón.', price: 25000, modGroups: ['acomp', 'beb'] },
            { name: 'Chicharrón con Arepa', desc: 'Chicharrón de cerdo crujiente servido con arepa de maíz, papa criolla dorada, hogao y limón. Clásico colombiano.', price: 21000, modGroups: ['acomp', 'prot', 'beb'] },
        ],
        postre: { name: 'Obleas con Arequipe', desc: 'Obleas crujientes rellenas de arequipe (dulce de leche colombiano), con opción de coco rallado, mermelada y queso rallado.', price: 10000 },
        jugos: [
            { name: 'Jugo de Maracuyá', desc: 'Jugo natural de maracuyá (fruta de la pasión). Tropical, ácido y refrescante.', price: 3000 },
            { name: 'Jugo de Guanábana', desc: 'Jugo cremoso de guanábana fresca. Sabor tropical incomparable, dulce y refrescante.', price: 3000 },
        ],
    },
    {
        dia: 'Sabado', slug: 'sabado',
        platos: [
            { name: 'Caldo de Costilla', desc: 'Caldo reconfortante de costilla de res con papa, cilantro y hogao. Desayuno típico colombiano servido con arepa y aguacate.', price: 20000, modGroups: ['acomp', 'prot', 'beb'] },
            { name: 'Posta Cartagenera', desc: 'Carne de res cocinada lentamente en salsa de panela, especias y Coca-Cola. Plato insignia de Cartagena de Indias con arroz con coco y patacón.', price: 25000, modGroups: ['acomp', 'prot', 'beb'] },
            { name: 'Mute Santandereano', desc: 'Sopa espesa santandereana con maíz, trigo, frijol, cerdo, papa y verduras. Plato robusto de la tradición boyacense y santandereana.', price: 22000, modGroups: ['acomp', 'beb'] },
        ],
        postre: { name: 'Postre de Natas', desc: 'Postre boyacense preparado con natas de leche, azúcar y canela. Cremoso, suave y tradicional de la región cundiboyacense.', price: 10000 },
        jugos: [
            { name: 'Jugo de Mora', desc: 'Jugo de mora de castilla fresca. Intenso sabor a frutos rojos, rico en antioxidantes.', price: 3000 },
            { name: 'Jugo de Mango', desc: 'Jugo espeso y cremoso de mango maduro colombiano. Dulce, tropical y refrescante.', price: 3000 },
        ],
    },
];

async function main() {
    const client = new Client({ connectionString: DB_URL });
    await client.connect();
    console.log('Connected to db_cocina_siete (production)\n');

    let totalProducts = 0;

    for (const dia of menuSemanal) {
        console.log(`\n=== ${dia.dia.toUpperCase()} ===`);

        // 1. Create category
        let catId;
        const existingCat = await client.query('SELECT id FROM "Category" WHERE slug = $1', [dia.slug]);
        if (existingCat.rows.length > 0) {
            catId = existingCat.rows[0].id;
            console.log('  Categoria ya existe:', dia.dia);
        } else {
            catId = cuid();
            await client.query(
                'INSERT INTO "Category" (id, name, slug) VALUES ($1, $2, $3)',
                [catId, dia.dia, dia.slug]
            );
            console.log('  Categoria creada:', dia.dia);
        }

        // Helper to create a product
        async function createProduct(prod, type) {
            const slug = slugify(prod.name) + '-' + dia.slug;

            const existing = await client.query('SELECT id FROM "Product" WHERE slug = $1', [slug]);
            if (existing.rows.length > 0) {
                console.log('    SKIP (exists):', prod.name);
                return;
            }

            const prodId = cuid();
            const now = new Date().toISOString();

            await client.query(
                `INSERT INTO "Product" (id, name, slug, description, "productType", "basePrice", images, "isAvailable", published, "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [prodId, prod.name, slug, prod.desc, 'RESTAURANT', prod.price, '{}', true, true, now, now]
            );

            // Create default variant
            const variantId = cuid();
            const sku = slug.toUpperCase().replace(/-/g, '_');
            await client.query(
                `INSERT INTO "ProductVariant" (id, "productId", sku, name, price, stock, attributes, "isDefault", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [variantId, prodId, sku, 'Porción', prod.price, 100, '{}', true, now, now]
            );

            // Link to category
            await client.query(
                `INSERT INTO "CategoriesOnProducts" ("productId", "categoryId") VALUES ($1, $2)`,
                [prodId, catId]
            );

            // Create modifier groups based on type
            let modGroupsDefs = [];
            if (type === 'plato') {
                const groups = prod.modGroups || [];
                if (groups.includes('acomp')) modGroupsDefs.push({ name: 'Acompañamiento', min: 0, max: 2, mods: acompModifiers });
                if (groups.includes('prot')) modGroupsDefs.push({ name: 'Proteína adicional', min: 0, max: 1, mods: proteinaModifiers });
                if (groups.includes('beb')) modGroupsDefs.push({ name: 'Bebida adicional', min: 0, max: 1, mods: bebidaModifiers });
            } else if (type === 'postre') {
                modGroupsDefs.push({ name: 'Adición', min: 0, max: 2, mods: adicionPostreMod });
            } else if (type === 'jugo') {
                modGroupsDefs.push({ name: 'Tamaño', min: 0, max: 1, mods: tamanoJugoMod });
                modGroupsDefs.push({ name: 'Endulzante', min: 0, max: 1, mods: endulzanteJugoMod });
            }

            for (const mg of modGroupsDefs) {
                const mgId = cuid();
                await client.query(
                    `INSERT INTO "ModifierGroup" (id, name, "minSelect", "maxSelect", "productId", "createdAt", "updatedAt")
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [mgId, mg.name, mg.min, mg.max, prodId, now, now]
                );

                for (const mod of mg.mods) {
                    const modId = cuid();
                    await client.query(
                        `INSERT INTO "Modifier" (id, name, "priceAdjustment", stock, "isAvailable", "groupId", "createdAt", "updatedAt")
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [modId, mod.name, mod.price, null, true, mgId, now, now]
                    );
                }
            }

            console.log('    OK:', prod.name, '| $' + prod.price.toLocaleString());
            totalProducts++;
        }

        // 2. Create platos
        console.log('  Platos:');
        for (const plato of dia.platos) {
            await createProduct(plato, 'plato');
        }

        // 3. Create postre
        console.log('  Postre:');
        await createProduct(dia.postre, 'postre');

        // 4. Create jugos
        console.log('  Jugos:');
        for (const jugo of dia.jugos) {
            await createProduct(jugo, 'jugo');
        }
    }

    // Verify
    const finalCats = await client.query(
        "SELECT c.name, COUNT(cop.\"productId\") as prods FROM \"Category\" c LEFT JOIN \"CategoriesOnProducts\" cop ON c.id = cop.\"categoryId\" WHERE c.slug IN ('lunes','martes','miercoles','jueves','viernes','sabado') GROUP BY c.id, c.name ORDER BY c.name"
    );
    const finalProds = await client.query("SELECT COUNT(*) as count FROM \"Product\" WHERE \"productType\" = 'RESTAURANT'");
    const finalMGs = await client.query('SELECT COUNT(*) as count FROM "ModifierGroup"');
    const finalMods = await client.query('SELECT COUNT(*) as count FROM "Modifier"');

    console.log('\n=============================');
    console.log('RESUMEN FINAL:');
    console.log('=============================');
    console.log('Categorias del menu:');
    finalCats.rows.forEach(r => console.log('  ' + r.name + ': ' + r.prods + ' productos'));
    console.log('Total productos RESTAURANT:', finalProds.rows[0].count);
    console.log('Grupos de modificadores:', finalMGs.rows[0].count);
    console.log('Modificadores:', finalMods.rows[0].count);
    console.log('Productos creados en este seed:', totalProducts);
    console.log('=============================');

    await client.end();
}

main().catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
});
