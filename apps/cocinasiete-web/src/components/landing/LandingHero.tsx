import Image from "next/image";
import Link from "next/link";

export function LandingHero() {
    return (
        <header className="relative pt-24 pb-12 overflow-hidden">
            <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Hero Image */}
                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl mb-8 group">
                    <Image
                        src="/hero-bowl.jpg"
                        alt="Delicious healthy bowl with avocado, greens, and grains"
                        fill
                        className="object-cover transform transition duration-700 group-hover:scale-105"
                        priority
                        sizes="(max-width: 768px) 100vw, 448px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent dark:from-black/60" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center gap-1 text-xs font-semibold bg-cs-primary/90 backdrop-blur px-3 py-1 rounded-full w-fit mb-2">
                            <span className="material-icons-round text-sm">eco</span>
                            Fresco &amp; Saludable
                        </div>
                    </div>
                </div>

                {/* Hero Text */}
                <div className="text-center md:text-left">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-cs-secondary leading-tight mb-4 tracking-tight font-display">
                        Almuerzos para todos los días en tu lugar de trabajo
                    </h1>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Come bien todos los días sin cocinar
                    </p>
                    <p className="text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        Almuerza rico, saludable y sin preocupaciones donde quiera que estés: oficina o casa.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
                        <Link href="/tienda" className="bg-cs-primary hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-cs-primary/30 transition duration-300 flex items-center justify-center gap-2 group w-full sm:w-auto">
                            HAZ TU PEDIDO
                            <span className="material-icons-round text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            Entregas programadas • Sin costo de envío
                        </p>
                    </div>
                </div>
            </div>

            {/* Decorative blobs */}
            <div className="absolute top-20 right-0 -mr-20 w-64 h-64 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-3xl -z-10 opacity-60" />
            <div className="absolute bottom-0 left-0 -ml-20 w-72 h-72 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl -z-10 opacity-60" />
        </header>
    );
}
