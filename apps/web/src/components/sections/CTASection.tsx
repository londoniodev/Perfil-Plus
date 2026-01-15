import LeadForm from "../LeadForm/LeadForm";

export function CTASection() {
    return (
        <section id="agendar" className="relative py-20 md:py-32 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none" />

            <div className="container relative z-10 max-w-3xl mx-auto">
                <LeadForm
                    source="cta-home"
                    title="¿Hablamos?"
                    subtitle="Si estás en un punto de decisión, busquemos la mejor ruta juntos."
                    buttonText="Agendar Diagnóstico"
                    showMessage={true}
                    showPhone={true}
                />
            </div>
        </section>
    );
}
