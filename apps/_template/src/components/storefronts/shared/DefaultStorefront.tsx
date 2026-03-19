import React from "react";
import { Button } from "@alvarosky/ui";
import { TenantMarketingData } from "@/types/marketing";
import { ArrowRight, ShoppingBag, Award, Clock } from "lucide-react";

interface DefaultStorefrontProps {
    data: TenantMarketingData;
}

export default function DefaultStorefront({ data }: DefaultStorefrontProps) {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl -z-10" />

                <div className="max-w-4xl space-y-6">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter bg-gradient-to-r from-primary via-primary/60 to-primary bg-clip-text text-transparent">
                        {data.heroTitle || "Bienvenido a nuestra tienda"}
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        {data.heroSubtitle || "Estamos configurando las mejores soluciones para ti. Muy pronto podrás ver todo nuestro catálogo."}
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 pt-4">
                        <Button size="lg" className="rounded-[var(--radius)] shadow-lg shadow-primary/20 group">
                            Explorar catálogo
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-[var(--radius)] backdrop-blur-sm">
                            Conócenos
                        </Button>
                    </div>
                </div>
            </section>

            {/* Características */}
            <section className="container max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <article className="p-6 bg-card/40 backdrop-blur-md rounded-[var(--radius)] border border-border/50 shadow-xl shadow-black/5 hover:translate-y-[-4px] transition-all">
                    <div className="p-3 bg-primary/10 w-fit rounded-[var(--radius)] mb-4 text-primary">
                        <ShoppingBag className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Tienda Online</h3>
                    <p className="text-muted-foreground text-sm">
                        Productos físicos, digitales y servicios a un clic de distancia con envío seguro.
                    </p>
                </article>

                <article className="p-6 bg-card/40 backdrop-blur-md rounded-[var(--radius)] border border-border/50 shadow-xl shadow-black/5 hover:translate-y-[-4px] transition-all">
                    <div className="p-3 bg-secondary/10 w-fit rounded-[var(--radius)] mb-4 text-secondary-foreground">
                        <Award className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Calidad Garantizada</h3>
                    <p className="text-muted-foreground text-sm">
                        Seleccionamos minuciosamente cada producto para ofrecerte la máxima satisfacción.
                    </p>
                </article>

                <article className="p-6 bg-card/40 backdrop-blur-md rounded-[var(--radius)] border border-border/50 shadow-xl shadow-black/5 hover:translate-y-[-4px] transition-all">
                    <div className="p-3 bg-primary/10 w-fit rounded-[var(--radius)] mb-4 text-primary">
                        <Clock className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Soporte 24/7</h3>
                    <p className="text-muted-foreground text-sm">
                        Estamos aquí para ayudarte en cualquier etapa de tu compra o consulta.
                    </p>
                </article>
            </section>

            {/* Footer básico */}
            <footer className="mt-auto border-t border-border/40 py-8 bg-card/10 backdrop-blur-md">
                <div className="container max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
                    <p>© {new Date().getFullYear()} {data.heroTitle}. Todos los derechos reservados.</p>
                    <nav className="flex gap-6" aria-label="Enlaces legales">
                        <a href="/politica-de-privacidad" className="hover:text-foreground transition-colors">Privacidad</a>
                        <a href="/terminos-y-condiciones" className="hover:text-foreground transition-colors">Términos</a>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
