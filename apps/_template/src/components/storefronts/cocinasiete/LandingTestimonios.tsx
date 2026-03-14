import Image from "next/image";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

export function LandingTestimonios() {
    return (
        <section id="testimonios" className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center mb-20">
                    <span className="text-cs-primary font-black tracking-widest text-xs uppercase mb-3 block">Experiencias Reales</span>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-display tracking-tight">
                        Lo que dicen <span className="text-cs-secondary italic">nuestros clientes</span>
                    </h2>
                    <div className="w-24 h-2 bg-cs-primary/30 mx-auto rounded-full overflow-hidden">
                        <div className="w-1/2 h-full bg-cs-primary animate-pulse"></div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Testimonial 1 */}
                    <div className="bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] transition-all duration-500 hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-cs-primary/5 group">
                        <div className="flex items-center gap-1.5 text-cs-secondary mb-6 text-lg group-hover:scale-110 transition-transform">
                            <FaStar />
                            <FaStar />
                            <FaStar />
                            <FaStar />
                            <FaStar />
                        </div>
                        <p className="text-gray-700 text-lg leading-relaxed mb-10 font-medium italic">
                            &quot;La comida es deliciosa y siempre llega caliente. Me ha salvado mis almuerzos en la oficina, no me preocupo por nada más. Altamente recomendados.&quot;
                        </p>
                        <div className="flex items-center gap-5 pt-8 border-t border-gray-100">
                            <div className="relative w-14 h-14">
                                <Image
                                    alt="Ana García"
                                    fill
                                    className="rounded-full object-cover shadow-lg border-2 border-white"
                                    src="/avatar-ana.jpg"
                                    sizes="56px"
                                />
                            </div>
                            <div>
                                <p className="text-lg font-black text-gray-900">Ana García</p>
                                <p className="text-sm font-bold text-cs-primary uppercase tracking-wider">Diseñadora Senior</p>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] transition-all duration-500 hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-cs-primary/5 group">
                        <div className="flex items-center gap-1.5 text-cs-secondary mb-6 text-lg group-hover:scale-110 transition-transform">
                            <FaStar />
                            <FaStar />
                            <FaStar />
                            <FaStar />
                            <FaStarHalfAlt />
                        </div>
                        <p className="text-gray-700 text-lg leading-relaxed mb-10 font-medium italic">
                            &quot;Gran variedad en el menú. Me encanta que incluyan opciones vegetarianas tan ricas y consistentes cada semana. El servicio es puntual y amable.&quot;
                        </p>
                        <div className="flex items-center gap-5 pt-8 border-t border-gray-100">
                            <div className="relative w-14 h-14">
                                <Image
                                    alt="Carlos Rodriguez"
                                    fill
                                    className="rounded-full object-cover shadow-lg border-2 border-white"
                                    src="/avatar-carlos.jpg"
                                    sizes="56px"
                                />
                            </div>
                            <div>
                                <p className="text-lg font-black text-gray-900">Carlos Rodriguez</p>
                                <p className="text-sm font-bold text-cs-primary uppercase tracking-wider">Lead Developer</p>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 3 (Duplicate for better grid filling) */}
                    <div className="bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] transition-all duration-500 hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-cs-primary/5 group hidden lg:block">
                        <div className="flex items-center gap-1.5 text-cs-secondary mb-6 text-lg group-hover:scale-110 transition-transform">
                            <FaStar />
                            <FaStar />
                            <FaStar />
                            <FaStar />
                            <FaStar />
                        </div>
                        <p className="text-gray-700 text-lg leading-relaxed mb-10 font-medium italic">
                            &quot;Desde que pedimos en la oficina, el ambiente ha mejorado mucho. Todos comemos rico y saludable sin perder tiempo buscando qué pedir.&quot;
                        </p>
                        <div className="flex items-center gap-5 pt-8 border-t border-gray-100">
                            <div className="relative w-14 h-14 bg-cs-primary rounded-full flex items-center justify-center text-white font-black">
                                LM
                            </div>
                            <div>
                                <p className="text-lg font-black text-gray-900">Laura Martínez</p>
                                <p className="text-sm font-bold text-cs-primary uppercase tracking-wider">HR Manager</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Elements */}
            <div className="absolute -left-20 top-20 w-96 h-96 bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10"></div>
            <div className="absolute -right-20 bottom-10 w-96 h-96 bg-orange-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10"></div>
        </section>
    );
}
