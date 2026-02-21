import Image from "next/image";
import { prisma } from "@alvarosky/database";

export async function CursosNuevos() {
    const rawCourses = await prisma.course.findMany({
        where: { published: true },
        include: { theme: true },
        orderBy: { createdAt: 'desc' },
        take: 4
    });

    const newCourses = rawCourses.map(course => ({
        id: course.id,
        title: course.title,
        category: course.theme.title,
        duration: "2h 10m", // Placeholder
        image: course.coverImage || (course.theme.slug === 'servicio' ? "/course-mini-servicio.jpg" : "/course-mini-tecnicas.jpg"),
        categoryColor: course.theme.slug === 'servicio' ? "text-cs-primary" : "text-cs-secondary",
    }));

    return (
        <section className="mb-8">
            <h3 className="px-6 font-display font-bold text-xl text-gray-900 dark:text-gray-100 mb-4">
                Nuevos lanzamientos
            </h3>
            {/* Scrollable container with hidden scrollbar */}
            <div className="flex overflow-x-auto gap-4 px-6 pb-6 no-scrollbar">
                {newCourses.map((course) => (
                    <div key={course.id} className="flex-shrink-0 w-64 bg-white dark:bg-cs-surface-dark rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800 flex gap-3 items-center group cursor-pointer hover:shadow-md transition-shadow">
                        <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0 relative overflow-hidden">
                            <Image
                                src={course.image}
                                alt={`Curso de ${course.title}`}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className={`text-[10px] font-bold uppercase mb-1 ${course.categoryColor}`}>
                                {course.category}
                            </span>
                            <h5 className="font-display font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight mb-1 group-hover:text-cs-primary transition-colors">
                                {course.title}
                            </h5>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {course.duration}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
