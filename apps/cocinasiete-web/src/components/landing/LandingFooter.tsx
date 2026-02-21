export function LandingFooter() {
    return (
        <footer className="bg-cs-surface-light dark:bg-cs-surface-dark pt-12 pb-8 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-md mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Compañía</h4>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li>
                                <a className="hover:text-cs-primary transition-colors" href="#">
                                    Acerca de
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-cs-primary transition-colors" href="#">
                                    Carreras
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-cs-primary transition-colors" href="#">
                                    Blog
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Soporte</h4>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li>
                                <a className="hover:text-cs-primary transition-colors" href="#">
                                    Ayuda
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-cs-primary transition-colors" href="#">
                                    Contacto
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-cs-primary transition-colors" href="#">
                                    Privacidad
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xl font-bold text-cs-primary font-display">Cocinasiete</span>
                    <div className="flex space-x-4">
                        <a className="text-gray-400 hover:text-cs-primary transition-colors" href="#">
                            <span className="material-icons-round">facebook</span>
                        </a>
                        <a className="text-gray-400 hover:text-cs-primary transition-colors" href="#">
                            <span className="material-icons-round">camera_alt</span>
                        </a>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-8">
                    © 2023 Cocinasiete. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
}
