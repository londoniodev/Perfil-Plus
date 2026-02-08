import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <main className="container py-32 flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">
        Landing Page ({siteConfig.name})
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl">
        Espacio reservado para contenido público del cliente.
        <br />
        Edita <code>src/app/page.tsx</code> para comenzar.
      </p>
    </main>
  );
}
