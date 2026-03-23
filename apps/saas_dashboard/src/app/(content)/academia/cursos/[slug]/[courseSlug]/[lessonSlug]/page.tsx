"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { useAuth } from "@/context/AuthContext";
import { sanitizeHtml } from "@/lib/sanitize";
import { useToast } from "@alvarosky/ui";
import { IconClock, IconSuccess, IconCheck, IconPlay, IconLock } from "@alvarosky/ui";
import { PremiumLock } from "@alvarosky/ui";
import { AspectRatio } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@alvarosky/ui";
import { cn } from "@/lib/utils";

interface LessonData {
    id: string;
    title: string;
    content: string;
    videoUrl: string | null;
    duration: number | null;
    slug: string;
    course: {
        id: string;
        title: string;
        slug: string;
        theme: { id: string; title: string; slug: string };
    };
    navigation: {
        prev: { slug: string; title: string } | null;
        next: { slug: string; title: string } | null;
    };
    userProgress: { completed: boolean; watchedTime: number };
}

import { Course as CourseData } from "@/types/lms";

export default function LessonPage({
    params,
}: {
    params: Promise<{ slug: string; courseSlug: string; lessonSlug: string }>;
}) {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const toast = useToast();
    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [course, setCourse] = useState<CourseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completed, setCompleted] = useState(false);
    const [paramsData, setParamsData] = useState<{ slug: string; courseSlug: string; lessonSlug: string } | null>(null);

    useEffect(() => {
        params.then(setParamsData);
    }, [params]);

    useEffect(() => {
        const fetchLessonAndCourse = async () => {
            if (!paramsData) return;
            if (authLoading) return;

            if (!isAuthenticated) {
                setError("needsAuth");
                setLoading(false);
                return;
            }

            try {
                // Fetch Lesson
                const lessonRes = await fetch(
                    `${API_BASE}/lms/courses/${paramsData.courseSlug}/lessons/${paramsData.lessonSlug}`,
                    { headers: {}, credentials: "include" }
                );

                if (lessonRes.status === 403) {
                    setError("premium");
                    setLoading(false);
                    return;
                }

                if (!lessonRes.ok) throw new Error("Lección no encontrada");

                const lessonData = await lessonRes.json();
                setLesson(lessonData);
                setCompleted(lessonData.userProgress?.completed || false);

                // Fetch Course (for sidebar) - only if not loaded or different course
                if (!course || course.id !== lessonData.course.id) {
                    const courseRes = await fetch(
                        `${API_BASE}/lms/courses/${paramsData.courseSlug}`,
                        { headers: {}, credentials: "include" }
                    );
                    if (courseRes.ok) {
                        const courseData = await courseRes.json();
                        setCourse(courseData);
                    }
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("notFound");
            } finally {
                setLoading(false);
            }
        };

        fetchLessonAndCourse();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramsData, authLoading, isAuthenticated]);

    const markAsComplete = async () => {
        if (!lesson) return;

        try {
            await fetch(`${API_BASE}/lms/progress/${lesson.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({ completed: true }),
            });
            setCompleted(true);
            toast.success("Lección completada");

            // Update local course state for sidebar
            if (course && course.lessons) {
                setCourse({
                    ...course,
                    lessons: course.lessons.map(l =>
                        l.id === lesson.id ? { ...l, completed: true } : l
                    )
                });
            }
        } catch (err) {
            toast.error("Error al actualizar el progreso");
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Cargando lección...</div>
            </div>
        );
    }

    if (error === "needsAuth" || !isAuthenticated) {
        return (
            <div className="min-h-screen pt-32 pb-16">
                <div className="container max-w-4xl">
                    <PremiumLock
                        title="Inicia sesión para ver esta lección"
                        description="Necesitas una cuenta para acceder al contenido del curso."
                        actionHref="/admin/login"
                        actionText="Iniciar Sesión"
                    />
                </div>
            </div>
        );
    }

    if (error === "premium") {
        return (
            <div className="min-h-screen pt-32 pb-16">
                <div className="container max-w-4xl">
                    <PremiumLock
                        title="Contenido Premium"
                        description="Necesitas una suscripción activa para acceder a este contenido."
                        actionHref="/suscripcion"
                        actionText="Ver Planes"
                    />
                </div>
            </div>
        );
    }

    if (error === "notFound" || !lesson) {
        return (
            <div className="min-h-screen pt-32 pb-24 text-center">
                <div className="container">
                    <h2 className="text-2xl font-bold mb-4">Lección no encontrada</h2>
                    <Button asChild>
                        <Link href="/academia/cursos">Volver a cursos</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16 bg-background">
            <div className="container max-w-[1600px] px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-8">
                        {/* Breadcrumbs */}
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <Link href="/academia/cursos" className="hover:text-primary transition-colors">Cursos</Link>
                            <span className="opacity-50">/</span>
                            <Link href={`/cursos/${lesson.course.theme.slug}`} className="hover:text-primary transition-colors">{lesson.course.theme.title}</Link>
                            <span className="opacity-50">/</span>
                            <Link href={`/cursos/${lesson.course.theme.slug}/${lesson.course.slug}`} className="hover:text-primary transition-colors">
                                {lesson.course.title}
                            </Link>
                        </div>

                        {/* Title & Meta */}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-serif font-bold mb-3">{lesson.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {lesson.duration && (
                                    <span className="flex items-center gap-1.5">
                                        <IconClock size={16} /> {Math.floor(lesson.duration / 60)} min
                                    </span>
                                )}
                                {completed && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 flex items-center gap-1 text-xs font-semibold">
                                        <IconCheck size={12} strokeWidth={3} /> Completada
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Video Player */}
                        {lesson.videoUrl && (
                            <div className="rounded-xl overflow-hidden bg-black border border-border shadow-lg">
                                <AspectRatio ratio={16 / 9} className="bg-muted">
                                    {getYouTubeEmbedUrl(lesson.videoUrl) ? (
                                        <iframe
                                            src={getYouTubeEmbedUrl(lesson.videoUrl) || ""}
                                            title={lesson.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full border-0"
                                        />
                                    ) : (
                                        <video controls src={lesson.videoUrl} className="w-full h-full object-contain">
                                            Tu navegador no soporta el elemento de video.
                                        </video>
                                    )}
                                </AspectRatio>
                            </div>
                        )}

                        {/* Navigation Buttons (Top) */}
                        <div className="flex justify-between gap-4">
                            {lesson.navigation.prev ? (
                                <Button asChild variant="secondary" className="gap-2">
                                    <Link href={`/cursos/${lesson.course.theme.slug}/${lesson.course.slug}/${lesson.navigation.prev.slug}`}>
                                        ← Anterior
                                    </Link>
                                </Button>
                            ) : <div></div>}

                            {lesson.navigation.next ? (
                                <Button asChild variant="secondary" className="gap-2">
                                    <Link href={`/cursos/${lesson.course.theme.slug}/${lesson.course.slug}/${lesson.navigation.next.slug}`}>
                                        Siguiente →
                                    </Link>
                                </Button>
                            ) : <div></div>}
                        </div>

                        {/* Content */}
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: formatContent(lesson.content) }} />
                        </div>

                        {/* Completion Action */}
                        <div className="flex flex-col gap-6 pt-8 border-t border-border">
                            <div className="flex justify-between items-center bg-card p-6 rounded-xl border border-border">
                                <div>
                                    <h3 className="font-semibold mb-1">¿Terminaste esta lección?</h3>
                                    <p className="text-sm text-muted-foreground">Marca la lección como completada para seguir tu progreso.</p>
                                </div>
                                <Button
                                    onClick={markAsComplete}
                                    disabled={completed}
                                    variant={completed ? "outline" : "default"}
                                    className={completed ? "border-green-500 text-green-600 bg-green-500/5 hover:bg-green-500/10" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                                >
                                    {completed ? (
                                        <>
                                            <IconSuccess size={18} className="mr-2" /> Completada
                                        </>
                                    ) : (
                                        "Marcar como completada"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Curriculum */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-24 space-y-4">
                            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-border bg-muted/30">
                                    <h3 className="font-semibold">Temario del Curso</h3>
                                    {course && (
                                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                            <span>{(course.lessons || []).filter(l => l.completed).length} / {(course.lessons || []).length} completadas</span>
                                            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${((course.lessons || []).filter(l => l.completed).length / Math.max(1, (course.lessons || []).length)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
                                    <Accordion type="single" collapsible defaultValue="all-lessons" className="w-full">
                                        <AccordionItem value="all-lessons" className="border-0">
                                            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-muted/10">
                                                <span className="text-sm font-medium">Módulo General</span>
                                            </AccordionTrigger>
                                            <AccordionContent className="pb-0">
                                                <div className="flex flex-col">
                                                    {(course?.lessons || []).map((item, index) => {
                                                        const isActive = item.slug === lesson.slug;
                                                        return (
                                                            <Link
                                                                key={item.id}
                                                                href={isActive ? "#" : `/cursos/${lesson.course.theme.slug}/${lesson.course.slug}/${item.slug}`}
                                                                className={cn(
                                                                    "flex items-start gap-3 p-3 text-sm border-l-2 transition-colors hover:bg-muted/50",
                                                                    isActive
                                                                        ? "bg-primary/5 border-primary text-primary font-medium"
                                                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "mt-0.5 rounded-full flex items-center justify-center w-5 h-5 shrink-0 text-[10px]",
                                                                    item.completed
                                                                        ? "bg-green-500 text-white"
                                                                        : isActive
                                                                            ? "bg-primary text-white"
                                                                            : "bg-muted text-muted-foreground"
                                                                )}>
                                                                    {item.completed ? <IconCheck size={10} strokeWidth={3} /> : (isActive ? <IconPlay size={8} fill="currentColor" /> : index + 1)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="line-clamp-2 leading-snug">{item.title}</p>
                                                                    <p className="text-xs text-muted-foreground mt-1 opacity-80">
                                                                        {item.duration ? `${Math.floor(item.duration / 60)} min` : "0 min"}
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

function getYouTubeEmbedUrl(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
}

function formatContent(content: string): string {
    if (!content) return "";
    let formatted = content;
    if (!content.includes("<p>") && !content.includes("<div>")) {
        formatted = content
            .split(/\n\n+/)
            .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
            .join("");
    }
    return sanitizeHtml(formatted);
}
