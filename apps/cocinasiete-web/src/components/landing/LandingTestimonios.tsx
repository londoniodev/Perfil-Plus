import Image from "next/image";

export function LandingTestimonios() {
    return (
        <section className="py-12 bg-white dark:bg-cs-bg-dark overflow-hidden">
            <div className="max-w-md mx-auto px-4 sm:px-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center font-display">
                    Lo que dicen nuestros clientes
                </h2>

                <div className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory no-scrollbar">
                    {/* Testimonial 1 */}
                    <div className="snap-center shrink-0 w-80 bg-cs-surface-light dark:bg-cs-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-1 text-cs-secondary mb-3">
                            <span className="material-icons-round text-sm">star</span>
                            <span className="material-icons-round text-sm">star</span>
                            <span className="material-icons-round text-sm">star</span>
                            <span className="material-icons-round text-sm">star</span>
                            <span className="material-icons-round text-sm">star</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm italic mb-4">
                            &quot;La comida es deliciosa y siempre llega caliente. Me ha salvado mis almuerzos en la oficina.&quot;
                        </p>
                        <div className="flex items-center gap-3">
                            <Image
                                alt="Ana García"
                                className="w-10 h-10 rounded-full object-cover"
                                src="/avatar-ana.jpg"
                                width={40}
                                height={40}
                            />
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Ana García</p>
                                <p className="text-xs text-gray-500">Diseñadora Gráfica</p>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="snap-center shrink-0 w-80 bg-cs-surface-light dark:bg-cs-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-1 text-cs-secondary mb-3">
                            <span className="material-icons-round text-sm">star</span>
                            <span className="material-icons-round text-sm">star</span>
                            <span className="material-icons-round text-sm">star</span>
                            <span className="material-icons-round text-sm">star</span>
                            <span className="material-icons-round text-sm">star_half</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm italic mb-4">
                            &quot;Gran variedad en el menú. Me encanta que incluyan opciones vegetarianas tan ricas.&quot;
                        </p>
                        <div className="flex items-center gap-3">
                            <Image
                                alt="Carlos Rodriguez"
                                className="w-10 h-10 rounded-full object-cover"
                                src="/avatar-carlos.jpg"
                                width={40}
                                height={40}
                            />
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Carlos Rodriguez</p>
                                <p className="text-xs text-gray-500">Desarrollador Web</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
