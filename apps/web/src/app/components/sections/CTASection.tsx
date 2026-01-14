import LeadForm from "../LeadForm/LeadForm";
import styles from "@/app/styles/sections.module.css";

export function CTASection() {
    return (
        <section id="agendar" className={styles.ctaSection}>
            <div className={styles.ctaBg} />

            <div className={`container ${styles.ctaContainer}`}>
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
