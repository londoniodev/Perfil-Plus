"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@alvarosky/ui";

export function HeroSection() {
    return (
        <section className="relative w-full w-screen max-w-[100vw] min-h-[100dvh] flex items-center justify-center overflow-hidden bg-zinc-950">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/external/deborah-hero-bg.jpg"
                    alt="Deborah Moscoso"
                    fill
                    priority
                    quality={90}
                    sizes="100vw"
                    className="object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950 z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.15)_0%,transparent_70%)]" />
            </div>

            <div className="container mx-auto relative z-20 px-4 pt-20 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl lg:text-[8rem] font-black tracking-tighter text-white mb-8 leading-[0.9]">
                        COACHING & <br />
                        <span className="text-fuchsia-500 italic">SUPLEMENTACIÓN</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-300 mb-12 max-w-2xl mx-auto leading-relaxed opacity-80">
                        Programas de coaching de alto rendimiento, planes de nutrición personalizados y tienda oficial de suplementación premium.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button asChild size="lg" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white min-w-[200px] h-14 text-lg rounded-full">
                            <Link href="/servicios">
                                Comienza Tu Transformación
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10 min-w-[200px] h-14 text-lg rounded-full">
                            <Link href="/tienda">
                                Explorar Tienda
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Trusted By / Social Proof placeholder */}
                <div className="mt-20 pt-10 border-t border-zinc-900">
                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-6">
                        Confiado por más de 500+ clientes en su camino al éxito
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale invert">
                        {/* Logo Placeholders can go here */}
                        <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        </section>
    );
}
