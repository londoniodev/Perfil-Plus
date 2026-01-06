import Link from "next/link";

// Inline SVG icons for clean, professional look
const IconBrain = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

const IconSparkles = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const IconCpu = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

const IconBuilding = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" />
    <path d="M12 10h.01" /><path d="M12 14h.01" />
    <path d="M16 10h.01" /><path d="M16 14h.01" />
    <path d="M8 10h.01" /><path d="M8 14h.01" />
  </svg>
);

const IconCompass = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const IconHeart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconPencil = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const IconZap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconQuote = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.1">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </svg>
);

const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section
        className="section"
        style={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          paddingTop: "120px",
        }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "5rem",
            alignItems: "center",
          }}
        >
          <div className="animate-reveal">
            <h1
              className="section-title"
              style={{
                fontSize: "4rem",
                marginBottom: "1.5rem",
              }}
            >
              Psicología, experiencias y tecnología para transformar <br />
              <span className="gradient-text">decisiones y cultura.</span>
            </h1>

            <p
              className="section-subtitle"
              style={{ marginBottom: "3rem" }}
            >
              Acompaño a personas, equipos y organizaciones a construir claridad interna y
              resultados sostenibles, con procesos profundos y aplicables a la vida real.
            </p>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem" }}>
              <Link href="#agendar" className="btn btn-primary">
                <IconCalendar />
                Agendar
              </Link>
              <Link href="#servicios" className="btn btn-secondary">
                Ver servicios
                <IconArrowRight />
              </Link>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--foreground-muted)", fontFamily: "var(--font-mono)" }}>
              +10 años acompañando procesos de cambio.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
            <div style={{
              position: "absolute",
              inset: "-20px",
              background: "radial-gradient(circle, rgba(91,141,239,0.2) 0%, transparent 70%)",
              filter: "blur(40px)",
              zIndex: -1
            }} />
            <div
              className="card glow-hover"
              style={{
                width: "400px",
                height: "500px",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--foreground-muted)",
                fontSize: "1rem",
                overflow: "hidden"
              }}
            >
              {/* Fallback pattern instead of text */}
              <div className="grid-pattern" style={{ width: "100%", height: "100%", opacity: 0.5 }}></div>
              <span style={{ position: "absolute" }}>Foto de Mauro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section
        style={{
          padding: "2rem 0",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          background: "rgba(15, 20, 25, 0.4)",
          backdropFilter: "blur(5px)"
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <p style={{
            marginBottom: "1.5rem",
            color: "var(--foreground-muted)",
            fontSize: "0.9rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em"
          }}>
            Áreas de impacto
          </p>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1rem" }}>
            {[
              "Cultura Organizacional",
              "Liderazgo Consciente",
              "Orientación Vocacional",
              "Psicoterapia Clínica",
              "Talleres Experienciales",
            ].map((item, i) => (
              <span key={i} className="badge" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--foreground-muted)" }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section" id="sobre-mi">
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr",
            gap: "5rem",
            alignItems: "center",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              aspectRatio: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--foreground-muted)",
              position: "relative"
            }}
          >
            <div className="grid-pattern" style={{ position: "absolute", inset: 0, opacity: 0.3 }}></div>
            Foto de Mauro
          </div>

          <div>
            <h2 className="section-title">Soy Mauro Mera</h2>
            <p
              className="section-subtitle"
              style={{
                marginBottom: "2.5rem",
                color: "var(--foreground)",
              }}
            >
              Psicólogo, consultor organizacional y coach. Integro psicología, pedagogía
              experiencial y herramientas digitales (incluida IA) para diseñar experiencias de
              transformación profundas, claras y accionables.
            </p>
            <Link href="#metodo" className="btn btn-ghost">
              Conocer mi enfoque
              <IconArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Proposal Section */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <h2 className="section-title">Lo humano y lo medible</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Decisiones conscientes, cultura saludable y cuidado del mundo interno.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {[
              {
                icon: <IconBrain />,
                title: "Psicología aplicada",
                desc: "Comprender lo que pasa adentro para actuar mejor afuera.",
              },
              {
                icon: <IconSparkles />,
                title: "Diseño de experiencias",
                desc: "Talleres y procesos que se viven, no solo se entienden.",
              },
              {
                icon: <IconCpu />,
                title: "Tecnología e IA",
                desc: "Claridad, seguimiento y lenguaje simple para decisiones complejas.",
              },
            ].map((item, i) => (
              <div key={i} className="card glow-hover" style={{ textAlign: "center" }}>
                <div className="icon-box" style={{ margin: "0 auto 1.5rem" }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
                  {item.title}
                </h3>
                <p style={{ color: "var(--foreground-muted)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section" id="servicios">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <h2 className="section-title">Rutas de acompañamiento</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Soluciones diseñadas para tu momento actual.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {/* Card 1 - Empresas */}
            <div className="card">
              <div className="icon-box" style={{ marginBottom: "1.5rem" }}>
                <IconBuilding />
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
                Empresas
              </h3>
              <p style={{ color: "var(--foreground-muted)", marginBottom: "2rem", minHeight: "3rem" }}>
                Alineación de cultura, liderazgo y equipos con resultados de negocio.
              </p>
              <ul style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {["Cultura y cambio", "Escuelas de liderazgo", "Talleres de equipo"].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--foreground)", fontSize: "0.95rem" }}>
                    <span style={{ color: "var(--primary)" }}><IconCheck /></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="#agendar" className="btn btn-secondary" style={{ width: "100%" }}>
                Ver detalles
              </Link>
            </div>

            {/* Card 2 - Explora (Featured) */}
            <div className="card card-featured">
              <div className="badge" style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "rgba(232, 168, 56, 0.2)" }}>
                Destacado
              </div>
              <div className="icon-box icon-box-accent" style={{ marginBottom: "1.5rem" }}>
                <IconCompass />
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
                Explora
              </h3>
              <p style={{ color: "var(--foreground-muted)", marginBottom: "2rem", minHeight: "3rem" }}>
                Orientación vocacional potenciada con IA para decisiones sin ansiedad.
              </p>
              <ul style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {["Evaluación 360°", "Sesiones 1 a 1", "App de resultados"].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--foreground)", fontSize: "0.95rem" }}>
                    <span style={{ color: "var(--accent)" }}><IconCheck /></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="#agendar" className="btn btn-accent" style={{ width: "100%" }}>
                Iniciar Explora
              </Link>
            </div>

            {/* Card 3 - Terapia */}
            <div className="card">
              <div className="icon-box icon-box-success" style={{ marginBottom: "1.5rem" }}>
                <IconHeart />
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
                Psicoterapia
              </h3>
              <p style={{ color: "var(--foreground-muted)", marginBottom: "2rem", minHeight: "3rem" }}>
                Espacio clínico para ordenar el mundo interno y sanar.
              </p>
              <ul style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {["Ansiedad y estrés", "Duelo y crisis", "Vínculos sanos"].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--foreground)", fontSize: "0.95rem" }}>
                    <span style={{ color: "var(--success)" }}><IconCheck /></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="#agendar" className="btn btn-secondary" style={{ width: "100%" }}>
                Agendar sesión
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Method Section */}
      <section className="section" id="metodo">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <h2 className="section-title">El proceso</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Claridad desde el primer paso hasta el resultado.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "2rem",
            position: "relative"
          }}>
            {/* Connector Line */}
            <div style={{
              position: "absolute",
              top: "32px",
              left: "10%",
              right: "10%",
              height: "2px",
              background: "linear-gradient(90deg, transparent, var(--border-light) 20%, var(--border-light) 80%, transparent)",
              zIndex: -1
            }} />

            {[
              { num: "01", icon: <IconSearch />, title: "Diagnóstico", desc: "Entender el fondo." },
              { num: "02", icon: <IconPencil />, title: "Diseño", desc: "Crear la ruta." },
              { num: "03", icon: <IconZap />, title: "Acción", desc: "Ejecutar en la realidad." },
              { num: "04", icon: <IconChart />, title: "Medición", desc: "Evaluar y ajustar." },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: "center", background: "var(--background)", padding: "1rem" }}>
                <div className="icon-box" style={{ margin: "0 auto 1.5rem", borderRadius: "50%", width: "64px", height: "64px" }}>
                  {step.icon}
                </div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  {step.title}
                </h3>
                <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section section-alt">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 className="section-title">Voces de la experiencia</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {[
              {
                quote: "El proceso me ayudó a entender patrones que llevaba años repitiendo. Ahora tomo decisiones con más claridad.",
                author: "Confidencial",
                role: "Psicoterapia",
              },
              {
                quote: "Mauro logró que nuestro equipo de liderazgo conversara de lo importante, no solo de lo urgente.",
                author: "Gerente de Talento",
                role: "Sector Tech",
              },
              {
                quote: "Explora le dio a mi hijo herramientas para decidir su carrera con información real, no con ansiedad.",
                author: "Padre de familia",
                role: "Orientación Vocacional",
              },
            ].map((test, i) => (
              <div key={i} className="card" style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem", opacity: 0.1 }}>
                  <IconQuote />
                </div>
                <p
                  style={{
                    fontSize: "1.125rem",
                    color: "var(--foreground)",
                    marginBottom: "2rem",
                    lineHeight: 1.6,
                    fontStyle: "italic",
                    paddingTop: "1.5rem",
                  }}
                >
                  "{test.quote}"
                </p>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: "0.25rem", fontSize: "1rem" }}>{test.author}</p>
                  <span className="badge" style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }}>{test.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
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

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h2
            className="section-title"
            style={{
              fontSize: "3.5rem",
              marginBottom: "1.5rem",
            }}
          >
            ¿Hablamos?
          </h2>
          <p
            className="section-subtitle"
            style={{
              marginBottom: "3rem",
              margin: "0 auto 3rem",
            }}
          >
            Si estás en un punto de decisión, busquemos la mejor ruta juntos.
          </p>
          <Link
            href="mailto:contacto@mauromera.com"
            className="btn btn-primary"
            style={{
              fontSize: "1.125rem",
              padding: "1.25rem 2.5rem",
            }}
          >
            <IconCalendar />
            Agendar Diagnóstico
          </Link>
        </div>
      </section>
    </>

  );
}