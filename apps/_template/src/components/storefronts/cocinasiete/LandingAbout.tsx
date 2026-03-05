import { FiTruck, FiAward, FiTag, FiHeadphones } from "react-icons/fi";

export function LandingAbout() {
    return (
        <section className="py-20 bg-cs-primary relative overflow-hidden">
            {/* Pattern overlay */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')",
                }}
            />
            {/* Ambient glows */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-300 rounded-full mix-blend-screen filter blur-[80px] opacity-30"></div>

            <div className="max-w-md mx-auto px-4 sm:px-6 relative z-10 text-center">
                <span className="inline-block py-1.5 px-4 rounded-full bg-white/20 text-white text-xs font-bold mb-6 backdrop-blur-md border border-white/30 shadow-sm">
                    SOBRE NOSOTROS
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-6 font-display drop-shadow-md">
                    Cocinamos con pasión para ti
                </h2>
                <p className="text-emerald-50 mb-12 leading-relaxed font-medium text-lg text-balance drop-shadow-sm">
                    En Cocinasiete, creemos que comer bien no debería ser complicado. Utilizamos ingredientes
                    frescos y locales para preparar platos que te llenan de energía.
                </p>

                <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 group">
                        <div className="p-3 bg-white/10 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                            <FiTruck className="text-emerald-200 text-3xl" aria-hidden="true" />
                        </div>
                        <h3 className="font-extrabold text-white text-sm tracking-wide">Envíos Rápidos</h3>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 group">
                        <div className="p-3 bg-white/10 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                            <FiAward className="text-emerald-200 text-3xl" aria-hidden="true" />
                        </div>
                        <h3 className="font-extrabold text-white text-sm tracking-wide">Chef Expertos</h3>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 group">
                        <div className="p-3 bg-white/10 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                            <FiTag className="text-emerald-200 text-3xl" aria-hidden="true" />
                        </div>
                        <h3 className="font-extrabold text-white text-sm tracking-wide">Mejor Precio</h3>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 group">
                        <div className="p-3 bg-white/10 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                            <FiHeadphones className="text-emerald-200 text-3xl" aria-hidden="true" />
                        </div>
                        <h3 className="font-extrabold text-white text-sm tracking-wide">Soporte 24/7</h3>
                    </div>
                </div>
            </div>
        </section>
    );
}
