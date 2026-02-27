import { Fill } from "@alvarosky/ui";
import { getAcademyCourses } from "@/lib/data";
import { CoursePageClient } from "./CoursePageClient";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
    const courses = await getAcademyCourses();

    const stats = [
        { label: "Estudiantes", value: "500+" },
        { label: "Programas", value: courses.length.toString() },
        { label: "Comunidad", value: "24/7" },
        { label: "Resultados", value: "100%" },
    ];

    return (
        <Fill>
            <CoursePageClient courses={courses} stats={stats} />
        </Fill>
    );
}
