import Link from "next/link";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";
import { MdBusinessCenter, MdHomeFilled } from "react-icons/md";

export function LandingPlanes() {
    return (
        <section id="planes" className="py-24 bg-gray-50/50 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-50/50 -skew-x-12 transform translate-x-1/2 -z-10"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
                {/* Section Header */}
                <div className="text-center mb-20 max-w-2xl mx-auto">
                    <span className="text-cs-primary font-black tracking-widest text-xs uppercase mb-3 block">Elige tu experiencia</span>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-display tracking-tight">
                        Planes diseñados <span className="text-cs-secondary italic">para ti</span>
                    </h2>
                    <p className="text-gray-500 font-medium text-lg leading-relaxed">
                        Ya sea en la oficina con tu equipo o en la comodidad de tu hogar, tenemos el plan perfecto para que comas increíble todos los días.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
                    {/* Plan Oficina */}
                    <div className="bg-white rounded-[3rem] p-10 lg:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden group transition-all duration-500 hover:-translate-y-3">
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-orange-400 to-orange-500"></div>
                        <div className="absolute top-8 right-8 bg-cs-secondary/10 text-cs-secondary text-xs font-black px-5 py-2 rounded-full tracking-widest uppercase">
                            POPULAR
                        </div>
                        <div className="flex items-center gap-6 mb-8 mt-2">
                            <div className="p-5 bg-orange-50 rounded-[2rem] text-cs-secondary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <MdBusinessCenter className="text-5xl" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 font-display">
                                Plan Oficina
                            </h3>
                        </div>
                        <p className="text-gray-500 text-lg mb-8 font-medium leading-relaxed">
                            Diseñado para profesionales que no quieren perder tiempo cocinando pero exigen calidad y sabor.
                        </p>
                        <div className="space-y-5 mb-12">
                            <div className="flex items-center gap-4 group/item">
                                <div className="w-8 h-8 rounded-full bg-cs-primary/10 flex items-center justify-center text-cs-primary group-hover/item:scale-110 transition-transform">
                                    <FiCheckCircle className="text-xl" />
                                </div>
                                <span className="font-bold text-gray-700">Menús variados semanalmente</span>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                                <div className="w-8 h-8 rounded-full bg-cs-primary/10 flex items-center justify-center text-cs-primary group-hover/item:scale-110 transition-transform">
                                    <FiCheckCircle className="text-xl" />
                                </div>
                                <span className="font-bold text-gray-700">Entrega en tu puesto (12:30 PM)</span>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                                <div className="w-8 h-8 rounded-full bg-cs-primary/10 flex items-center justify-center text-cs-primary group-hover/item:scale-110 transition-transform">
                                    <FiCheckCircle className="text-xl" />
                                </div>
                                <span className="font-bold text-gray-700">Opciones para todos los gustos</span>
                            </div>
                        </div>
                        <Link href="/tienda" className="flex items-center justify-center gap-3 w-full py-5 rounded-[2rem] bg-cs-secondary text-white font-black text-lg hover:bg-orange-600 transition-all duration-300 shadow-xl shadow-orange-100 hover:shadow-orange-200">
                            Explorar Menú Oficina
                            <FiArrowRight className="text-2xl" />
                        </Link>
                    </div>

                    {/* Plan Hogar */}
                    <div className="bg-white rounded-[3rem] p-10 lg:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden group transition-all duration-500 hover:-translate-y-3">
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="flex items-center gap-6 mb-8 mt-2">
                            <div className="p-5 bg-emerald-50 rounded-[2rem] text-cs-primary group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                                <MdHomeFilled className="text-5xl" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 font-display">
                                Plan Hogar
                            </h3>
                        </div>
                        <p className="text-gray-500 text-lg mb-8 font-medium leading-relaxed">
                            Disfruta de la mejor comida casera y balanceada sin preocupaciones de tiempo o limpieza.
                        </p>
                        <div className="space-y-5 mb-12">
                            <div className="flex items-center gap-4 group/item">
                                <div className="w-8 h-8 rounded-full bg-cs-primary/10 flex items-center justify-center text-cs-primary group-hover/item:scale-110 transition-transform">
                                    <FiCheckCircle className="text-xl" />
                                </div>
                                <span className="font-bold text-gray-700">Porciones generosas y ricas</span>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                                <div className="w-8 h-8 rounded-full bg-cs-primary/10 flex items-center justify-center text-cs-primary group-hover/item:scale-110 transition-transform">
                                    <FiCheckCircle className="text-xl" />
                                </div>
                                <span className="font-bold text-gray-700">Envases amigables con el ambiente</span>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                                <div className="w-8 h-8 rounded-full bg-cs-primary/10 flex items-center justify-center text-cs-primary group-hover/item:scale-110 transition-transform">
                                    <FiCheckCircle className="text-xl" />
                                </div>
                                <span className="font-bold text-gray-700">Entrega programada a tu puerta</span>
                            </div>
                        </div>
                        <Link href="/tienda" className="flex items-center justify-center gap-3 w-full py-5 rounded-[2rem] border-2 border-gray-100 text-gray-900 font-black text-lg hover:border-cs-primary hover:text-cs-primary transition-all duration-300 shadow-sm bg-gray-50/50">
                            Explorar Menú Hogar
                            <FiArrowRight className="text-2xl" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
