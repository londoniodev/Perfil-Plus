import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";

export function LandingHero() {
    return (
        <header className="relative pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Hero Text */}
                    <div className="text-center lg:text-left order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-cs-primary text-xs font-bold mb-6 animate-fade-in">
                            <FaLeaf />
                            ALMUERZOS SALUDABLES EN TU TRABAJO
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-cs-secondary leading-[1.1] mb-6 tracking-tight font-display drop-shadow-sm animate-title">
                            Come bien todos los días <span className="text-cs-primary italic">sin cocinar</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0 animate-fade-in-up">
                            Almuerza rico, saludable y sin preocupaciones donde quiera que estés. Entregamos frescura directamente en tu oficina o casa.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
                            <Link href="/tienda" className="bg-cs-primary hover:bg-emerald-500 text-white font-bold py-5 px-10 rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2.5 group w-full sm:w-auto text-lg">
                                HAZ TU PEDIDO
                                <FiArrowRight className="text-xl group-hover:translate-x-1.5 transition-transform" />
                            </Link>
                            <div className="flex items-center gap-3 text-sm font-semibold text-gray-500 bg-white/50 backdrop-blur-sm px-6 py-4 rounded-full border border-gray-100 shadow-sm">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                Entregas programadas • Sin costo
                            </div>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="relative order-1 lg:order-2">
                        <div className="relative w-full aspect-[4/3] sm:aspect-square lg:aspect-[4/5] rounded-[2.5rem] lg:rounded-[4rem] overflow-hidden shadow-2xl shadow-cs-primary/20 group ring-8 ring-white/50 transform lg:rotate-2 hover:rotate-0 transition-all duration-700">
                            <Image
                                src="/hero-bowl.jpg"
                                alt="Delicious healthy bowl with avocado, greens, and grains"
                                fill
                                className="object-cover transform transition duration-700 group-hover:scale-105"
                                priority
                                sizes="(max-width: 768px) 100vw, 600px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent " />
                            
                            {/* Floating Card */}
                            <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-cs-primary">
                                        <FaLeaf className="text-2xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900">100% Ingredientes Naturales</p>
                                        <p className="text-xs font-bold text-gray-500">Preparado hoy mismo</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Back Element */}
                        <div className="absolute -z-10 -top-8 -right-8 w-full h-full border-4 border-cs-secondary/20 rounded-[4rem] hidden lg:block"></div>
                    </div>
                </div>
            </div>

            {/* Decorative blobs */}
            <div className="absolute top-20 right-0 -mr-32 w-80 h-80 bg-orange-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
            <div className="absolute bottom-0 left-0 -ml-32 w-80 h-80 bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-100/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        </header>
    );
}
