import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateThemeDto, UpdateThemeDto,
    CreateCourseDto, UpdateCourseDto,
    CreateLessonDto, UpdateLessonDto,
    CreateLessonAttachmentDto,
    UpdateProgressDto,
} from './dto';

@Injectable()
export class LmsService {
    constructor(private prisma: PrismaService) { }

    // ==================== THEMES ====================

    async createTheme(dto: CreateThemeDto) {
        const slug = this.generateSlug(dto.title);
        return this.prisma.client.theme.create({
            data: { ...dto, slug },
            include: { _count: { select: { courses: true } } },
        });
    }

    async updateTheme(id: string, dto: UpdateThemeDto) {
        const theme = await this.prisma.client.theme.findUnique({ where: { id } });
        if (!theme) throw new NotFoundException('Tema no encontrado');

        const data: any = { ...dto };
        if (dto.title) data.slug = this.generateSlug(dto.title);

        return this.prisma.client.theme.update({
            where: { id },
            data,
            include: { _count: { select: { courses: true } } },
        });
    }

    async deleteTheme(id: string) {
        const theme = await this.prisma.client.theme.findUnique({ where: { id } });
        if (!theme) throw new NotFoundException('Tema no encontrado');

        await this.prisma.client.theme.delete({ where: { id } });
        return { message: 'Tema eliminado correctamente' };
    }

    async findAllThemes(includeUnpublished = false) {
        const where = includeUnpublished ? {} : { published: true };
        return this.prisma.client.theme.findMany({
            where,
            orderBy: { order: 'asc' },
            include: {
                _count: { select: { courses: true } },
                evaluation: { select: { id: true } },
            },
        });
    }

    async findThemeBySlug(slug: string, hasSubscription = false) {
        const theme = await this.prisma.client.theme.findUnique({
            where: { slug },
            include: {
                courses: {
                    where: { published: true },
                    orderBy: { order: 'asc' },
                    include: {
                        _count: { select: { lessons: true } },
                    },
                },
                evaluation: { select: { id: true, title: true } },
            },
        });

        if (!theme || !theme.published) {
            throw new NotFoundException('Tema no encontrado');
        }

        // Filtrar cursos premium si no tiene suscripción
        if (!hasSubscription) {
            theme.courses = theme.courses.filter((c) => c.isFree);
        }

        return theme;
    }

    async findThemeById(id: string) {
        const theme = await this.prisma.client.theme.findUnique({
            where: { id },
            include: {
                courses: {
                    orderBy: { order: 'asc' },
                    include: { _count: { select: { lessons: true } } },
                },
                evaluation: true,
            },
        });
        if (!theme) throw new NotFoundException('Tema no encontrado');
        return theme;
    }

    // ==================== COURSES ====================

    async createCourse(dto: CreateCourseDto) {
        const slug = this.generateSlug(dto.title);
        return this.prisma.client.course.create({
            data: { ...dto, slug },
            include: { theme: { select: { id: true, title: true } } },
        });
    }

    async updateCourse(id: string, dto: UpdateCourseDto) {
        const course = await this.prisma.client.course.findUnique({ where: { id } });
        if (!course) throw new NotFoundException('Curso no encontrado');

        const data: any = { ...dto };
        if (dto.title) data.slug = this.generateSlug(dto.title);

        return this.prisma.client.course.update({
            where: { id },
            data,
            include: { theme: { select: { id: true, title: true } } },
        });
    }

    async deleteCourse(id: string) {
        const course = await this.prisma.client.course.findUnique({ where: { id } });
        if (!course) throw new NotFoundException('Curso no encontrado');

        await this.prisma.client.course.delete({ where: { id } });
        return { message: 'Curso eliminado correctamente' };
    }

    async findCourseBySlug(slug: string, userId?: string) {
        const course = await this.prisma.client.course.findUnique({
            where: { slug },
            include: {
                theme: { select: { id: true, title: true, slug: true } },
                lessons: {
                    where: { published: true },
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        duration: true,
                        order: true,
                    },
                },
            },
        });

        if (!course || !course.published) {
            throw new NotFoundException('Curso no encontrado');
        }

        // Si hay usuario, obtener su progreso
        if (userId) {
            const progress = await this.prisma.client.userProgress.findMany({
                where: {
                    userId,
                    lesson: { courseId: course.id },
                },
                select: { lessonId: true, completed: true },
            });

            const progressMap = new Map(progress.map((p) => [p.lessonId, p.completed]));

            return {
                ...course,
                lessons: course.lessons.map((l) => ({
                    ...l,
                    completed: progressMap.get(l.id) || false,
                })),
                progress: {
                    completed: progress.filter((p) => p.completed).length,
                    total: course.lessons.length,
                },
            };
        }

        return course;
    }

    async findCourseById(id: string) {
        const course = await this.prisma.client.course.findUnique({
            where: { id },
            include: {
                theme: { select: { id: true, title: true } },
                lessons: { orderBy: { order: 'asc' } },
            },
        });
        if (!course) throw new NotFoundException('Curso no encontrado');
        return course;
    }

    // ==================== LESSONS ====================

    async createLesson(dto: CreateLessonDto) {
        const slug = this.generateSlug(dto.title);
        return this.prisma.client.lesson.create({
            data: { ...dto, slug },
            include: { course: { select: { id: true, title: true } } },
        });
    }

    async updateLesson(id: string, dto: UpdateLessonDto) {
        const lesson = await this.prisma.client.lesson.findUnique({ where: { id } });
        if (!lesson) throw new NotFoundException('Lección no encontrada');

        const data: any = { ...dto };
        if (dto.title) data.slug = this.generateSlug(dto.title);

        return this.prisma.client.lesson.update({
            where: { id },
            data,
            include: { course: { select: { id: true, title: true } } },
        });
    }

    async deleteLesson(id: string) {
        const lesson = await this.prisma.client.lesson.findUnique({ where: { id } });
        if (!lesson) throw new NotFoundException('Lección no encontrada');

        await this.prisma.client.lesson.delete({ where: { id } });
        return { message: 'Lección eliminada correctamente' };
    }

    async findLessonBySlug(courseSlug: string, lessonSlug: string, userId?: string, hasSubscription = false) {
        // En lugar de buscar el curso primero, buscamos la lección directamente con el curso incluido
        // Esto optimiza la consulta y evita problemas si el lessonSlug es único
        const lesson = await this.prisma.client.lesson.findFirst({
            where: {
                slug: lessonSlug,
                course: { slug: courseSlug },
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        isFree: true,
                        theme: { select: { id: true, title: true, slug: true } },
                    },
                },
                attachments: true, // Incluimos los adjuntos
            },
        });

        if (!lesson) {
            throw new NotFoundException('Lección no encontrada');
        }

        // Verificar acceso
        // Si el curso no es gratuito y el usuario no tiene suscripción activa
        if (!lesson.course.isFree && !hasSubscription) {
            throw new ForbiddenException('Necesitas una suscripción activa para acceder a este contenido');
        }

        // Obtener lecciones anterior/siguiente usando el orden y el ID del curso
        const [prev, next] = await Promise.all([
            this.prisma.client.lesson.findFirst({
                where: { courseId: lesson.course.id, order: { lt: lesson.order }, published: true },
                orderBy: { order: 'desc' },
                select: { slug: true, title: true },
            }),
            this.prisma.client.lesson.findFirst({
                where: { courseId: lesson.course.id, order: { gt: lesson.order }, published: true },
                orderBy: { order: 'asc' },
                select: { slug: true, title: true },
            }),
        ]);

        // Obtener progreso del usuario si existe
        let userProgress: { completed: boolean; watchedTime: number } | null = null;
        if (userId) {
            const progress = await this.prisma.client.userProgress.findUnique({
                where: { userId_lessonId: { userId, lessonId: lesson.id } },
            });
            if (progress) {
                userProgress = { completed: progress.completed, watchedTime: progress.watchedTime };
            }
        }

        return {
            ...lesson,
            navigation: { prev, next },
            userProgress: userProgress || { completed: false, watchedTime: 0 },
        };
    }

    // ============ ATTACHMENTS ============

    async addLessonAttachment(lessonId: string, dto: CreateLessonAttachmentDto) {
        const lesson = await this.prisma.client.lesson.findUnique({
            where: { id: lessonId },
        });

        if (!lesson) {
            throw new NotFoundException('Lección no encontrada');
        }

        return this.prisma.client.lessonAttachment.create({
            data: {
                lessonId,
                ...dto,
            },
        });
    }

    async removeLessonAttachment(attachmentId: string) {
        // Verificar si existe
        const attachment = await this.prisma.client.lessonAttachment.findUnique({
            where: { id: attachmentId },
        });

        if (!attachment) {
            throw new NotFoundException('Adjunto no encontrado');
        }

        return this.prisma.client.lessonAttachment.delete({
            where: { id: attachmentId },
        });
    }

    async findLessonById(id: string) {
        const lesson = await this.prisma.client.lesson.findUnique({
            where: { id },
            include: {
                attachments: true,
            }
        });

        if (!lesson) throw new NotFoundException('Lección no encontrada');
        return lesson;
    }

    // ==================== PROGRESS ====================

    async updateProgress(userId: string, lessonId: string, dto: UpdateProgressDto) {
        const lesson = await this.prisma.client.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) throw new NotFoundException('Lección no encontrada');

        const data: any = {
            ...dto,
            updatedAt: new Date(),
        };

        if (dto.completed) {
            data.completedAt = new Date();
        }

        return this.prisma.client.userProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            create: {
                userId,
                lessonId,
                ...dto,
                completedAt: dto.completed ? new Date() : null,
            },
            update: data,
        });
    }

    async getUserProgress(userId: string) {
        const progress = await this.prisma.client.userProgress.findMany({
            where: { userId },
            include: {
                lesson: {
                    select: {
                        title: true,
                        course: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                theme: { select: { id: true, title: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Agrupar por curso
        const courseProgress = new Map<string, {
            course: any;
            lessons: { completed: number; total: number };
            lastActivity: Date;
        }>();

        for (const p of progress) {
            const courseId = p.lesson.course.id;
            if (!courseProgress.has(courseId)) {
                const totalLessons = await this.prisma.client.lesson.count({
                    where: { courseId, published: true },
                });
                courseProgress.set(courseId, {
                    course: p.lesson.course,
                    lessons: { completed: 0, total: totalLessons },
                    lastActivity: p.updatedAt,
                });
            }
            if (p.completed) {
                courseProgress.get(courseId)!.lessons.completed++;
            }
        }

        return Array.from(courseProgress.values());
    }

    // ==================== HELPERS ====================

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .normalize('NFD') // Normalizar caracteres como tildes
            .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
            .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
            .replace(/\s+/g, '-') // Reemplazar espacios con guiones
            .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
            .replace(/^-|-$/g, '') // Eliminar guiones al inicio o final
            + '-' + Date.now().toString(36).substring(4); // Añadir sufijo único corto
    }
}
