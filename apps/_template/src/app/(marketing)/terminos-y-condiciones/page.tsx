import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Términos y Condiciones",
    description: "Términos y condiciones de uso de nuestros servicios. Lee detenidamente antes de utilizar nuestra plataforma.",
    robots: {
        index: true,
        follow: false,
    },
    alternates: {
        canonical: "/terminos-y-condiciones",
    },
};

export default function TermsAndConditionsPage() {
    return (
        <main style={{ padding: "8rem 0" }}>
            <div className="container">
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <h1 className="heading-h1 mb-12 text-left">
                        Términos y Condiciones
                    </h1>

                    <div className="prose" style={{ color: "var(--foreground-muted)", lineHeight: "1.8" }}>
                        <p style={{ marginBottom: "2rem" }}>
                            Este documento describe los términos y condiciones generales aplicables al acceso y uso de los servicios ofrecidos dentro del sitio web.
                        </p>

                        <h2 className="heading-h2 mt-12 mb-6 text-foreground">
                            1. Aceptación de los Términos
                        </h2>
                        <p style={{ marginBottom: "1rem" }}>
                            Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos términos y condiciones de uso, a todas las leyes aplicables y regulaciones, y acepta que es responsable de cumplir con las leyes locales aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido utilizar o acceder a este sitio.
                        </p>

                        <h2 style={{ color: "var(--foreground)", fontSize: "1.5rem", fontWeight: "600", marginTop: "3rem", marginBottom: "1.5rem" }}>
                            2. Uso de la Licencia
                        </h2>
                        <p style={{ marginBottom: "1rem" }}>
                            Se concede permiso para descargar temporalmente una copia de los materiales en el sitio web para uso visual transitorio personal y no comercial. Esto es la concesión de una licencia, no una transferencia de título, y bajo esta licencia no puede:
                        </p>
                        <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginBottom: "2rem" }}>
                            <li style={{ marginBottom: "0.5rem" }}>Modificar o copiar los materiales.</li>
                            <li style={{ marginBottom: "0.5rem" }}>Utilizar los materiales para fines comerciales o para exhibición pública (comercial o no comercial).</li>
                            <li style={{ marginBottom: "0.5rem" }}>Intentar descompilar o aplicar ingeniería inversa a cualquier software contenido en el sitio web.</li>
                            <li style={{ marginBottom: "0.5rem" }}>Eliminar cualquier derecho de autor u otras anotaciones propietarias de los materiales.</li>
                        </ul>

                        <h2 style={{ color: "var(--foreground)", fontSize: "1.5rem", fontWeight: "600", marginTop: "3rem", marginBottom: "1.5rem" }}>
                            3. Descargo de Responsabilidad
                        </h2>
                        <p style={{ marginBottom: "2rem" }}>
                            Los materiales en el sitio web se proporcionan "tal cual". No ofrecemos garantías, expresas o implícitas, y por la presente renunciamos y negamos todas las demás garantías, incluyendo, sin limitación, garantías implícitas o condiciones de comerciabilidad, idoneidad para un propósito particular, o no infracción de la propiedad intelectual u otra violación de derechos.
                        </p>

                        <h2 style={{ color: "var(--foreground)", fontSize: "1.5rem", fontWeight: "600", marginTop: "3rem", marginBottom: "1.5rem" }}>
                            4. Limitación de Responsabilidad
                        </h2>
                        <p style={{ marginBottom: "1rem" }}>
                            En ningún caso seremos responsables de ningún daño (incluyendo, sin limitación, daños por pérdida de datos o ganancias, o debido a la interrupción del negocio) que surja del uso o la incapacidad de usar los materiales en este sitio web.
                        </p>

                        <h2 style={{ color: "var(--foreground)", fontSize: "1.5rem", fontWeight: "600", marginTop: "3rem", marginBottom: "1.5rem" }}>
                            5. Revisiones y Erratas
                        </h2>
                        <p style={{ marginBottom: "2rem" }}>
                            Los materiales que aparecen en el sitio web podrían incluir errores técnicos, tipográficos o fotográficos. No garantizamos que cualquiera de los materiales en el sitio web sean precisos, completos o actuales. Podemos hacer cambios a los materiales contenidos en el sitio web en cualquier momento sin previo aviso.
                        </p>

                        <h2 style={{ color: "var(--foreground)", fontSize: "1.5rem", fontWeight: "600", marginTop: "3rem", marginBottom: "1.5rem" }}>
                            6. Modificaciones de los Términos de Uso
                        </h2>
                        <p style={{ marginBottom: "2rem" }}>
                            Podemos revisar estos términos de uso del sitio web en cualquier momento sin previo aviso. Al utilizar este sitio web, usted acepta estar sujeto a la versión actual de estos Términos y Condiciones de Uso.
                        </p>

                        <h2 style={{ color: "var(--foreground)", fontSize: "1.5rem", fontWeight: "600", marginTop: "3rem", marginBottom: "1.5rem" }}>
                            7. Ley Aplicable
                        </h2>
                        <p style={{ marginBottom: "2rem" }}>
                            Cualquier reclamo relacionado con este sitio web se regirá por las leyes de la jurisdicción aplicable sin considerar sus disposiciones sobre conflictos de leyes.
                        </p>

                        <p style={{ fontSize: "0.9rem", marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
                            Última actualización: Marzo 2026
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
