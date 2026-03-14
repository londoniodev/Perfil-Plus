"use client";

import { FiMenu } from "react-icons/fi";

export function LandingNav() {
    return (
        <nav className="fixed w-full z-50 bg-white/40 backdrop-blur-md shadow-sm border-b border-white/20 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <span className="text-2xl font-black text-cs-primary tracking-tight font-display drop-shadow-sm hover:scale-105 transition-transform cursor-pointer">
                            Cocinasiete
                        </span>
                    </div>
                    
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="#planes" className="text-sm font-bold text-gray-700 hover:text-cs-primary transition-colors">Planes</Link>
                        <Link href="#testimonios" className="text-sm font-bold text-gray-700 hover:text-cs-primary transition-colors">Testimonios</Link>
                        <Link href="#nosotros" className="text-sm font-bold text-gray-700 hover:text-cs-primary transition-colors">Nosotros</Link>
                        <Link href="/tienda" className="bg-cs-primary text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-500 hover:-translate-y-0.5 transition-all">
                            Pedir Ahora
                        </Link>
                    </div>

                    <div className="flex md:hidden items-center space-x-3">
                        <button className="text-sm font-bold text-white bg-cs-secondary px-5 py-2.5 rounded-full hover:bg-orange-500 focus:ring-4 focus:ring-orange-200 transition-all shadow-[0_4px_14px_0_rgb(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:-translate-y-[1px]">
                            Inicio
                        </button>
                        <button
                            className="p-2.5 rounded-full text-gray-600 hover:text-cs-primary hover:bg-emerald-50 focus:outline-none transition-colors"
                            aria-label="Abrir menú"
                        >
                            <FiMenu className="text-2xl" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

import Link from "next/link";
