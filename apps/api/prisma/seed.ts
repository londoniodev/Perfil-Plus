import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 🛡️ CANDADO DE SEGURIDAD
    if (process.env.NODE_ENV === 'production') {
        console.log('🚫 ESTÁS EN PRODUCCIÓN. Seed cancelado por seguridad.');
        return;
    }

    console.log('🌱 Iniciando siembra de datos en LOCAL...');

    // 1. Asegurar Usuario Admin (Para pruebas de UI)
    const email = 'admin@mauromera.com';
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    const adminUser = await prisma.user.upsert({
        where: { email },
        update: { role: 'ADMIN' },
        create: {
            email,
            password: hashedPassword,
            name: 'Admin Tester',
            role: 'ADMIN',
            emailVerified: true,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
        }
    });
    console.log('👤 Usuario Admin asegurado:', adminUser.email);

    // 1.5 Crear Usuario Estudiante (Rol USER por defecto)
    const studentEmail = "alumno@mauromera.com";
    const studentUser = await prisma.user.upsert({
        where: { email: studentEmail },
        update: {}, // Si existe, no hace nada
        create: {
            email: studentEmail,
            name: "Alumno Demo",
            password: hashedPassword, // Reutilizamos el hash por simplicidad (Admin123!)
            role: 'USER', // <--- Importante: Rol normal
            emailVerified: true,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
        }
    });
    console.log('🎓 Usuario Estudiante asegurado:', studentUser.email);

    // 2. Crear Tema con Cursos y Lecciones
    const theme = await prisma.theme.upsert({
        where: { slug: 'liderazgo-consciente-test' },
        update: {},
        create: {
            title: 'Liderazgo Consciente',
            slug: 'liderazgo-consciente-test',
            description: 'Un programa profundo para transformar tu manera de dirigir equipos y gestionar el talento humano con consciencia y estrategia.',
            coverImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
            published: true,
            order: 1
        }
    });
    console.log('📚 Tema creado:', theme.title);

    // 3. Crear Curso dentro del Tema
    const course = await prisma.course.upsert({
        where: { slug: 'fundamentos-del-liderazgo-test' },
        update: {},
        create: {
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
        await prisma.lesson.upsert({
            where: {
                courseId_slug: {
                    courseId: course.id,
                    slug: lesson.slug
                }
            },
            update: {},
            create: {
                courseId: course.id,
                ...lesson
            }
        });
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
        const existingPost = await prisma.post.findUnique({ where: { slug: post.slug } });
        if (!existingPost) {
            await prisma.post.create({ data: post });
        }
    }
    console.log('📰 Blog posts creados:', posts.length);

    // 6. Crear un Ebook de prueba
    const ebook = await prisma.ebook.upsert({
        where: { slug: 'guia-liderazgo-test' },
        update: {},
        create: {
            title: 'Guía Completa de Liderazgo Consciente',
            slug: 'guia-liderazgo-test',
            description: 'Una guía práctica con ejercicios y reflexiones para desarrollar tu potencial como líder consciente. Incluye casos de estudio reales y herramientas aplicables.',
            coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
            fileUrl: '/ebooks/guia-liderazgo.pdf',
            previewUrl: '/ebooks/guia-liderazgo-preview.pdf',
            price: 29.99,
            published: true
        }
    });
    console.log('📕 Ebook creado:', ebook.title);

    console.log('');
    console.log('✅ ¡Seed completado con éxito!');
    console.log('');
    console.log('📋 Resumen:');
    console.log('   - Usuario Admin: admin@mauromera.com (Password: Admin123!)');
    console.log('   - Usuario Alumno: alumno@mauromera.com (Password: Admin123!)');
    console.log('   - 1 Tema con 1 Curso y 3 Lecciones');
    console.log('   - 2 Blog Posts');
    console.log('   - 1 Ebook');
}

main()
    .catch((e) => {
        console.error('❌ Error en el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
