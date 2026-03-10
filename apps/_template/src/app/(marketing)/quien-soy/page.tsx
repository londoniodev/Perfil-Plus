import { headers } from "next/headers";
import { Fill } from "@alvarosky/ui";
import { AboutContent as DeborahAbout } from "@/components/storefronts/deborahmoscoso/quien-soy/AboutContent";

export const metadata = {
    title: "Quién Soy",
    description: "Conoce mi historia, mi filosofía y cómo conecto la nutrición consciente con el entrenamiento para Transformarte."
};

export default async function QuienSoyPage() {
    const headersList = await headers();
    const tenantSlug = headersList.get("x-tenant-slug") || "";
    const tenantId = headersList.get("x-tenant-id") || "";

    if (tenantSlug === "soydeborasoysaludable" || tenantId === "cm7mman6x000208jsf3h9h2k1") {
        return <DeborahAbout />;
    }

    return (
        <section className="relative pb-20 pt-16 md:pb-32 md:pt-24 min-h-[80vh] flex flex-col items-center justify-center">
            <div className="container max-w-4xl px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-8 text-fuchsia-500">¿Quién Soy?</h1>
                <div className="prose prose-zinc prose-invert max-w-none mx-auto text-left md:text-center">
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
                        Soy Deborah Moscoso, experta en transformación física y mental. Mi filosofía se basa en que el verdadero cambio comienza desde adentro, conectando la nutrición consciente con el entrenamiento de alto rendimiento.
                    </p>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        A través de mis programas de coaching y mi línea de suplementación, ayudo a las personas a desbloquear su mejor versión, superar sus límites y construir un estilo de vida sostenible que puedan mantener para siempre.
                    </p>
                </div>
            </div>
        </section>
    );
}
