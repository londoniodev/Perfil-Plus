import Image from "next/image";
import { prisma } from "@alvarosky/database";

export async function CursosPopulares() {
    const rawCourses = await prisma.course.findMany({
        where: { published: true },
        include: { theme: true },
        orderBy: { order: 'asc' },
        take: 2
    });

    const popularCourses = rawCourses.map(course => ({
        id: course.id,
        title: course.title,
        image: course.coverImage || (course.theme.slug === 'higiene' ? "/course-manipulacion.jpg" : "/course-costos.jpg"),
        category: course.theme.title,
        categoryColor: course.theme.slug === 'higiene' ? "bg-cs-secondary" : "bg-cs-primary",
        rating: "4.9", // Placeholder since we don't have reviews yet
        duration: "4h 30m", // Placeholder
        lessons: "12 lecciones", // Placeholder
        instructor: course.theme.slug === 'higiene' ? "Chef Ana M." : "Carlos R.", // Placeholder
        instructorAvatar: course.theme.slug === 'higiene' ? "/course-avatar1.jpg" : "/course-avatar2.jpg",
        price: course.isFree ? "Gratis" : "$29.99",
    }));

    return (
        <section className="px-6 mb-8">
            <h3 className="font-display font-bold text-xl text-gray-900  mb-5">
                Populares esta semana
            </h3>
            <div className="grid gap-5">
                {popularCourses.map((course) => (
                    <article key={course.id} className="bg-white  rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]  border border-transparent  overflow-hidden flex flex-col group cursor-pointer hover:border-cs-primary/50 transition-colors">
                        {/* Course Image Header */}
                        <div className="h-40 bg-gray-200  relative overflow-hidden">
                            <Image
                                src={course.image}
                                alt={`Curso de ${course.title}`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 bg-white  rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                                <span className="material-icons-round text-cs-secondary text-sm">star</span>
                                <span className="text-xs font-bold text-gray-900 ">{course.rating}</span>
                            </div>
                            <div className={`absolute bottom-3 left-3 ${course.categoryColor} text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide`}>
                                {course.category}
                            </div>
                        </div>

                        {/* Course Content */}
                        <div className="p-4 flex flex-col flex-grow">
                            <h4 className="font-display font-bold text-lg text-gray-900  leading-snug mb-2 group-hover:text-cs-primary transition-colors">
                                {course.title}
                            </h4>
                            <div className="flex items-center text-gray-500  text-xs mb-3 gap-3">
                                <div className="flex items-center gap-1">
                                    <span className="material-icons-outlined text-sm leading-none">schedule</span>
                                    <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="material-icons-outlined text-sm leading-none">play_lesson</span>
                                    <span>{course.lessons}</span>
                                </div>
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 relative overflow-hidden">
                                        <Image
                                            src={course.instructorAvatar}
                                            alt={`Avatar de ${course.instructor}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 ">
                                        {course.instructor}
                                    </span>
                                </div>
                                <span className="text-cs-primary font-bold text-lg">{course.price}</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
