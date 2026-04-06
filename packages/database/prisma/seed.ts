import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 🛡️ CANDADO DE SEGURIDAD
    if (process.env.NODE_ENV === 'production') {
        console.log('🚫 ESTÁS EN PRODUCCIÓN. Seed cancelado por seguridad.');
        return;
    }

    console.log('🌱 Iniciando siembra de datos centralizada en LOCAL...');

    const adminPassword = await bcrypt.hash('Admin123!', 10);

    // 1. DEFINIR TENANTS
    const tenantsConfig = [
        {
            id: 'mauro',
            name: 'Mauro Mera',
            slug: 'mauro',
            dbName: 'web-projects',
            features: ["shop", "blog", "lms", "restaurant"],
            design: { colors: { primary: "#000000" } }
        },
        {
            id: 'default',
            name: 'Template Admin',
            slug: 'default',
            dbName: 'web-projects',
            features: ["shop", "blog", "lms"],
            design: { colors: { primary: "#4f46e5" } }
        },
        {
            id: 'cocinasiete',
            name: 'Cocina Siete',
            slug: 'cocinasiete',
            dbName: 'web-projects',
            features: ["shop", "blog", "lms", "restaurant"],
            design: { colors: { primary: "#01c176" } }
        },
        {
            id: 'deborahmoscoso',
            name: 'Deborah Moscoso',
            slug: 'deborahmoscoso',
            dbName: 'web-projects',
            features: ["shop", "blog", "lms"],
            design: { colors: { primary: "#e88d74" } } // Approximate branding color based on memory or generic
        }
    ];

    console.log('\n🏢 Creando o actualizando Tenants...');
    const createdTenants: Record<string, any> = {};

    for (const t of tenantsConfig) {
        const tenant = await prisma.tenant.upsert({
            where: { slug: t.slug },
            update: {
                features: t.features,
                design: t.design,
                name: t.name,
                dbName: t.dbName
            },
            create: t
        });
        createdTenants[tenant.slug] = tenant;

        // Crear Branch "Sede Principal" por defecto
        const branch = await prisma.branch.upsert({
            where: { tenantId_slug: { tenantId: tenant.id, slug: 'sede-principal' } },
            update: {},
            create: {
                tenantId: tenant.id,
                name: 'Sede Principal',
                slug: 'sede-principal',
                isDefault: true,
            }
        });

        // Crear TenantSettings (config global)
        await prisma.tenantSettings.upsert({
            where: { tenantId: tenant.id },
            update: {},
            create: {
                tenantId: tenant.id,
                storeName: tenant.name,
                storeEmail: `admin@${t.slug}.com`,
            }
        });

        // Crear BranchSettings (config operativa)
        await prisma.branchSettings.upsert({
            where: { branchId: branch.id },
            update: {},
            create: {
                tenantId: tenant.id,
                branchId: branch.id,
                activePaymentProvider: 'NONE',
            }
        });

        console.log(`   ✓ Tenant asegurado: ${tenant.name} (${tenant.slug}) + Sede Principal`);
    }

    // 2. CREAR USUARIOS (ADMIN y USER) PARA CADA TENANT
    console.log('\n👥 Creando usuarios por Tenant...');
    for (const slug of Object.keys(createdTenants)) {
        const tenant = createdTenants[slug];
        const adminEmail = `admin@${slug}.com`;
        const userEmail = `alumno@${slug}.com`;

        // Admin
        await prisma.user.upsert({
            where: { tenantId_email: { tenantId: tenant.id, email: adminEmail } },
            update: { role: 'ADMIN', password: adminPassword },
            create: {
                tenantId: tenant.id,
                email: adminEmail,
                name: `Admin ${tenant.name}`,
                password: adminPassword,
                role: 'ADMIN',
                emailVerified: true,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin${slug}`
            }
        });

        // User
        await prisma.user.upsert({
            where: { tenantId_email: { tenantId: tenant.id, email: userEmail } },
            update: { password: adminPassword },
            create: {
                tenantId: tenant.id,
                email: userEmail,
                name: `Alumno ${tenant.name}`,
                password: adminPassword,
                role: 'USER',
                emailVerified: true,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${slug}`
            }
        });
        console.log(`   ✓ Usuarios creados para ${tenant.name} -> admin: ${adminEmail} | user: ${userEmail}`);
    }

    // Usaremos el tenant 'mauro' por defecto para inyectar datos de prueba (Cursos, Posts, Productos, Órdenes)
    const seedTenant = createdTenants['mauro'];

    console.log('\n📚 Generando contenido de LMS de prueba para Mauro Mera...');
    const theme = await prisma.theme.upsert({
        where: { tenantId_slug: { tenantId: seedTenant.id, slug: 'liderazgo-consciente-test' } },
        update: {},
        create: {
            tenantId: seedTenant.id,
            title: 'Liderazgo Consciente',
            slug: 'liderazgo-consciente-test',
            description: 'Un programa profundo para transformar tu manera de dirigir equipos y gestionar el talento humano.',
            coverImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
            published: true,
            order: 1
        }
    });

    const course = await prisma.course.upsert({
        where: { tenantId_slug: { tenantId: seedTenant.id, slug: 'fundamentos-del-liderazgo-test' } },
        update: {},
        create: {
            tenantId: seedTenant.id,
            themeId: theme.id,
            title: 'Fundamentos del Liderazgo',
            slug: 'fundamentos-del-liderazgo-test',
            description: 'Aprende las bases del liderazgo efectivo.',
            coverImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80',
            published: true,
            isFree: true,
            order: 1
        }
    });

    const lessons = [
        { title: 'Bienvenida al Curso', slug: 'bienvenida-test', content: 'Contenido de bienvenida...', duration: 300, order: 1, published: true },
        { title: 'La Psicología del Líder', slug: 'psicologia-lider-test', content: 'Contenido de psicología...', duration: 600, order: 2, published: true }
    ];

    for (const lesson of lessons) {
        await prisma.lesson.upsert({
            where: { courseId_slug: { courseId: course.id, slug: lesson.slug } },
            update: {},
            create: { courseId: course.id, ...lesson }
        });
    }

    console.log('\n📰 Creando Blog posts de prueba...');
    const posts = [
        { title: '5 Claves para la Salud Mental', slug: 'salud-mental-trabajo-test', excerpt: 'Manten tu bienestar.', content: 'Contenido...', published: true, readingTime: 5 },
        { title: 'El Poder de la Mentalidad', slug: 'mentalidad-crecimiento-test', excerpt: 'Cómo desarrollar mentalidad.', content: 'Contenido...', published: true, readingTime: 7 }
    ];

    for (const post of posts) {
        await prisma.post.upsert({
            where: { tenantId_slug: { tenantId: seedTenant.id, slug: post.slug } },
            update: {},
            create: { tenantId: seedTenant.id, ...post }
        });
    }

    console.log('\n🛒 Creando productos de e-commerce de prueba...');
    const productDigital = await prisma.product.upsert({
        where: { tenantId_slug: { tenantId: seedTenant.id, slug: 'guia-liderazgo' } },
        update: {},
        create: {
            tenantId: seedTenant.id,
            name: 'Guía Completa de Liderazgo',
            slug: 'guia-liderazgo',
            description: 'Guía práctica digital.',
            productType: 'DIGITAL',
            basePrice: 29.99,
            published: true,
            variants: {
                create: {
                    tenantId: seedTenant.id,
                    sku: 'LID-DIGITAL-001',
                    name: 'Descarga Digital',
                    price: 29.99,
                    stock: -1,
                    isDefault: true
                }
            }
        }
    });

    console.log('\n✅ ¡Seed consolidado y completado con éxito!');
    console.log('Todos los tenants fueron asegurados con cuentas Admin (Password: Admin123!)');
}

main()
    .catch((e) => {
        console.error('❌ Error en el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
