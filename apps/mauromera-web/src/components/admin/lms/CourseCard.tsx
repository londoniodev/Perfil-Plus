"use client";

import { useRouter } from "next/navigation";
import { CourseCard as SharedCourseCard, LmsCourse } from "@alvarosky/ui";

interface CourseCardProps {
    course: LmsCourse;
    themeId: string;
    onDelete: (id: string) => void;
}

export default function CourseCard({ course, themeId, onDelete }: CourseCardProps) {
    const router = useRouter();

    return (
        <SharedCourseCard
            course={course}
            onEdit={(id) => router.push(`/admin/cursos/temas/${themeId}/cursos/${id}`)}
            onDelete={onDelete}
        />
    );
}
