import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 🛡️ CANDADO DE SEGURIDAD
    if (process.env.NODE_ENV === 'production') {
        console.log('🚫 ESTÁS EN PRODUCCIÓN. Seed cancelado por seguridad.');
        return;
    }

    console.log('🌱 Iniciando siembra de datos...');

    // 0. Crear Tenant por defecto
    await prisma.tenant.upsert({
        where: { slug: 'localhost' }, // Usamos el slug que suele usar el frontend
        update: {},
        create: {
            id: 'default',
            slug: 'localhost',
            dbName: 'web-projects=public',
            name: 'Tenant Base',
        }
    });
    console.log('🏢 Tenant Base asegurado');

    // 1. Asegurar Usuario Admin (Para pruebas de UI)
    const email = 'admin@mauromera.com';
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    const existingAdmin = await prisma.user.findFirst({ where: { email } });
    if (existingAdmin) {
        await prisma.user.update({ where: { id: existingAdmin.id }, data: { role: 'ADMIN' } });
    } else {
        await prisma.user.create({
            data: {
                tenantId: 'default',
                email,
                password: hashedPassword,
                name: 'Admin Tester',
                role: 'ADMIN',
                emailVerified: true,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
            }
        });
    }
    console.log('👤 Usuario Admin asegurado:', email);

    // 1.5 Crear Usuario Estudiante (Rol USER por defecto)
    const studentEmail = "alumno@mauromera.com";
    const existingStudent = await prisma.user.findFirst({ where: { email: studentEmail } });
    if (existingStudent) {
        // Si existe, no hace nada
    } else {
        await prisma.user.create({
            data: {
                tenantId: 'default',
                email: studentEmail,
                name: "Alumno Demo",
                password: hashedPassword,
                role: 'USER',
                emailVerified: true,
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            }
        });
    }
    console.log('🎓 Usuario Estudiante asegurado:', studentEmail);

    // 1.6 Crear Empleados de Restaurante (Mesero, Cocina, Caja)
    const employees = [
        { email: 'mesero@mauromera.com', name: 'Mesero Demo', role: 'WAITER' as const, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Waiter' },
        { email: 'cocina@mauromera.com', name: 'Cocina Demo', role: 'KITCHEN' as const, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kitchen' },
        { email: 'caja@mauromera.com', name: 'Cajero Demo', role: 'CASHIER' as const, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cashier' },
    ];

    for (const emp of employees) {
        const existingEmp = await prisma.user.findFirst({ where: { email: emp.email } });
        if (existingEmp) {
            await prisma.user.update({
                where: { id: existingEmp.id },
                data: { role: emp.role },
            });
        } else {
            await prisma.user.create({
                data: {
                    tenantId: 'default',
                    email: emp.email,
                    name: emp.name,
                    password: hashedPassword,
                    role: emp.role,
                    emailVerified: true,
                    avatar: emp.avatar,
                },
            });
        }
        console.log(`🧑‍🍳 Empleado ${emp.role} asegurado: ${emp.email}`);
    }

    // 2. Crear Tema con Cursos y Lecciones
    let theme = await prisma.theme.findFirst({ where: { slug: 'liderazgo-consciente-test' } });
    if (!theme) {
        theme = await prisma.theme.create({
            data: {
                tenantId: 'default',
                title: 'Liderazgo Consciente',
                slug: 'liderazgo-consciente-test',
                description: 'Un programa profundo para transformar tu manera de dirigir equipos y gestionar el talento humano con consciencia y estrategia.',
                coverImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
                published: true,
                order: 1
            }
        });
    }
    console.log('📚 Tema creado:', theme.title);

    // 3. Crear Curso dentro del Tema
    let course = await prisma.course.findFirst({ where: { slug: 'fundamentos-del-liderazgo-test' } });
    if (!course) {
        course = await prisma.course.create({
            data: {
                tenantId: 'default',
                themeId: theme.id,
                title: 'Fundamentos del Liderazgo',
                slug: 'fundamentos-del-liderazgo-test',
                description: 'Aprende las bases del liderazgo efectivo y cómo aplicarlo en tu vida personal y profesional.',
                coverImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80',
                published: true,
                isFree: true,
                order: 1
            }
        });
    }
    console.log('📖 Curso creado:', course.title);

    // 4. Crear Lecciones dentro del Curso
    const lessons = [
        {
            title: 'Bienvenida al Curso',
            slug: 'bienvenida-test',
            content: '<h2>¡Bienvenido!</h2><p>Este es un curso diseñado para ayudarte a desarrollar habilidades de liderazgo consciente.</p><p>A lo largo de las siguientes lecciones, exploraremos conceptos fundamentales que transformarán tu manera de liderar.</p>',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: 300,
            published: true,
            order: 1
        },
        {
            title: 'La Psicología del Líder',
            slug: 'psicologia-lider-test',
            content: '<h2>Entendiendo la Mente del Líder</h2><p>El liderazgo comienza desde adentro. En esta lección exploraremos los aspectos psicológicos que definen a un gran líder.</p><ul><li>Inteligencia emocional</li><li>Autoconocimiento</li><li>Empatía</li></ul>',
            duration: 600,
            published: true,
            order: 2
        },
        {
            title: 'Comunicación Efectiva',
            slug: 'comunicacion-efectiva-test',
            content: '<h2>El Arte de Comunicar</h2><p>La comunicación es la herramienta más poderosa del líder. Aprenderás técnicas probadas para transmitir tu visión de manera clara y motivadora.</p>',
            duration: 450,
            published: true,
            order: 3
        }
    ];

    for (const lesson of lessons) {
        const existingLesson = await prisma.lesson.findFirst({ where: { courseId: course.id, slug: lesson.slug } });
        if (!existingLesson) {
            await prisma.lesson.create({ data: { courseId: course.id, ...lesson } });
        }
    }
    console.log('📝 Lecciones creadas:', lessons.length);

    // 5. Crear Blog Posts
    const posts = [
        {
            title: '5 Claves para la Salud Mental en el Trabajo',
            slug: 'salud-mental-trabajo-test',
            excerpt: 'Descubre cómo mantener tu bienestar mental mientras alcanzas tus metas profesionales.',
            content: '<h2>La importancia del descanso</h2><p>El burnout es real. Aquí exploramos cómo evitarlo y mantener un balance saludable entre trabajo y vida personal.</p><h3>Clave 1: Establece límites claros</h3><p>Aprende a decir no y proteger tu tiempo personal.</p>',
            coverImage: 'https://images.unsplash.com/photo-1499750310159-5254f4cc1555?w=800&q=80',
            published: true,
            readingTime: 5
        },
        {
            title: 'El Poder de la Mentalidad de Crecimiento',
            slug: 'mentalidad-crecimiento-test',
            excerpt: 'Cómo desarrollar una mentalidad que te permita superar cualquier obstáculo.',
            content: '<h2>Mentalidad Fija vs Mentalidad de Crecimiento</h2><p>Carol Dweck nos enseñó que nuestra mentalidad determina nuestro éxito. Exploremos cómo cultivar una mentalidad de crecimiento.</p>',
            coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
            published: true,
            readingTime: 7
        }
    ];

    for (const post of posts) {
        const existingPost = await prisma.post.findFirst({ where: { slug: post.slug } });
        if (!existingPost) {
            await prisma.post.create({ data: { tenantId: 'default', ...post } });
        }
    }
    console.log('📰 Blog posts creados:', posts.length);

    // 6. Crear un Ebook de prueba


    // 7. Crear Productos de E-commerce (Nuevos Modelos Product/ProductVariant)
    console.log('\n🛒 Creando productos de e-commerce...');

    // 7.1 Digital Product (Guide)
    const existingDigital = await prisma.product.findFirst({ where: { slug: 'guia-liderazgo-consciente' } });
    const productDigital = existingDigital || await prisma.product.create({
        data: {
            tenantId: 'default',
            name: 'Guía Completa de Liderazgo Consciente',
            slug: 'guia-liderazgo-consciente',
            description: 'Una guía práctica con ejercicios y reflexiones para desarrollar tu potencial como líder consciente. Incluye casos de estudio reales, herramientas aplicables y ejercicios de autoevaluación.',
            productType: 'DIGITAL',
            basePrice: 29.99,
            images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'],
            published: true,
            specs: { pages: 120, format: 'PDF + ePub', language: 'Español', fileSize: '5MB' },
            variants: {
                create: {
                    tenantId: 'default',
                    sku: 'LID-DIGITAL-001',
                    name: 'Descarga Digital',
                    price: 29.99,
                    stock: -1,
                    isDefault: true,
                    attributes: { format: 'Digital', deliveryTime: 'Inmediato' }
                }
            }
        }
    });
    console.log('   ✓ Producto Digital creado:', productDigital.name);

    // 7.2 Gafas Físicas con Variantes
    const existingGafas = await prisma.product.findFirst({ where: { slug: 'gafas-urban-style' } });
    const productGafas = existingGafas || await prisma.product.create({
        data: {
            tenantId: 'default',
            name: 'Gafas Urban Style',
            slug: 'gafas-urban-style',
            description: 'Diseño moderno con protección UV400 y marco ligero de policarbonato. Perfectas para uso diario y actividades al aire libre.',
            productType: 'PHYSICAL',
            basePrice: 89.00,
            images: [
                'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800'
            ],
            published: true,
            specs: { material: 'Policarbonato', uv: 'UV400', weight: '25g', warranty: '1 Año' },
            variants: {
                createMany: {
                    data: [
                        { tenantId: 'default', sku: 'GAFA-BLK', name: 'Negro Matte', price: 89.00, stock: 10, attributes: { color: 'Black' } },
                        { tenantId: 'default', sku: 'GAFA-TRT', name: 'Tortoise', price: 95.00, stock: 5, attributes: { color: 'Tortoise' } }
                    ]
                }
            }
        }
    });
    console.log('   ✓ Gafas creadas:', productGafas.name);

    // 7.3 Suplementos con Sabores (Más variantes)
    const existingSuplemento = await prisma.product.findFirst({ where: { slug: 'proteina-premium-isolate' } });
    const productSuplemento = existingSuplemento || await prisma.product.create({
        data: {
            tenantId: 'default',
            name: 'Proteína Premium Isolate',
            slug: 'proteina-premium-isolate',
            description: 'Proteína aislada de suero de alta calidad con 25g de proteína por servida. Sin azúcares añadidos y baja en carbohidratos.',
            productType: 'PHYSICAL',
            basePrice: 45.00,
            images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=800'],
            published: true,
            specs: { servings: '30 porciones', proteinPerServing: '25g', flavor: 'Multiple', weight: '1kg' },
            variants: {
                createMany: {
                    data: [
                        { tenantId: 'default', sku: 'PROT-CHOCO', name: 'Sabor Chocolate', price: 45.00, stock: 15, attributes: { flavor: 'Chocolate' } },
                        { tenantId: 'default', sku: 'PROT-VAIN', name: 'Sabor Vainilla', price: 45.00, stock: 12, attributes: { flavor: 'Vainilla' } },
                        { tenantId: 'default', sku: 'PROT-FRES', name: 'Sabor Fresa', price: 47.00, stock: 8, attributes: { flavor: 'Fresa' } }
                    ]
                }
            }
        }
    });
    console.log('   ✓ Suplemento creado:', productSuplemento.name);

    // ============ 8. PRODUCTOS DE RESTAURANTE ============
    console.log('\n🍽️  Creando productos de restaurante...');

    const restaurantProducts = [
        // --- ENTRADAS ---
        {
            name: 'Tequeños Artesanales',
            slug: 'tequenos-artesanales',
            description: 'Crujientes tequeños rellenos de queso blanco, servidos con salsa de ajo y guasacaca.',
            basePrice: 12.00,
            images: ['https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&q=80&w=800'],
            specs: { category: 'Entradas', prepTime: '8 min' },
            variants: [
                { sku: 'TEQ-6', name: '6 unidades', price: 12.00, isDefault: true },
                { sku: 'TEQ-12', name: '12 unidades', price: 20.00, isDefault: false },
            ],
            modifiers: [
                {
                    groupName: 'Salsa adicional', minSelect: 0, maxSelect: 2,
                    items: [
                        { name: 'Guasacaca extra', price: 2.00 },
                        { name: 'Salsa de ajo', price: 1.50 },
                        { name: 'Salsa BBQ', price: 2.00 },
                    ]
                }
            ]
        },
        {
            name: 'Nachos Supremos',
            slug: 'nachos-supremos',
            description: 'Nachos con queso cheddar fundido, jalapeños, guacamole, crema ácida y pico de gallo.',
            basePrice: 15.00,
            images: ['https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=800'],
            specs: { category: 'Entradas', prepTime: '10 min' },
            variants: [
                { sku: 'NACHOS-IND', name: 'Individual', price: 15.00, isDefault: true },
                { sku: 'NACHOS-COMP', name: 'Para compartir', price: 25.00, isDefault: false },
            ],
            modifiers: [
                {
                    groupName: 'Proteína extra', minSelect: 0, maxSelect: 1,
                    items: [
                        { name: 'Pollo desmenuzado', price: 5.00 },
                        { name: 'Carne molida', price: 6.00 },
                        { name: 'Chorizo', price: 5.50 },
                    ]
                }
            ]
        },
        // --- PLATOS FUERTES ---
        {
            name: 'Hamburguesa Clásica',
            slug: 'hamburguesa-clasica',
            description: 'Carne de res 200g a la parrilla, lechuga, tomate, cebolla caramelizada, queso cheddar y salsa especial en pan brioche.',
            basePrice: 18.00,
            images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800'],
            specs: { category: 'Platos Fuertes', prepTime: '15 min' },
            variants: [
                { sku: 'BURG-SIMPLE', name: 'Simple', price: 18.00, isDefault: true },
                { sku: 'BURG-DOBLE', name: 'Doble carne', price: 25.00, isDefault: false },
            ],
            modifiers: [
                {
                    groupName: 'Punto de cocción', minSelect: 1, maxSelect: 1,
                    items: [
                        { name: 'Término medio', price: 0 },
                        { name: 'Tres cuartos', price: 0 },
                        { name: 'Bien cocida', price: 0 },
                    ]
                },
                {
                    groupName: 'Extras', minSelect: 0, maxSelect: 3,
                    items: [
                        { name: 'Tocineta', price: 3.00 },
                        { name: 'Huevo frito', price: 2.00 },
                        { name: 'Queso extra', price: 2.50 },
                        { name: 'Aguacate', price: 3.00 },
                    ]
                },
                {
                    groupName: 'Acompañamiento', minSelect: 1, maxSelect: 1,
                    items: [
                        { name: 'Papas fritas', price: 0 },
                        { name: 'Aros de cebolla', price: 2.00 },
                        { name: 'Ensalada verde', price: 0 },
                    ]
                }
            ]
        },
        {
            name: 'Lomo Saltado',
            slug: 'lomo-saltado',
            description: 'Tiras de lomo fino salteadas con tomate, cebolla y ají amarillo, servido con arroz y papas fritas.',
            basePrice: 28.00,
            images: ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800'],
            specs: { category: 'Platos Fuertes', prepTime: '20 min' },
            variants: [
                { sku: 'LOMO-REG', name: 'Porción regular', price: 28.00, isDefault: true },
                { sku: 'LOMO-XL', name: 'Porción grande', price: 35.00, isDefault: false },
            ],
            modifiers: [
                {
                    groupName: 'Nivel de picante', minSelect: 0, maxSelect: 1,
                    items: [
                        { name: 'Sin picante', price: 0 },
                        { name: 'Picante medio', price: 0 },
                        { name: 'Bien picante', price: 0 },
                    ]
                }
            ]
        },
        {
            name: 'Pollo a la Parrilla',
            slug: 'pollo-parrilla',
            description: 'Pechuga de pollo marinada a las hierbas, a la parrilla, servida con vegetales grillados y puré de papas.',
            basePrice: 22.00,
            images: ['https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&q=80&w=800'],
            specs: { category: 'Platos Fuertes', prepTime: '18 min' },
            variants: [
                { sku: 'POLLO-PECH', name: 'Pechuga', price: 22.00, isDefault: true },
                { sku: 'POLLO-MUSLO', name: 'Muslo y contramuslo', price: 20.00, isDefault: false },
            ],
            modifiers: [
                {
                    groupName: 'Acompañamiento', minSelect: 1, maxSelect: 2,
                    items: [
                        { name: 'Puré de papas', price: 0 },
                        { name: 'Arroz blanco', price: 0 },
                        { name: 'Ensalada César', price: 3.00 },
                        { name: 'Vegetales grillados', price: 2.00 },
                    ]
                }
            ]
        },
        {
            name: 'Pasta Alfredo',
            slug: 'pasta-alfredo',
            description: 'Fettuccine en cremosa salsa Alfredo con parmesano. Opción de agregar proteína.',
            basePrice: 20.00,
            images: ['https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&q=80&w=800'],
            specs: { category: 'Platos Fuertes', prepTime: '15 min' },
            variants: [
                { sku: 'PASTA-ALF', name: 'Solo pasta', price: 20.00, isDefault: true },
                { sku: 'PASTA-ALF-POLLO', name: 'Con pollo', price: 26.00, isDefault: false },
                { sku: 'PASTA-ALF-CAMARON', name: 'Con camarones', price: 30.00, isDefault: false },
            ],
            modifiers: [
                {
                    groupName: 'Extras', minSelect: 0, maxSelect: 2,
                    items: [
                        { name: 'Parmesano extra', price: 2.00 },
                        { name: 'Pan de ajo (3 pcs)', price: 4.00 },
                        { name: 'Champiñones salteados', price: 3.50 },
                    ]
                }
            ]
        },
        {
            name: 'Ensalada Mediterránea',
            slug: 'ensalada-mediterranea',
            description: 'Mix de lechugas, tomate cherry, pepino, aceitunas kalamata, queso feta y vinagreta de limón.',
            basePrice: 16.00,
            images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800'],
            specs: { category: 'Ensaladas', prepTime: '8 min' },
            variants: [
                { sku: 'ENSAL-MED-REG', name: 'Regular', price: 16.00, isDefault: true },
                { sku: 'ENSAL-MED-GRD', name: 'Grande', price: 22.00, isDefault: false },
            ],
            modifiers: [
                {
                    groupName: 'Proteína', minSelect: 0, maxSelect: 1,
                    items: [
                        { name: 'Pollo grillado', price: 5.00 },
                        { name: 'Salmón', price: 8.00 },
                        { name: 'Camarones', price: 7.00 },
                    ]
                },
                {
                    groupName: 'Aderezo', minSelect: 1, maxSelect: 1,
                    items: [
                        { name: 'Vinagreta de limón', price: 0 },
                        { name: 'Ranch', price: 0 },
                        { name: 'Balsámico', price: 0 },
                    ]
                }
            ]
        },
        // --- POSTRES ---
        {
            name: 'Brownie con Helado',
            slug: 'brownie-helado',
            description: 'Brownie tibio de chocolate belga, servido con helado de vainilla y salsa de chocolate.',
            basePrice: 14.00,
            images: ['https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&q=80&w=800'],
            specs: { category: 'Postres', prepTime: '5 min' },
            variants: [
                { sku: 'BROWN-IND', name: 'Individual', price: 14.00, isDefault: true },
                { sku: 'BROWN-COMP', name: 'Para compartir (doble)', price: 22.00, isDefault: false },
            ],
            modifiers: [
                {
                    groupName: 'Sabor del helado', minSelect: 1, maxSelect: 1,
                    items: [
                        { name: 'Vainilla', price: 0 },
                        { name: 'Chocolate', price: 0 },
                        { name: 'Fresa', price: 0 },
                    ]
                },
                {
                    groupName: 'Toppings', minSelect: 0, maxSelect: 2,
                    items: [
                        { name: 'Whipped cream', price: 1.50 },
                        { name: 'Nueces', price: 2.00 },
                        { name: 'Salsa de caramelo', price: 1.50 },
                    ]
                }
            ]
        },
        // --- BEBIDAS ---
        {
            name: 'Limonada Natural',
            slug: 'limonada-natural',
            description: 'Limonada fresca preparada al momento con limones naturales.',
            basePrice: 8.00,
            images: ['https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&q=80&w=800'],
            specs: { category: 'Bebidas', prepTime: '3 min' },
            variants: [
                { sku: 'LIM-REG', name: 'Regular (350ml)', price: 8.00, isDefault: true },
                { sku: 'LIM-GRD', name: 'Grande (500ml)', price: 11.00, isDefault: false },
                { sku: 'LIM-JARRA', name: 'Jarra (1L)', price: 18.00, isDefault: false },
            ],
            modifiers: [
                {
                    groupName: 'Estilo', minSelect: 1, maxSelect: 1,
                    items: [
                        { name: 'Natural', price: 0 },
                        { name: 'Con hierbabuena', price: 1.00 },
                        { name: 'Frozen', price: 2.00 },
                    ]
                }
            ]
        },
        {
            name: 'Cerveza Artesanal',
            slug: 'cerveza-artesanal',
            description: 'Selección de cervezas artesanales locales.',
            basePrice: 10.00,
            images: ['https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=800'],
            specs: { category: 'Bebidas', prepTime: '1 min' },
            variants: [
                { sku: 'CERV-IPA', name: 'IPA', price: 10.00, isDefault: true },
                { sku: 'CERV-STOUT', name: 'Stout', price: 12.00, isDefault: false },
                { sku: 'CERV-LAGER', name: 'Lager', price: 9.00, isDefault: false },
                { sku: 'CERV-WHEAT', name: 'Wheat', price: 11.00, isDefault: false },
            ],
            modifiers: []
        },
    ];

    let restaurantCount = 0;
    for (const prod of restaurantProducts) {
        const existing = await prisma.product.findFirst({ where: { slug: prod.slug } });
        if (existing) {
            console.log(`   ⏭️  Ya existe: ${prod.name}`);
            restaurantCount++;
            continue;
        }

        const created = await prisma.product.create({
            data: {
                tenantId: 'default',
                name: prod.name,
                slug: prod.slug,
                description: prod.description,
                productType: 'RESTAURANT',
                basePrice: prod.basePrice,
                images: prod.images,
                published: true,
                isAvailable: true,
                specs: prod.specs,
                variants: {
                    createMany: {
                        data: prod.variants.map(v => ({
                            tenantId: 'default',
                            sku: v.sku,
                            name: v.name,
                            price: v.price,
                            stock: -1, // Restaurante: stock ilimitado
                            isDefault: v.isDefault,
                        })),
                    },
                },
            },
        });

        // Crear modifier groups para este producto
        for (const mod of prod.modifiers) {
            await prisma.modifierGroup.create({
                data: {
                    tenantId: 'default',
                    name: mod.groupName,
                    minSelect: mod.minSelect,
                    maxSelect: mod.maxSelect,
                    productId: created.id,
                    modifiers: {
                        createMany: {
                            data: mod.items.map(item => ({
                                tenantId: 'default',
                                name: item.name,
                                priceAdjustment: item.price,
                            })),
                        },
                    },
                },
            });
        }

        restaurantCount++;
        console.log(`   ✅ ${prod.name} (${prod.variants.length} variantes, ${prod.modifiers.length} grupos de modificadores)`);
    }

    // ============ 9. MESAS DE RESTAURANTE ============
    console.log('\n🪑 Creando mesas...');
    const tables = [
        { label: 'Mesa 1', capacity: 4 },
        { label: 'Mesa 2', capacity: 4 },
        { label: 'Mesa 3', capacity: 6 },
        { label: 'Mesa 4', capacity: 2 },
        { label: 'Mesa 5', capacity: 8 },
        { label: 'Barra 1', capacity: 2 },
        { label: 'Barra 2', capacity: 2 },
        { label: 'Terraza 1', capacity: 4 },
    ];
    let tablesCreated = 0;
    for (const table of tables) {
        const exists = await prisma.table.findFirst({ where: { label: table.label } });
        if (!exists) {
            await prisma.table.create({ data: { tenantId: 'default', ...table } });
            tablesCreated++;
        }
    }
    console.log(`   ✅ ${tablesCreated} mesas creadas (${tables.length - tablesCreated} ya existían)`);

    console.log('');
    console.log('✅ ¡Seed completado con éxito!');
    console.log('');
    console.log('📋 Resumen:');
    console.log('   - Usuario Admin: admin@mauromera.com (Password: Admin123!)');
    console.log('   - Usuario Alumno: alumno@mauromera.com (Password: Admin123!)');
    console.log('   - Empleados: mesero@ / cocina@ / caja@mauromera.com (Admin123!)');
    console.log('   - 1 Tema con 1 Curso y 3 Lecciones');
    console.log('   - 2 Blog Posts');
    console.log('   - 3 Productos E-commerce (1 Digital, 2 físicos con variantes)');
    console.log(`   - ${restaurantCount} Productos Restaurante con variantes y modificadores`);
    console.log(`   - ${tables.length} Mesas de restaurante`);
}

main()
    .catch((e) => {
        console.error('❌ Error en el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

