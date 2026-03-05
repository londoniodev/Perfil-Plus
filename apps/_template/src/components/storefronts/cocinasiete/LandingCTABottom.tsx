"use client";

import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";

export function LandingCTABottom() {
    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/70 backdrop-blur-xl border-t border-white/40 md:hidden z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transition-all">
                <Link href="/tienda" className="w-full bg-cs-primary text-white font-bold py-3.5 rounded-2xl shadow-[0_8px_30px_rgb(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98]">
                    Pedir Ahora
                    <FiShoppingBag className="text-lg" aria-hidden="true" />
                </Link>
            </div>
            {/* Spacer to prevent content from being hidden behind the sticky CTA */}
            <div className="h-24 md:hidden" />
        </>
    );
}
