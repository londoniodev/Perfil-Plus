import { headers } from "next/headers";
import { Metadata } from "next";
import { getDynamicUrl } from "@/lib/network";

export async function generateMetadata(): Promise<Metadata> {
    const headersList = await headers();
    const urlBase = getDynamicUrl(headersList);
    const host = new URL(urlBase).host;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    let tenantName = "Nuestra plataforma";

    try {
        const res = await fetch(`${baseUrl}/tenant/branding`, {
            headers: {
                "x-forwarded-host": host,
                "x-tenant-slug": headersList.get("x-tenant-slug") || "",
            },
            next: { revalidate: 3600 }
        });
        if (res.ok) {
            const data = await res.json();
            tenantName = data.businessName || tenantName;
        }
    } catch {}

    return {
        title: `Términos y Condiciones - ${tenantName}`,
        description: `Términos y condiciones de uso de los servicios de ${tenantName}. Lee detenidamente antes de utilizar nuestra plataforma.`,
        robots: { index: true, follow: false },
        alternates: { canonical: "/terminos-y-condiciones" }
    };
}

export default async function TermsAndConditionsPage() {
    const headersList = await headers();
    const urlBase = getDynamicUrl(headersList);
    const host = new URL(urlBase).host;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

    let tenantName = "este sitio web";
    let businessEmail = "el administrador";

    try {
        const res = await fetch(`${baseUrl}/tenant/branding`, {
            headers: {
                "x-forwarded-host": host,
                "x-tenant-slug": headersList.get("x-tenant-slug") || "",
            },
            next: { revalidate: 3600 }
        });

        if (res.ok) {
            const data = await res.json();
            tenantName = data.businessName || tenantName;
            businessEmail = data.businessEmail || businessEmail;
        }
    } catch (err) {}

    const currentDate = new Date().toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric"
    });

    return (
        <main className="py-24 md:py-32">
            <div className="container max-w-4xl px-4">
                <div className="mx-auto">
                    <h1 className="heading-h1 mb-12 text-left">
                        Términos y Condiciones
                    </h1>

                    <div className="prose prose-zinc prose-invert max-w-none text-muted-foreground/90 leading-relaxed">
                        <p className="mb-8">
                            Este documento describe los términos y condiciones generales aplicables al acceso y uso de los servicios ofrecidos dentro de <strong className="text-foreground">{tenantName}</strong>.
                        </p>

                        <h2 className="text-2xl font-bold mt-12 mb-6 text-foreground">
                            1. Aceptación de los Términos
                        </h2>
                        <p className="mb-6">
                            Al acceder y utilizar este sitio web de <strong className="text-foreground">{tenantName}</strong>, usted acepta estar sujeto a estos términos y condiciones de uso, a todas las leyes aplicables y regulaciones, y acepta que es responsable de cumplir con las leyes locales aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido utilizar o acceder a este sitio.
                        </p>

                        <h2 className="text-2xl font-bold mt-12 mb-6 text-foreground">
                            2. Uso de la Licencia
                        </h2>
                        <p className="mb-4">
                            Se concede permiso para descargar temporalmente una copia de los materiales en el sitio web para uso visual transitorio personal y no comercial. Esto es la concesión de una licencia, no una transferencia de título, y bajo esta licencia no puede:
                        </p>
                        <ul className="list-disc pl-6 mb-8 space-y-2">
                            <li>Modificar o copiar los materiales.</li>
                            <li>Utilizar los materiales para fines comerciales o para exhibición pública (comercial o no comercial).</li>
                            <li>Intentar descompilar o aplicar ingeniería inversa a cualquier software contenido en el sitio web de <strong className="text-foreground">{tenantName}</strong>.</li>
                            <li>Eliminar cualquier derecho de autor u otras anotaciones propietarias de los materiales.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-12 mb-6 text-foreground">
                            3. Descargo de Responsabilidad
                        </h2>
                        <p className="mb-8">
                            Los materiales en el sitio web se proporcionan "tal cual". <strong className="text-foreground">{tenantName}</strong> no ofrece garantías, expresas o implícitas, y por la presente renuncia y niega todas las demás garantías, incluyendo, sin limitación, garantías implícitas o condiciones de comerciabilidad, idoneidad para un propósito particular, o no infracción de la propiedad intelectual u otra violación de derechos.
                        </p>

                        <h2 className="text-2xl font-bold mt-12 mb-6 text-foreground">
                            4. Limitación de Responsabilidad
                        </h2>
                        <p className="mb-6">
                            En ningún caso <strong className="text-foreground">{tenantName}</strong> será responsable de ningún daño (incluyendo, sin limitación, daños por pérdida de datos o ganancias, o debido a la interrupción del negocio) que surja del uso o la incapacidad de usar los materiales en este sitio web.
                        </p>

                        <h2 className="text-2xl font-bold mt-12 mb-6 text-foreground">
                            5. Revisiones y Erratas
                        </h2>
                        <p className="mb-8">
                            Los materiales que aparecen en el sitio web podrían incluir errores técnicos, tipográficos o fotográficos. No garantizamos que cualquiera de los materiales en el sitio web sean precisos, completos o actuales. Podemos hacer cambios a los materiales contenidos en el sitio web en cualquier momento sin previo aviso.
                        </p>

                        <h2 className="text-2xl font-bold mt-12 mb-6 text-foreground">
                            6. Modificaciones de los Términos de Uso
                        </h2>
                        <p className="mb-8">
                            Podemos revisar estos términos de uso del sitio web en cualquier momento sin previo aviso. Al utilizar este sitio web, usted acepta estar sujeto a la versión actual de estos Términos y Condiciones de Uso.
                        </p>

                        <h2 className="text-2xl font-bold mt-12 mb-6 text-foreground">
                            7. Contacto y Soporte
                        </h2>
                        <p className="mb-8">
                            Si tiene alguna duda sobre estos términos, puede contactarnos s través de <strong className="text-foreground">{businessEmail}</strong>.
                        </p>

                        <p className="text-xs mt-16 pt-6 border-t border-border/40 text-muted-foreground/60 capitalize">
                            Última actualización: {currentDate}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
