export function LandingAbout() {
    return (
        <section className="py-12 bg-cs-primary relative overflow-hidden">
            {/* Pattern overlay */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')",
                }}
            />

            <div className="max-w-md mx-auto px-4 sm:px-6 relative z-10 text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-xs font-bold mb-4 backdrop-blur-sm">
                    SOBRE NOSOTROS
                </span>
                <h2 className="text-3xl font-bold text-white mb-6 font-display">
                    Cocinamos con pasión para ti
                </h2>
                <p className="text-emerald-50 mb-8 leading-relaxed">
                    En Cocinasiete, creemos que comer bien no debería ser complicado. Utilizamos ingredientes
                    frescos y locales para preparar platos que te llenan de energía.
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex flex-col items-start justify-center">
                        <span className="material-icons-round text-cs-secondary mb-2 block w-8 h-8 overflow-hidden whitespace-nowrap text-[32px] leading-none">local_shipping</span>
                        <h3 className="font-bold text-white text-sm">Envíos Rápidos</h3>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex flex-col items-start justify-center">
                        <span className="material-icons-round text-cs-secondary mb-2 block w-8 h-8 overflow-hidden whitespace-nowrap text-[32px] leading-none">restaurant_menu</span>
                        <h3 className="font-bold text-white text-sm">Chef Expertos</h3>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex flex-col items-start justify-center">
                        <span className="material-icons-round text-cs-secondary mb-2 block w-8 h-8 overflow-hidden whitespace-nowrap text-[32px] leading-none">savings</span>
                        <h3 className="font-bold text-white text-sm">Mejor Precio</h3>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex flex-col items-start justify-center">
                        <span className="material-icons-round text-cs-secondary mb-2 block w-8 h-8 overflow-hidden whitespace-nowrap text-[32px] leading-none">support_agent</span>
                        <h3 className="font-bold text-white text-sm">Soporte 24/7</h3>
                    </div>
                </div>
            </div>
        </section>
    );
}
