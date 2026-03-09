import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Política de Privacidad",
    description: "Política de privacidad de Mauro Mera. Información sobre cómo recopilamos, usamos y protegemos tus datos personales.",
    robots: {
        index: true,
        follow: false,
    },
    alternates: {
        canonical: "/politica-de-privacidad",
    },
};

export default function PrivacyPolicyPage() {
    return (
        <main style={{ padding: "8rem 0" }}>
            <div className="container">
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <h1 className="heading-h1 mb-12 text-left">
                        Política de Privacidad
                    </h1>

                    <div className="prose" style={{ color: "var(--foreground-muted)", lineHeight: "1.8" }}>
                        <p style={{ marginBottom: "2rem" }}>
                            Nos tomamos muy en serio la privacidad de tus datos. Esta política describe cómo recopilamos, usamos y protegemos tu información personal cuando interactúas con nuestro sitio web y servicios, productos y herramientas de gestión provistos.
                        </p>

                        <h2 className="heading-h2 mt-12 mb-6 text-foreground">
                            1. Información que recopilamos
                        </h2>
                        <p style={{ marginBottom: "1rem" }}>
                            Podemos recopilar la siguiente información cuando utilizas nuestros servicios, completas formularios de contacto o interactúas con nuestras herramientas:
                        </p>
                        <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginBottom: "2rem" }}>
                            <li style={{ marginBottom: "0.5rem" }}>Información de identificación personal: Nombre, dirección de correo electrónico, número de teléfono.</li>
                            <li style={{ marginBottom: "0.5rem" }}>Información profesional: Cargo, empresa, intereses profesionales.</li>
                            <li style={{ marginBottom: "0.5rem" }}>Datos de uso: Información sobre cómo navegas en nuestro sitio web.</li>
                        </ul>

                        <h2 style={{ color: "var(--foreground)", fontSize: "1.5rem", fontWeight: "600", marginTop: "3rem", marginBottom: "1.5rem" }}>
                            2. Cómo utilizamos tu información
                        </h2>
                        <p style={{ marginBottom: "1rem" }}>
                            Utilizamos la información recopilada para los siguientes propósitos:
                        </p>
                        <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginBottom: "2rem" }}>
                            <li style={{ marginBottom: "0.5rem" }}>Proveer y gestionar nuestros servicios de consultoría y psicología.</li>
                            <li style={{ marginBottom: "0.5rem" }}>Responder a tus consultas y agendar citas o diagnósticos.</li>
                            <li style={{ marginBottom: "0.5rem" }}>Mejorar nuestros servicios y la experiencia del usuario en nuestra plataforma.</li>
                            <li style={{ marginBottom: "0.5rem" }}>Enviar comunicaciones relevantes sobre actualizaciones, nuevos servicios o contenido educativo (siempre con tu consentimiento).</li>
                        </ul>

                        <h2 style={{ color: "var(--foreground)", fontSize: "1.5rem", fontWeight: "600", marginTop: "3rem", marginBottom: "1.5rem" }}>
                            3. Protección de datos y seguridad
                        </h2>
                        <p style={{ marginBottom: "2rem" }}>
                            Implementamos medidas de seguridad técnicas y organizativas adecuadas para proteger tus datos personales contra el acceso no autorizado, la alteración, divulgación o destrucción. Tus datos se almacenan en servidores seguros y solo son accesibles por personal autorizado.
                        </p>

                        <h2 style={{ color: "var(--foreground)", fontSize: "1.5rem", fontWeight: "600", marginTop: "3rem", marginBottom: "1.5rem" }}>
                            4. Tus derechos
                        </h2>
                        <p style={{ marginBottom: "1rem" }}>
                            Tienes derecho a:
                        </p>
                        <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginBottom: "2rem" }}>
                            <li style={{ marginBottom: "0.5rem" }}>Acceder a los datos personales que tenemos sobre ti.</li>
                            <li style={{ marginBottom: "0.5rem" }}>Solicitar la corrección de cualquier dato inexacto.</li>
                            <li style={{ marginBottom: "0.5rem" }}>Solicitar la eliminación de tus datos personales.</li>
                            <li style={{ marginBottom: "0.5rem" }}>Oponerte o restringir el procesamiento de tus datos.</li>
                        </ul>

                        <h2 style={{ color: "var(--foreground)", fontSize: "1.5rem", fontWeight: "600", marginTop: "3rem", marginBottom: "1.5rem" }}>
                            5. Contacto
                        </h2>
                        <p style={{ marginBottom: "2rem" }}>
                            Si tienes alguna pregunta sobre nuestra Política de Privacidad o deseas ejercer tus derechos, por favor contáctanos a través de nuestros canales oficiales o envíanos un mensaje mediante el formulario de contacto en este sitio web.
                        </p>

                        <p style={{ fontSize: "0.9rem", marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
                            Última actualización: Enero 2026
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

