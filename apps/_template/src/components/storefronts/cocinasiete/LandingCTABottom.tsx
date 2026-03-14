"use client";

import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";

export function LandingCTABottom() {
    return (
        <>
            <div className="fixed bottom-6 left-6 right-6 p-2 md:hidden z-40 transition-all animate-fade-in-up">
                <Link href="/tienda" className="w-full bg-cs-primary/90 backdrop-blur-xl text-white font-black py-4 px-6 rounded-3xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-4 border border-white/20">
                    <FiShoppingBag className="text-2xl" aria-hidden="true" />
                    <span className="text-lg">PEDIR AHORA</span>
                </Link>
            </div>
            {/* Spacer to prevent content from being hidden behind the sticky CTA */}
            <div className="h-28 md:hidden" />
        </>
    );
}
