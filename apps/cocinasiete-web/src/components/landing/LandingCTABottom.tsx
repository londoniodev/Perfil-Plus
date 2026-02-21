"use client";

export function LandingCTABottom() {
    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-cs-bg-dark/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 md:hidden z-40">
                <button className="w-full bg-cs-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                    Pedir Ahora
                    <span className="material-icons-round text-sm">shopping_bag</span>
                </button>
            </div>
            {/* Spacer to prevent content from being hidden behind the sticky CTA */}
            <div className="h-20 md:hidden" />
        </>
    );
}
