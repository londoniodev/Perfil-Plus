import { FiTruck, FiAward, FiTag, FiHeadphones } from "react-icons/fi";

export function LandingAbout() {
    return (
        <section id="nosotros" className="py-24 bg-cs-primary relative overflow-hidden">
            {/* Pattern overlay */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: "url('/external/cubes.png')",
                }}
            />
            {/* Ambient glows */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-screen filter blur-[120px] opacity-40"></div>
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-teal-300 rounded-full mix-blend-screen filter blur-[120px] opacity-30"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block py-1.5 px-6 rounded-full bg-white/10 text-white text-xs font-black mb-6 backdrop-blur-md border border-white/20 shadow-sm tracking-widest uppercase">
                        Nuestra Filosofía
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 font-display drop-shadow-md leading-tight">
                        Cocinamos con pasión, <br className="hidden md:block"/> pensamos en tu salud
                    </h2>
                    <p className="text-emerald-50 leading-relaxed font-medium text-lg md:text-xl text-balance drop-shadow-sm opacity-90">
                        En Cocinasiete, creemos que comer bien no debería ser un lujo ni una complicación. Utilizamos ingredientes locales seleccionados diariamente para darte la energía que necesitas.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 flex flex-col items-center justify-center text-center transition-all duration-500 hover:bg-white/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20 group">
                        <div className="p-5 bg-white/10 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <FiTruck className="text-emerald-200 text-4xl" aria-hidden="true" />
                        </div>
                        <h3 className="font-black text-white text-lg mb-2">Envíos Gratis</h3>
                        <p className="text-emerald-100/70 text-sm font-medium">Directo a tu oficina o casa sin cargos extra.</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 flex flex-col items-center justify-center text-center transition-all duration-500 hover:bg-white/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20 group">
                        <div className="p-5 bg-white/10 rounded-2xl mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                            <FiAward className="text-emerald-200 text-4xl" aria-hidden="true" />
                        </div>
                        <h3 className="font-black text-white text-lg mb-2">Calidad Chef</h3>
                        <p className="text-emerald-100/70 text-sm font-medium">Recetas diseñadas por expertos en nutrición.</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 flex flex-col items-center justify-center text-center transition-all duration-500 hover:bg-white/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20 group">
                        <div className="p-5 bg-white/10 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <FiTag className="text-emerald-200 text-4xl" aria-hidden="true" />
                        </div>
                        <h3 className="font-black text-white text-lg mb-2">Plan Flexible</h3>
                        <p className="text-emerald-100/70 text-sm font-medium">Sin suscripciones forzosas. Pide cuando quieras.</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 flex flex-col items-center justify-center text-center transition-all duration-500 hover:bg-white/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20 group">
                        <div className="p-5 bg-white/10 rounded-2xl mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                            <FiHeadphones className="text-emerald-200 text-4xl" aria-hidden="true" />
                        </div>
                        <h3 className="font-black text-white text-lg mb-2">Atención VIP</h3>
                        <p className="text-emerald-100/70 text-sm font-medium">Estamos listos para ayudarte en cualquier momento.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
