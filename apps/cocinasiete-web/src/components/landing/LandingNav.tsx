"use client";

export function LandingNav() {
    return (
        <nav className="fixed w-full z-50 bg-cs-bg-light/90  backdrop-blur-md shadow-sm border-b border-gray-100 ">
            <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <span className="text-2xl font-bold text-cs-primary tracking-tight font-display">
                            Cocinasiete
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="text-sm font-medium text-white bg-cs-secondary px-4 py-2 rounded-full hover:bg-orange-400 transition-colors shadow-md shadow-orange-200 ">
                            Inicio
                        </button>
                        <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 :bg-gray-800 focus:outline-none">
                            <span className="material-icons-round">menu</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
