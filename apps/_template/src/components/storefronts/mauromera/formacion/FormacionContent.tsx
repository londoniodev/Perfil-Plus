"use client";

import { useState } from "react";
import Link from "next/link";
import { 
    IconTarget, 
    IconBrain, 
    IconZap, 
    IconPlay, 
    IconClock, 
    IconCheck,
    IconChevronRight
} from "@alvarosky/ui";
import { 
    Button, 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardFooter, 
    Badge, 
    PageHeader,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    PriceDisplay
} from "@alvarosky/ui";

export default function FormacionContent({ themes = [] }: { themes?: any[] }) {
    const [selectedTheme, setSelectedTheme] = useState<any>(null);

    // Mapeamos los datos recibidos a un formato amigable para la UI local
    const mappedThemes = themes.map((theme: any) => ({
        id: theme.id,
        title: theme.title,
        description: theme.description,
        price: theme.price,
        image: theme.imageUrl || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
        teaserVideo: theme.teaserVideo,
        firstCourseId: theme.firstCourseId,
        icon: <IconTarget />,
        level: "Programa Completo",
        duration: "Acceso de por vida",
        curriculum: [
            "Contenido exclusivo del programa",
            "Casos prácticos guiados",
            "Recursos descargables",
            "Acceso a la comunidad"
        ]
    }));

    // Función simple para detectar si es un video de YT/Vimeo o directo
    const isExternalVideo = (url: string) => {
        return url?.includes("youtube.com") || url?.includes("youtu.be") || url?.includes("vimeo.com");
    };

    const getEmbedUrl = (url: string) => {
        if (url?.includes("youtube.com") || url?.includes("youtu.be")) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
        }
        return url;
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                variant="marketing"
                className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 mb-12 md:mb-16"
                title="Programas que transforman vidas"
                description="Explora procesos de formación diseñados para desarrollar líderes, mejorar equipos y potenciar tu desarrollo personal con un enfoque consciente."
            />

            {/* Themes Grid */}
            <section className="py-16">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mappedThemes.length > 0 ? (
                                mappedThemes.map((theme) => (
                                    <Card key={theme.id} className="flex flex-col h-full hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden">
                                        <div className="relative h-48 w-full bg-muted">
                                            <img 
                                                src={theme.image} 
                                                alt={theme.title}
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                            />
                                            <div className="absolute top-4 left-4 w-[50px] h-[50px] bg-background/90 backdrop-blur text-primary rounded-xl flex items-center justify-center text-2xl shadow-sm border border-border/50">
                                                {theme.icon}
                                            </div>
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="heading-h3 mb-2">{theme.title}</CardTitle>
                                            <CardDescription className="text-body line-clamp-2">
                                                {theme.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                                                    {theme.level}
                                                </Badge>
                                                <Badge variant="secondary" className="bg-amber-500/5 text-amber-600 border-amber-500/10">
                                                    <IconClock className="mr-1 h-3 w-3" />
                                                    {theme.duration}
                                                </Badge>
                                            </div>
                                            <PriceDisplay price={theme.price} size="sm" />
                                        </CardContent>
                                        <CardFooter className="pt-0">
                                            <Button 
                                                onClick={() => setSelectedTheme(theme)}
                                                variant="secondary" 
                                                className="w-full group"
                                            >
                                                Ver Detalles
                                                <IconChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center">
                                    <h3 className="text-xl font-serif text-muted-foreground">Próximamente nuevos programas de formación.</h3>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Theme Preview Modal */}
            <Dialog open={!!selectedTheme} onOpenChange={(open) => !open && setSelectedTheme(null)}>
                <DialogContent className="max-w-3xl overflow-hidden p-0 border-none sm:rounded-2xl shadow-2xl">
                    {selectedTheme && (
                        <>
                            {/* Header con Video Trailer o Imagen Fallback */}
                            <div className="relative aspect-video w-full bg-black">
                                {selectedTheme.teaserVideo ? (
                                    isExternalVideo(selectedTheme.teaserVideo) ? (
                                        <iframe
                                            src={getEmbedUrl(selectedTheme.teaserVideo)}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video 
                                            src={selectedTheme.teaserVideo}
                                            controls
                                            autoPlay
                                            className="w-full h-full object-contain"
                                        />
                                    )
                                ) : (
                                    <img 
                                        src={selectedTheme.image} 
                                        alt={selectedTheme.title}
                                        className="w-full h-full object-cover opacity-60"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
                                
                                <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                                    <Badge className="mb-3 bg-primary text-primary-foreground">
                                        {selectedTheme.level}
                                    </Badge>
                                    <h2 className="text-3xl font-serif font-bold text-foreground">
                                        {selectedTheme.title}
                                    </h2>
                                </div>
                            </div>
                            
                            <div className="p-8 pt-4">
                                <DialogHeader className="mb-6 text-left">
                                    <DialogDescription className="text-lg leading-relaxed text-muted-foreground">
                                        {selectedTheme.description}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-sm uppercase tracking-wider text-primary">Sobre este programa</h4>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            Accede a una experiencia de aprendizaje completa diseñada para transformar tu perspectiva y habilidades.
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <IconClock className="h-4 w-4 text-amber-500" />
                                                <span className="font-medium">{selectedTheme.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <IconPlay className="h-4 w-4 text-primary" />
                                                <span className="font-medium">Video-clases en alta definición</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <IconBrain className="h-4 w-4 text-purple-500" />
                                                <span className="font-medium">Evaluaciones de aprendizaje</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
                                        <h4 className="font-semibold text-sm uppercase tracking-wider text-foreground mb-4">¿Qué incluye?</h4>
                                        <ul className="space-y-3">
                                            {selectedTheme.curriculum.map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                                    <IconCheck className="h-4 w-4 text-green-500 mt-0.5" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <DialogFooter className="flex-col sm:flex-row gap-4 items-center border-t pt-6 border-border/50">
                                    <div className="flex-1 text-center sm:text-left">
                                        <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Inversión</span>
                                        <PriceDisplay price={selectedTheme.price} />
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <Button variant="outline" onClick={() => setSelectedTheme(null)} className="flex-1 sm:flex-none">
                                            Cerrar
                                        </Button>
                                        <Button asChild className="flex-1 sm:flex-none px-8 shadow-lg shadow-primary/20">
                                            <Link href={`/login?redirect=/dashboard/academia/cursos/temas/${selectedTheme.id}`}>
                                                Empezar Ahora
                                            </Link>
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* CTA Section */}
            <section className="py-24 bg-primary/[0.02] border-y border-primary/5 text-center">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="heading-h2 mb-4">¿Listo para dar el siguiente paso?</h2>
                    <p className="max-w-[600px] mx-auto mt-4 mb-10 text-body text-muted-foreground">
                        Únete a cientos de profesionales que ya han transformado su vida y carrera con nuestros programas conscientemente diseñados.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Button asChild size="lg" className="px-10">
                            <Link href="/login?redirect=/formacion">Inscribirme Ahora</Link>
                        </Button>
                        <Button asChild variant="secondary" size="lg" className="px-10">
                            <Link href="/servicios">Conocer Servicios</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
