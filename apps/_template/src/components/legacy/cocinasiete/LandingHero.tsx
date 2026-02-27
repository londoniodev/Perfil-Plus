import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";

export function LandingHero() {
    return (
        <header className="relative pt-32 pb-16 overflow-hidden">
            <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Hero Image */}
                <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl shadow-cs-primary/20 mb-10 group ring-4 ring-white/50">
                    <Image
                        src="/hero-bowl.jpg"
                        alt="Delicious healthy bowl with avocado, greens, and grains"
                        fill
                        className="object-cover transform transition duration-700 group-hover:scale-105"
                        priority
                        sizes="(max-width: 768px) 100vw, 448px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent " />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2rem]"></div>
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                        <div className="flex items-center gap-1.5 text-xs font-bold bg-white/20 backdrop-blur-md px-4 py-1.5 border border-white/30 rounded-full w-fit mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                            <FaLeaf className="text-emerald-300" />
                            Fresco &amp; Saludable
                        </div>
                    </div>
                </div>

                {/* Hero Text */}
                <div className="text-center md:text-left">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-cs-secondary leading-[1.15] mb-5 tracking-tight font-display drop-shadow-sm">
                        Almuerzos para todos los días en tu lugar de trabajo
                    </h1>
                    <p className="text-xl font-bold text-gray-900 mb-3">
                        Come bien todos los días sin cocinar
                    </p>
                    <p className="text-base text-gray-600 mb-10 leading-relaxed font-medium">
                        Almuerza rico, saludable y sin preocupaciones donde quiera que estés: oficina o casa.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
                        <Link href="/tienda" className="bg-cs-primary hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2.5 group w-full sm:w-auto">
                            HAZ TU PEDIDO
                            <FiArrowRight className="text-xl group-hover:translate-x-1.5 transition-transform" />
                        </Link>
                        <p className="text-sm font-semibold text-gray-500 flex items-center justify-center text-center gap-2 bg-gray-50/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100/50 w-full sm:w-auto">
                            Entregas programadas • Sin costo
                        </p>
                    </div>
                </div>
            </div>

            {/* Decorative blobs */}
            <div className="absolute top-20 right-0 -mr-32 w-80 h-80 bg-orange-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
            <div className="absolute bottom-0 left-0 -ml-32 w-80 h-80 bg-emerald-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        </header>
    );
}
