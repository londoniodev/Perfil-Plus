import { BookOpen, ChevronRight } from "lucide-react";
import { Badge, Button, Card, CardHeader, CardTitle, CardContent, CardFooter } from "@alvarosky/ui";
import Link from "next/link";

interface Theme {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    teaserVideo?: string;
    price?: number | null;
    firstCourseId?: string;
    courses: any[];
}

export default function TrainingCatalog({ themes }: { themes: Theme[] }) {
    return (
        <main className="min-h-screen bg-zinc-950 pt-24 pb-20 relative overflow-hidden">
            {/* Ambient background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <header className="relative z-10 container px-6 py-16 text-center mx-auto">
                <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-4 py-1">
                    Academia Digital
                </Badge>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                    Programas de Formación
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-zinc-400">
                    Potencia tus habilidades con nuestros programas exclusivos, diseñados para llevar tu desarrollo al siguiente nivel.
                </p>
            </header>

            <div className="container px-6 relative z-10 mx-auto">
                {themes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                        <BookOpen className="h-16 w-16 text-zinc-700 mb-4" />
                        <h3 className="text-xl font-semibold text-zinc-300">No hay contenido disponible</h3>
                        <p className="text-zinc-500 mt-2">Vuelve pronto para descubrir nuevos programas.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {themes.map((theme) => (
                            <Card key={theme.id} className="group overflow-hidden bg-zinc-900/40 border-zinc-800 hover:border-primary/30 transition-all duration-300 flex flex-col h-full shadow-2xl">
                                <div className="relative h-56 overflow-hidden bg-zinc-800">
                                    {theme.imageUrl ? (
                                        <img 
                                            src={theme.imageUrl} 
                                            alt={theme.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                            <BookOpen className="h-12 w-12 text-zinc-700" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                                </div>

                                <CardHeader className="pt-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                                            {theme.courses.length} {theme.courses.length === 1 ? 'Curso' : 'Cursos'}
                                        </Badge>
                                        {theme.price === 0 && (
                                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                                Gratis
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
                                        {theme.title}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="flex-grow">
                                    <p className="text-zinc-400 line-clamp-3 leading-relaxed">
                                        {theme.description}
                                    </p>
                                </CardContent>

                                <CardFooter className="pt-2 pb-8 px-6">
                                    <Button asChild className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-base font-bold rounded-xl shadow-lg">
                                        <Link href={`/login?redirect=/mis-cursos`}>
                                            Explorar Programa
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
