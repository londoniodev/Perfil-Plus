import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tenantId = 'cm7mman6x000208jsf3h9h2k1'; // soydeborasoysaludable
    const themeId = 'cmmtzrwh20001sgwk5rlcklyl'; // Obesidad

    console.log('🌱 Iniciando inserción de cursos sobre Obesidad...');

    // Curso 1: Bases Biológicas
    const course1 = await prisma.course.create({
        data: {
            tenantId,
            themeId,
            title: 'Bases Biológicas y Diagnóstico',
            slug: 'bases-biologicas-diagnostico',
            description: 'Aprende qué es realmente la obesidad, más allá de la báscula.',
            isFree: true,
            published: true,
            order: 2, // Diabetes es 1
            lessons: {
                create: [
                    {
                        title: '¿Qué es la Obesidad? (Más allá del IMC)',
                        slug: 'que-es-la-obesidad',
                        content: 'Explicación de la obesidad como enfermedad crónica. Limitaciones del IMC y composición corporal.',
                        videoUrl: 'https://www.youtube.com/watch?v=0X2fK8vU2_Y',
                        published: true,
                        order: 1
                    },
                    {
                        title: 'El Tejido Adiposo como Órgano Endocrino',
                        slug: 'tejido-adiposo-endocrino',
                        content: 'Cómo la grasa produce hormonas (leptina) y regula el metabolismo, y qué pasa cuando se inflama.',
                        videoUrl: 'https://www.youtube.com/watch?v=mDRE_7vArE8',
                        published: true,
                        order: 2
                    }
                ]
            }
        }
    });
    console.log(`✓ Curso creado: ${course1.title}`);

    // Curso 2: Nutrición
    const course2 = await prisma.course.create({
        data: {
            tenantId,
            themeId,
            title: 'Nutrición y Salud Metabólica',
            slug: 'nutricion-salud-metabolica',
            description: 'Entiende la relación entre lo que comes, tus hormonas y la acumulación de grasa.',
            isFree: true,
            published: true,
            order: 3,
            lessons: {
                create: [
                    {
                        title: 'Resistencia a la Insulina',
                        slug: 'resistencia-insulina',
                        content: 'Mecanismo de la insulina, cómo se genera la resistencia y su relación con la ganancia de peso.',
                        videoUrl: 'https://www.youtube.com/watch?v=0X2fK8vU2_Y', // Reusing placeholder/real video
                        published: true,
                        order: 1
                    },
                    {
                        title: 'Flexibilidad Metabólica',
                        slug: 'flexibilidad-metabolica',
                        content: 'Concepto de cambiar de sustrato energético (carbohidratos a grasas) y estrategias para mejorarla.',
                        videoUrl: 'https://www.youtube.com/watch?v=mDRE_7vArE8',
                        published: true,
                        order: 2
                    }
                ]
            }
        }
    });
    console.log(`✓ Curso creado: ${course2.title}`);

    // Curso 3: Hábitos
    const course3 = await prisma.course.create({
        data: {
            tenantId,
            themeId,
            title: 'Hábitos y Estrategias Efectivas',
            slug: 'habitos-estrategias-efectivas',
            description: 'Herramientas prácticas para un cambio sostenible.',
            isFree: true,
            published: true,
            order: 4,
            lessons: {
                create: [
                    {
                        title: 'El Mito de Comer Menos y Moverse Más',
                        slug: 'mito-comer-menos',
                        content: 'Por qué el conteo de calorías simple falla y la importancia de la densidad nutricional.',
                        videoUrl: 'https://www.youtube.com/watch?v=0X2fK8vU2_Y',
                        published: true,
                        order: 1
                    },
                    {
                        title: 'Entrenamiento de Fuerza: Tu mejor medicina',
                        slug: 'entrenamiento-fuerza',
                        content: 'El músculo como tejido protector e impacto metabólico del ejercicio de fuerza.',
                        videoUrl: 'https://www.youtube.com/watch?v=mDRE_7vArE8',
                        published: true,
                        order: 2
                    }
                ]
            }
        }
    });
    console.log(`✓ Curso creado: ${course3.title}`);

    console.log('✅ Inserción completada con éxito.');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
