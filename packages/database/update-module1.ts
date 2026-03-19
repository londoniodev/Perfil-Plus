import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const courseId = 'cmmu0apc70001t8hccc4jmuq5'; // Curso Diabetes
    const badLessonId = 'cmmv3n16y000bfp57de7ki83u'; // Lección sfvdfvdfvdfv

    console.log('🌱 Actualizando Módulo 1: Diabetes...');

    // 1. Actualizar descripción del curso
    await prisma.course.update({
        where: { id: courseId },
        data: {
            description: 'Entiende la Diabetes Tipo 2, su relación directa con el exceso de grasa corporal y cómo el estilo de vida es tu mejor herramienta de prevención y control.',
            published: true
        }
    });
    console.log('✓ Descripción del curso actualizada.');

    // 2. Borrar lección de prueba
    try {
        await prisma.lesson.delete({
            where: { id: badLessonId }
        });
        console.log('✓ Lección de prueba borrada.');
    } catch (e) {
        console.log('ℹ️ La lección de prueba ya no existe o hubo un problema al borrarla.');
    }

    // 3. Crear nuevas lecciones
    console.log('📚 Insertando lecciones reales...');
    
    // Para asegurar que no haya conflicto de slugs, borramos todas las lecciones del curso antes (limpieza total)
    // Pero como ya borramos la única que había (según la consulta), podemos crear las nuevas.
    
    const lessons = [
        {
            title: '¿Qué es la Diabetes Tipo 2?',
            slug: 'que-es-diabetes-tipo-2',
            content: 'Explicación de cómo el cuerpo deja de responder a la insulina y se eleva la glucosa en sangre. Diferencias con la Tipo 1.',
            videoUrl: 'https://www.youtube.com/watch?v=0X2fK8vU2_Y', // Reutilizando video educativo de TED-Ed o similar
            published: true,
            order: 1
        },
        {
            title: 'El Vínculo Obesidad - Diabetes',
            slug: 'vinculo-obesidad-diabetes',
            content: 'Cómo la grasa visceral produce citoquinas inflamatorias que bloquean los receptores de insulina (Resistencia a la Insulina).',
            videoUrl: 'https://www.youtube.com/watch?v=mDRE_7vArE8',
            published: true,
            order: 2
        },
        {
            title: '¿Se puede Revertir la Diabetes?',
            slug: 'revertir-diabetes-remision',
            content: 'El concepto de "Remisión" mediante la pérdida de grasa ectópica (en hígado y páncreas) y cambios en la alimentación.',
            videoUrl: 'https://www.youtube.com/watch?v=X90GvS0S7OE',
            published: true,
            order: 3
        }
    ];

    for (const lesson of lessons) {
        await prisma.lesson.create({
            data: {
                courseId,
                ...lesson
            }
        });
        console.log(`   ✓ Lección creada: ${lesson.title}`);
    }

    console.log('✅ Módulo 1 actualizado con éxito.');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
