import { Suspense } from "react"
import type { Metadata } from "next"
import { MetaConectarClient } from "./meta-conectar-client"

export const metadata: Metadata = {
  title: "Conectar WhatsApp Business | Embedded Signup",
  description: "Vincula tu cuenta de WhatsApp Business con tu plataforma a través del registro integrado de Meta.",
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<{
    tenantId?: string
    returnUrl?: string
  }>
}

export default async function MetaConectarPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { tenantId, returnUrl } = params

  if (!tenantId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <section className="max-w-md w-full text-center space-y-4" role="alert">
          <h1 className="text-2xl font-bold text-destructive">
            Error de Configuración
          </h1>
          <p className="text-muted-foreground">
            No se proporcionó un identificador de tenant válido.
            Contacta al administrador de tu plataforma.
          </p>
          <p className="text-xs text-muted-foreground/60 font-mono">
            Parámetro requerido: ?tenantId=tu_id
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Conectar WhatsApp Business
          </h1>
          <p className="text-sm text-muted-foreground">
            Vincula tu cuenta de Meta para activar el asistente de WhatsApp en tu negocio.
          </p>
        </header>

        <Suspense fallback={
          <div className="text-center text-sm text-muted-foreground animate-pulse">
            Cargando...
          </div>
        }>
          <MetaConectarClient tenantId={tenantId} returnUrl={returnUrl} />
        </Suspense>

        <footer className="text-center">
          <p className="text-[10px] text-muted-foreground/50">
            Este proceso es seguro y utiliza la autenticación oficial de Meta.
          </p>
        </footer>
      </div>
    </main>
  )
}
