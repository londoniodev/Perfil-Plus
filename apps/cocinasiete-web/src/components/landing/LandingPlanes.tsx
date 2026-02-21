export function LandingPlanes() {
    return (
        <section className="py-12 bg-cs-surface-light dark:bg-cs-surface-dark">
            <div className="max-w-md mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-display">
                        Nuestros Planes
                    </h2>
                    <div className="w-16 h-1 bg-cs-secondary mx-auto rounded-full" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Elige la mejor opción para ti
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Plan Oficina */}
                    <div className="bg-white dark:bg-cs-bg-dark rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-cs-secondary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                            POPULAR
                        </div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-cs-secondary">
                                <span className="material-icons-round text-3xl">business_center</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-display">
                            Plan Oficina
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            Ideal para equipos y coworkers. Menús variados cada semana entregados en tu escritorio.
                        </p>
                        <ul className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-300">
                            <li className="flex items-center gap-2">
                                <span className="material-icons-round text-cs-primary text-base">check_circle</span>
                                Variedad diaria
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="material-icons-round text-cs-primary text-base">check_circle</span>
                                Entrega puntual 12:30 PM
                            </li>
                        </ul>
                        <button className="w-full py-3 rounded-xl border-2 border-cs-primary text-cs-primary font-bold hover:bg-cs-primary hover:text-white transition-colors">
                            Ver Menú Oficina
                        </button>
                    </div>

                    {/* Plan Hogar */}
                    <div className="bg-white dark:bg-cs-bg-dark rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-cs-primary">
                                <span className="material-icons-round text-3xl">home</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-display">
                            Plan Hogar
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            Disfruta de comida casera y balanceada sin tener que cocinar ni limpiar.
                        </p>
                        <ul className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-300">
                            <li className="flex items-center gap-2">
                                <span className="material-icons-round text-cs-primary text-base">check_circle</span>
                                Porciones generosas
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="material-icons-round text-cs-primary text-base">check_circle</span>
                                Envases ecológicos
                            </li>
                        </ul>
                        <button className="w-full py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold hover:border-cs-primary hover:text-cs-primary transition-colors">
                            Ver Menú Hogar
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
