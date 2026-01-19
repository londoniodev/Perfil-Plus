import Link from "next/link";
import { getThemes } from "@/lib/api";
import { Theme } from "@/types/lms";
import { Metadata } from "next";
import { IconBook } from "@alvarosky/ui";
import { ClientToast } from "@alvarosky/ui";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@alvarosky/ui";
import { Badge } from "@alvarosky/ui";
import { PageHeader, AdaptiveImage } from "@alvarosky/ui";

export const metadata: Metadata = {
    title: "Cursos | Mauro Mera",
    description: "Programa de formación en psicología, liderazgo y desarrollo personal.",
};

export default async function CursosPage() {
    let themes: Theme[] = [];
    let error = false;

    try {
        themes = await getThemes();
    } catch (e) {
        error = true;
        // console.error logged on server, but we want toast on client
    }

    return (
        <div className="min-h-screen bg-background pb-12">
            {error && <ClientToast message="Error al cargar los cursos. Por favor intenta más tarde." />}

            <PageHeader
                className="container px-4 mx-auto pt-32 md:pt-32 mb-12"
                title="Programa de Formación"
                description="Explora nuestros temas de formación en psicología, liderazgo y desarrollo personal para transformar tu vida y carrera."
            />

            <section className="py-16">
                <div className="container px-4">
                    {error ? (
                        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-border">
                            <p>No se pudieron cargar los cursos. Inténtalo más tarde.</p>
                        </div>
                    ) : themes.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-border">
                            <p>Próximamente nuevos cursos disponibles.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {themes.map((theme) => (
                                <ThemeCard key={theme.id} theme={theme} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function ThemeCard({ theme }: { theme: Theme }) {
    return (
        <Link href={`/cursos/${theme.slug}`} className="block group h-full">
            <Card className="h-full overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="relative">
                    {theme.coverImage ? (
                        <AdaptiveImage
                            src={theme.coverImage}
                            alt={theme.title}
                            aspectRatio="video"
                            className="transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full aspect-video flex items-center justify-center bg-primary/5 text-primary/40 group-hover:text-primary/60 transition-colors">
                            <IconBook size={48} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                </div>
                <CardHeader className="pb-3">
                    <CardTitle className="heading-h3 group-hover:text-primary transition-colors">{theme.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                    <CardDescription className="text-body line-clamp-2 text-sm">
                        {theme.description}
                    </CardDescription>
                </CardContent>
                <CardFooter className="pt-0 text-sm text-muted-foreground flex gap-4 border-t border-border/50 p-6 mt-auto">
                    <div className="flex items-center gap-1.5">
                        <IconBook size={14} />
                        <span>{theme._count?.courses || 0} cursos</span>
                    </div>
                    {theme.evaluation && (
                        <Badge variant="outline" className="ml-auto text-xs font-normal bg-primary/5 border-primary/20 text-primary">
                            Evaluación incluida
                        </Badge>
                    )}
                </CardFooter>
            </Card>
        </Link>
    );
}


