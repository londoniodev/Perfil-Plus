"use client";

import { useRouter } from "next/navigation";
import { LessonItem as SharedLessonItem, LmsLesson } from "@alvarosky/ui";

interface LessonItemProps {
    lesson: LmsLesson;
    courseId: string;
    themeId: string;
    onDelete: (id: string) => void;
}

export default function LessonItem({ lesson, courseId, themeId, onDelete }: LessonItemProps) {
    const router = useRouter();

    return (
        <SharedLessonItem
            lesson={lesson}
            onEdit={(id) => router.push(`/admin/cursos/temas/${themeId}/cursos/${courseId}/lecciones/${id}`)}
            onDelete={onDelete}
        />
    );
}
