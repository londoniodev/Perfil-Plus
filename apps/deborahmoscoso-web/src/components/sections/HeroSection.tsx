"use client";

import Link from "next/link";
import Image from "next/image";
import { IconArrowRight } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";

export function HeroSection() {
    return (
        <section className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-background via-background to-slate-950">
            {/* Blur transition overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/100 via-background/60 to-transparent backdrop-blur-[2px] z-30 pointer-events-none" />
            {/* Full-width container with significant padding for large screens */}
            <div className="w-full h-full lg:px-24 xl:px-40 2xl:px-64">
                <div className="relative h-full lg:grid lg:grid-cols-2 lg:items-center">
                    {/* Text Column - Overlay on Mobile, Left col on Desktop */}
                    <div className="absolute inset-0 z-40 flex flex-col justify-start pt-32 sm:pt-40 px-4 text-center items-center lg:static lg:text-left lg:items-start lg:justify-center lg:pb-0 lg:pl-[3%] xl:pl-[5%] lg:bg-transparent bg-gradient-to-b from-background/80 via-transparent to-transparent lg:from-transparent">
                        <h1 className="text-foreground text-4xl sm:text-5xl md:text-6xl xl:text-7xl 2xl:text-8xl font-bold tracking-tight mb-6 leading-[1.05] drop-shadow-xl lg:drop-shadow-none">
                            Psicología y <span className="gradient-text">Desarrollo Humano.</span>
                        </h1>

                        <p className="mb-10 text-muted-foreground text-base md:text-lg xl:text-xl max-w-xl leading-relaxed drop-shadow-md lg:drop-shadow-none">
                            Experiencias educativas individuales y grupales que transforman, con método y tecnología.
                        </p>

                        <div className="flex flex-row gap-4 w-full justify-center lg:justify-start mt-auto pb-12 lg:mt-0 lg:pb-0 relative z-40">
                            <Button asChild size="lg" className="text-base font-semibold px-6 md:px-8 h-14 flex-1 sm:flex-none">
                                <Link href="#quien-soy">Conoce más</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="text-base font-medium h-14 flex-1 sm:flex-none border-white/20 hover:border-white/40 text-foreground bg-black/40 lg:bg-transparent hover:bg-white/5 backdrop-blur-sm">
                                <Link href="/servicios">
                                    Servicios
                                    <IconArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Image Column - Bottom aligned, 90% height on mobile */}
                    <div className="absolute bottom-0 left-0 right-0 h-[90%] w-full z-10 lg:static lg:h-full lg:flex lg:items-end lg:justify-end lg:overflow-visible">
                        {/* Aura effects - Desktop only or adjusted for mobile? Keep them but maybe scale down on mobile */}
                        <div className="hidden lg:block absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none z-0 bg-[radial-gradient(ellipse,_rgba(91,141,239,0.25)_0%,_transparent_70%)] animate-aura-pulse" />

                        {/* Image wrapper */}
                        <div className="relative h-full w-full flex items-end justify-center lg:h-[calc(100vh-80px)]">
                            <Image
                                src="/images/hero/mauro_hero.png"
                                alt="Mauro Mera - Psicólogo y Coach"
                                width={1000}
                                height={1400}
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                                className="h-full w-auto object-contain object-bottom drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative z-10"
                            />

                            {/* Floating Icons - Adjust positions for mobile or hide? Let's hide on very small screens to avoid clutter over face or keep them? User didn't say. Keeping them might be messy with text overlay. Let's hide strictly on mobile for cleaner overlay, show on lg. */}
                            <div className="hidden lg:block absolute top-[25%] left-0 z-20 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-lg animate-float">
                                <Image src="/hero_icons/psychology.avif" alt="Psicología" width={50} height={50} className="object-contain" />
                            </div>
                            <div className="hidden lg:block absolute top-[15%] right-0 z-20 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-lg animate-float [animation-delay:2s]">
                                <Image src="/hero_icons/mentorship.avif" alt="Mentoría" width={45} height={45} className="object-contain" />
                            </div>
                            <div className="hidden lg:block absolute bottom-[25%] -left-4 z-20 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-lg animate-float [animation-delay:4s]">
                                <Image src="/hero_icons/leadership.avif" alt="Liderazgo" width={50} height={50} className="object-contain" />
                            </div>
                            <div className="hidden lg:block absolute bottom-[40%] -right-4 z-20 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-lg animate-float [animation-delay:1s]">
                                <Image src="/hero_icons/technology.avif" alt="Tecnología" width={55} height={55} className="object-contain" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

