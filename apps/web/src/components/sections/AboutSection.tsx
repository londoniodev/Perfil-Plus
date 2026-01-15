import Link from "next/link";
import { IconArrowRight } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import ProfileCarousel from "../layout/ProfileCarousel";

export function AboutSection() {
    return (
        <section className="py-20 md:py-32 bg-background" id="quien-soy">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <ProfileCarousel />

                    <div className="space-y-6">
                        <h2 className="section-title">Soy Mauro Mera</h2>
                        <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />Psicólogo</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />Consultor Experiencial</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />Consultor Estratégico</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />Gestor de Cultura Organizacional Certificado</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />Entrenador de liderazgo y gestión de equipos</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />Orientador Vocacional y Profesional</li>
                        </ul>

                        <p className="text-muted-foreground leading-relaxed">
                            Con una trayectoria de más de 10 años, Integro la psicología, pedagogía
                            experiencial, técnicas, principios accionables y tecnología para diseñar
                            experiencias de aprendizaje, autoconocimiento y transformación del
                            potencial humano.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Acompaño a adultos, jóvenes, equipos y organizaciones a construir claridad
                            interna, decisiones informadas y resultados sostenibles, con procesos
                            profundos y aplicables a la vida real.
                        </p>
                        <Button asChild variant="ghost" className="group mt-4">
                            <Link href="#metodo" className="flex items-center gap-2">
                                Conocer mi enfoque
                                <IconArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
