import Image from "next/image";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

export function LandingTestimonios() {
    return (
        <section className="py-20 bg-white relative overflow-hidden">
            <div className="max-w-md md:max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 text-center font-display tracking-tight">
                        Lo que dicen nuestros clientes
                    </h2>
                    <div className="w-20 h-1.5 bg-cs-primary mx-auto rounded-full" />
                </div>

                <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory no-scrollbar [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] px-4">
                    {/* Testimonial 1 */}
                    <div className="snap-center shrink-0 w-80 md:w-96 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-transform duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-1.5 text-orange-400 mb-5 text-sm">
                            <FaStar />
                            <FaStar />
                            <FaStar />
                            <FaStar />
                            <FaStar />
                        </div>
                        <p className="text-gray-700 text-base leading-relaxed mb-6 font-medium">
                            &quot;La comida es deliciosa y siempre llega caliente. Me ha salvado mis almuerzos en la oficina, no me preocupo por nada más.&quot;
                        </p>
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-200/60">
                            <Image
                                alt="Ana García"
                                className="w-12 h-12 rounded-full object-cover shadow-sm bg-gray-100"
                                src="/avatar-ana.jpg"
                                width={48}
                                height={48}
                            />
                            <div>
                                <p className="text-base font-bold text-gray-900">Ana García</p>
                                <p className="text-sm font-medium text-cs-primary">Diseñadora Gráfica</p>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="snap-center shrink-0 w-80 md:w-96 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-transform duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-1.5 text-orange-400 mb-5 text-sm">
                            <FaStar />
                            <FaStar />
                            <FaStar />
                            <FaStar />
                            <FaStarHalfAlt />
                        </div>
                        <p className="text-gray-700 text-base leading-relaxed mb-6 font-medium">
                            &quot;Gran variedad en el menú. Me encanta que incluyan opciones vegetarianas tan ricas y consistentes cada semana.&quot;
                        </p>
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-200/60">
                            <Image
                                alt="Carlos Rodriguez"
                                className="w-12 h-12 rounded-full object-cover shadow-sm bg-gray-100"
                                src="/avatar-carlos.jpg"
                                width={48}
                                height={48}
                            />
                            <div>
                                <p className="text-base font-bold text-gray-900">Carlos Rodriguez</p>
                                <p className="text-sm font-medium text-cs-primary">Desarrollador Web</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Elements */}
            <div className="absolute -left-20 top-20 w-72 h-72 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0"></div>
            <div className="absolute -right-20 bottom-10 w-96 h-96 bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0"></div>
        </section>
    );
}
