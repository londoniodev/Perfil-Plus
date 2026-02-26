import { TenantMarketingData } from "@/types/marketing";
import { Fill } from "@alvarosky/ui";
// Ensure these components exist or replace them with standard UI elements as needed. 
// For demonstration, standard HTML/Tailwind is used if the exact custom component is missing.

export default function DefaultLanding({ data }: { data: TenantMarketingData }) {
    return (
        <main className="w-full relative bg-background text-foreground overflow-x-hidden pt-20">
            <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                                {data.heroTitle}
                            </h1>
                            {data.heroSubtitle && (
                                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl relative z-10">
                                    {data.heroSubtitle}
                                </p>
                            )}
                        </div>
                        {data.ctaText && (
                            <div className="space-x-4">
                                <a
                                    href={data.ctaUrl || "#"}
                                    className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {data.ctaText}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Fill>
                {data.services && data.services.length > 0 && (
                    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 flex items-center justify-center">
                        <div className="container px-4 md:px-6">
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {data.services.map((service) => (
                                    <div key={service.id} className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
                                        <h3 className="text-xl font-bold">{service.title}</h3>
                                        <p className="mt-2 text-muted-foreground">{service.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </Fill>
        </main>
    );
}
