import LeadForm from "../lead-form/LeadForm";

export function CTASection() {
    return (
        <section id="agendar" className="relative py-20 md:py-32 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none" />

            <div className="container relative z-10 max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                        ¿Hablamos?
                    </h2>
                </div>

                <LeadForm
                    source="cta-home"
                    title=""
                    subtitle="Si estás en un punto de decisión, busquemos la mejor ruta juntos."
                    buttonText="Agendar Diagnóstico"
                    showMessage={true}
                    showPhone={true}
                />
            </div>
        </section>
    );
}
