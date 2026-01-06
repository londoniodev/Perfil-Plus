import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"; // Added Playfair_Display
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif", // Define variable for serif font
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mauro Mera | Psicología, cultura y decisiones conscientes",
  description: "Psicólogo, consultor organizacional y coach. Acompaño a personas, equipos y organizaciones a tomar decisiones conscientes, fortalecer su cultura y cuidar su bienestar.",
  keywords: ["psicólogo", "consultor organizacional", "coach", "psicoterapia", "orientación vocacional", "liderazgo", "cultura organizacional"],
  authors: [{ name: "Mauricio Mera" }],
  openGraph: {
    title: "Mauro Mera | Psicología, cultura y decisiones conscientes",
    description: "Psicólogo, consultor organizacional y coach. Acompaño a personas, equipos y organizaciones a tomar decisiones conscientes.",
    type: "website",
    locale: "es_CO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(15, 20, 25, 0.6)", // More transparent
        backdropFilter: "blur(16px) saturate(180%)", // Stronger blur
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)", // Subtler border
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "80px", // Slightly taller for elegance
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--foreground)",
            textDecoration: "none",
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-serif)", // Use serif for logo
          }}
        >
          Mauro Mera
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
          <Link
            href="/"
            style={{
              color: "var(--foreground-muted)",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: 500,
              transition: "color 0.2s",
            }}
            className="hover:text-white"
          >
            Inicio
          </Link>
          <Link
            href="/portafolio"
            style={{
              color: "var(--foreground-muted)",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: 500,
            }}
            className="hover:text-white"
          >
            Portafolio
          </Link>
          <Link
            href="/servicios"
            style={{
              color: "var(--foreground-muted)",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: 500,
            }}
            className="hover:text-white"
          >
            Servicios
          </Link>
          <Link
            href="#agendar"
            className="btn btn-primary"
            style={{ padding: "0.7rem 1.4rem", fontSize: "0.9rem" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.5rem" }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Agendar
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer
      style={{
        background: "var(--background-secondary)",
        borderTop: "1px solid var(--border)",
        padding: "5rem 0 3rem",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "4rem",
            marginBottom: "4rem",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.25rem", fontFamily: "var(--font-serif)" }}>
              Mauro Mera
            </h3>
            <p style={{ color: "var(--foreground-muted)", fontSize: "1rem", lineHeight: 1.7, maxWidth: "300px" }}>
              Transformar el mundo empieza por cuidar el mundo interno.
            </p>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, marginBottom: "1.25rem", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--foreground-muted)" }}>
              Enlaces
            </h4>
            <nav style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Link href="/" style={{ color: "var(--foreground-muted)", textDecoration: "none", fontSize: "1rem" }}>
                Inicio
              </Link>
              <Link href="/portafolio" style={{ color: "var(--foreground-muted)", textDecoration: "none", fontSize: "1rem" }}>
                Portafolio
              </Link>
              <Link href="/servicios" style={{ color: "var(--foreground-muted)", textDecoration: "none", fontSize: "1rem" }}>
                Servicios
              </Link>
              <Link href="#agendar" style={{ color: "var(--foreground-muted)", textDecoration: "none", fontSize: "1rem" }}>
                Contacto
              </Link>
            </nav>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, marginBottom: "1.25rem", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--foreground-muted)" }}>
              Legal
            </h4>
            <nav style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Link href="/privacidad" style={{ color: "var(--foreground-muted)", textDecoration: "none", fontSize: "1rem" }}>
                Política de privacidad
              </Link>
            </nav>
            <div
              style={{
                marginTop: "2rem",
                padding: "1.25rem",
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: "0.75rem",
                border: "1px solid var(--border)",
              }}
            >
              <p style={{ color: "var(--foreground-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                Si estás en una emergencia o riesgo, busca ayuda inmediata en tu línea local de emergencias.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "2.5rem",
            textAlign: "center",
            color: "var(--secondary)",
            fontSize: "0.9rem",
          }}
        >
          © {new Date().getFullYear()} Mauro Mera. Todos los derechos reservados.
          <br />
          <span style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: "0.75rem", display: "inline-block" }}>
            Desarrollado y Diseñado por{" "}
            <a
              href="https://portafolio.alvarolondoño.dev"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--foreground)", textDecoration: "none", fontWeight: 500, borderBottom: "1px solid var(--border)", paddingBottom: "1px" }}
            >
              Alvaro Londoño
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
