import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mauro Mera | Psicología, cultura y decisiones conscientes",
  description: "Psicólogo, consultor organizacional y coach. Acompaño a personas, equipos y organizaciones a tomar decisiones conscientes, fortalecer su cultura y cuidar su bienestar, integrando psicología, experiencias y tecnología (IA).",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

// Header Component
function Header() {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'rgba(250, 250, 250, 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
      }}>
        <a href="/" style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--foreground)',
          textDecoration: 'none',
        }}>
          Mauro Mera
        </a>

        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }}>
          <a href="/" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 500 }}>Inicio</a>
          <a href="/portafolio" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 500 }}>Portafolio</a>
          <a href="/servicios" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 500 }}>Servicios</a>
          <a href="#agendar" className="btn btn-primary" style={{ padding: '0.625rem 1.5rem' }}>
            Agendar
          </a>
        </nav>
      </div>
    </header>
  );
}

// Footer Component
function Footer() {
  return (
    <footer style={{
      background: 'var(--card-bg)',
      borderTop: '1px solid var(--border)',
      padding: '4rem 0 2rem',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem',
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Mauro Mera</h3>
            <p style={{ color: 'var(--secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
              Transformar el mundo empieza por cuidar el mundo interno.
            </p>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Enlaces</h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="/" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>Inicio</a>
              <a href="/portafolio" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>Portafolio</a>
              <a href="/servicios" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>Servicios</a>
              <a href="#agendar" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>Contacto</a>
            </nav>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Legal</h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="/privacidad" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>Política de privacidad</a>
            </nav>
            <p style={{
              color: 'var(--secondary)',
              fontSize: '0.8rem',
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'rgba(0,0,0,0.03)',
              borderRadius: '0.5rem',
            }}>
              Si estás en una emergencia o riesgo, busca ayuda inmediata en tu línea local de emergencias.
            </p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '2rem',
          textAlign: 'center',
          color: 'var(--secondary)',
          fontSize: '0.875rem',
        }}>
          © {new Date().getFullYear()} Mauro Mera. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
