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

// Critical: This ensures the page scales correctly on mobile devices
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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

import { Header } from "./components/Header";

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
          className="footer-grid"
        >
          <div style={{ minWidth: "280px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
              <img src="/logo.svg" alt="Mauro Mera Logo" style={{ width: "32px", height: "32px" }} />
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--font-serif)", margin: 0 }}>
                Mauro Mera
              </h3>
            </div>
            <p style={{ color: "var(--foreground-muted)", fontSize: "1rem", lineHeight: 1.7, maxWidth: "300px" }}>
              Transformar el mundo empieza por cuidar el mundo interno.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", minWidth: "280px" }}>
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
                <Link
                  href="https://wa.me/573183771838?text=Hola%20Mauro,%20vengo%20de%20tu%20web%20y%20quisiera%20más%20información."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--foreground-muted)", textDecoration: "none", fontSize: "1rem" }}
                >
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
