"use client";

import Link from "next/link";
import { IconTarget, IconBrain, IconZap } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function FormacionContent() {
    const cursos = [
        {
            title: "Liderazgo Transformacional",
            description: "Desarrolla las habilidades necesarias para liderar equipos de alto rendimiento y generar impacto positivo en tu organización.",
            level: "Intermedio",
            duration: "8 semanas",
            icon: <IconTarget />,
        },
        {
            title: "Psicología Organizacional",
            description: "Comprende el comportamiento humano en el contexto laboral y mejora el clima organizacional de tu empresa.",
            level: "Básico",
            duration: "6 semanas",
            icon: <IconBrain />,
        },
        {
            title: "Inteligencia Emocional",
            description: "Aprende a gestionar tus emociones y las de tu equipo para mejorar la comunicación y productividad.",
            level: "Básico",
            duration: "4 semanas",
            icon: <IconZap />,
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="py-32 text-center bg-[radial-gradient(circle_at_center,rgba(91,141,239,0.08)_0%,transparent_60%)]">
                <div className="container">
                    <span className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold text-accent mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        Formación Profesional
                    </span>
                    <h1 className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100 page-hero-title">
                        Cursos que transforman carreras
                    </h1>
                    <p className="max-w-[700px] mx-auto mb-10 text-muted-foreground text-lg leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        Programas diseñados para desarrollar líderes, mejorar equipos y potenciar organizaciones
                        con enfoque en psicología aplicada y desarrollo personal.
                    </p>
                    <div className="animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
                        <Button asChild>
                            <Link href="/login?redirect=/cursos">Comenzar Ahora</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="py-16">
                <div className="container">
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {cursos.map((curso, index) => (
                                <Card key={index} className="flex flex-col h-full hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-border/50">
                                    <div className="p-6 pb-0">
                                        <div className="w-[60px] h-[60px] bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl mb-6">
                                            {curso.icon}
                                        </div>
                                    </div>
                                    <CardHeader className="pt-0">
                                        <CardTitle className="text-xl mb-2">{curso.title}</CardTitle>
                                        <CardDescription className="text-base line-clamp-3">
                                            {curso.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="flex gap-3">
                                            <Badge variant="secondary" className="bg-white/5 text-foreground font-semibold">
                                                {curso.level}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 font-semibold">
                                                {curso.duration}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <Button asChild variant="secondary" className="w-full">
                                            <Link href="/login?redirect=/cursos">Ver Detalles</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 text-center bg-gradient-to-t from-primary/5 to-transparent">
                <div className="container">
                    <h2 className="text-3xl font-serif font-bold mb-4">¿Listo para dar el siguiente paso?</h2>
                    <p className="max-w-[600px] mx-auto mt-4 mb-8 text-muted-foreground">
                        Únete a cientos de profesionales que ya han transformado su carrera con nuestros programas.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                        <Button asChild>
                            <Link href="/login?redirect=/cursos">Inscribirme Ahora</Link>
                        </Button>
                        <Button asChild variant="secondary">
                            <Link href="/servicios">Conocer Servicios</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
