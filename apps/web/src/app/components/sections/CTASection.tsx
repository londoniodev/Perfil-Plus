import LeadForm from "../LeadForm/LeadForm";

export function CTASection() {
    return (
        <section
            id="agendar"
            style={{
                padding: "8rem 0",
                textAlign: "center",
                position: "relative",
                overflow: "hidden"
            }}
        >
            <div style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle at center, rgba(91,141,239,0.15), transparent 70%)",
                zIndex: -1
            }} />

            <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: "600px", margin: "0 auto" }}>
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
