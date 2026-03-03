import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";
import { MdBusinessCenter, MdHomeFilled } from "react-icons/md";

export function LandingPlanes() {
    return (
        <section className="py-20 bg-cs-surface-light relative">
            <div className="max-w-md md:max-w-4xl mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 font-display tracking-tight">
                        Nuestros Planes
                    </h2>
                    <div className="w-20 h-1.5 bg-cs-secondary mx-auto rounded-full" />
                    <p className="mt-5 text-gray-600 font-medium text-lg">
                        Elige la mejor opción para ti
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-10">
                    {/* Plan Oficina */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-gray-100 relative overflow-hidden group transition-all duration-300 hover:-translate-y-2">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 to-orange-500"></div>
                        <div className="absolute top-0 right-0 bg-cs-secondary text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl shadow-sm">
                            POPULAR
                        </div>
                        <div className="flex items-start justify-between mb-6 mt-2">
                            <div className="p-4 bg-orange-50 rounded-2xl text-cs-secondary group-hover:scale-110 transition-transform duration-300">
                                <MdBusinessCenter className="text-4xl" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-3 font-display">
                            Plan Oficina
                        </h3>
                        <p className="text-gray-500 text-base mb-6 font-medium leading-relaxed">
                            Ideal para equipos y coworkers. Menús variados cada semana entregados en tu escritorio.
                        </p>
                        <ul className="space-y-4 mb-8 text-sm font-semibold text-gray-700">
                            <li className="flex items-center gap-3">
                                <FiCheckCircle className="text-cs-primary text-xl flex-shrink-0" />
                                Variedad diaria
                            </li>
                            <li className="flex items-center gap-3">
                                <FiCheckCircle className="text-cs-primary text-xl flex-shrink-0" />
                                Entrega puntual 12:30 PM
                            </li>
                        </ul>
                        <Link href="/tienda" className="block text-center w-full py-4 rounded-2xl border-2 border-cs-primary text-cs-primary font-bold hover:bg-cs-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
                            Ver Menú Oficina
                        </Link>
                    </div>

                    {/* Plan Hogar */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-gray-100 relative overflow-hidden group transition-all duration-300 hover:-translate-y-2">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-start justify-between mb-6 mt-2">
                            <div className="p-4 bg-emerald-50 rounded-2xl text-cs-primary group-hover:scale-110 transition-transform duration-300">
                                <MdHomeFilled className="text-4xl" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-3 font-display">
                            Plan Hogar
                        </h3>
                        <p className="text-gray-500 text-base mb-6 font-medium leading-relaxed">
                            Disfruta de comida casera y balanceada sin tener que cocinar ni limpiar.
                        </p>
                        <ul className="space-y-4 mb-8 text-sm font-semibold text-gray-700">
                            <li className="flex items-center gap-3">
                                <FiCheckCircle className="text-cs-primary text-xl flex-shrink-0" />
                                Porciones generosas
                            </li>
                            <li className="flex items-center gap-3">
                                <FiCheckCircle className="text-cs-primary text-xl flex-shrink-0" />
                                Envases ecológicos
                            </li>
                        </ul>
                        <Link href="/tienda" className="block text-center w-full py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:border-cs-primary hover:text-cs-primary transition-all duration-300 shadow-sm hover:shadow-md bg-gray-50 hover:bg-white">
                            Ver Menú Hogar
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
