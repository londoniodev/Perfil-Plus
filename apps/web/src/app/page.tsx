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
        className="grid-pattern"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          paddingTop: "72px",
          background: "linear-gradient(135deg, var(--background) 0%, var(--gradient-end) 100%)",
        }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          <div className="animate-fade-in-up">
            <h1
              style={{
                fontSize: "3.25rem",
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: "1.5rem",
                letterSpacing: "-0.03em",
              }}
            >
              Psicología, experiencias y tecnología para transformar{" "}
              <span className="gradient-text">decisiones, cultura y bienestar</span>.
            </h1>

            <p
              style={{
                fontSize: "1.125rem",
                color: "var(--foreground-muted)",
                marginBottom: "2.5rem",
                lineHeight: 1.8,
                maxWidth: "540px",
              }}
            >
              Acompaño a personas, equipos y organizaciones a construir claridad interna y
              resultados sostenibles, con procesos profundos y aplicables a la vida real.
            </p>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
              <Link href="#agendar" className="btn btn-primary">
                <IconCalendar />
                Agendar
              </Link>
              <Link href="#servicios" className="btn btn-secondary">
                Ver servicios
                <IconArrowRight />
              </Link>
            </div>

            <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
              Más de 10 años acompañando procesos de cambio y decisiones difíciles.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              className="glow"
              style={{
                width: "380px",
                height: "480px",
                background: "linear-gradient(145deg, var(--card-bg) 0%, var(--background-secondary) 100%)",
                borderRadius: "1.5rem",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--foreground-muted)",
                fontSize: "1rem",
              }}
            >
              Foto de Mauro
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section
        style={{
          padding: "3rem 0",
          background: "var(--background-secondary)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="container">
          <p
            style={{
              textAlign: "center",
              color: "var(--foreground-muted)",
              fontSize: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            Trabajo con personas y organizaciones que quieren evolucionar sin perderse a sí mismas.
          </p>

          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            {[
              "Cultura organizacional",
              "Liderazgo y equipos",
              "Orientación vocacional",
              "Psicoterapia y coaching",
              "Talleres experienciales",
            ].map((item, i) => (
              <span key={i} className="tag">
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
            gap: "4rem",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "1",
              background: "linear-gradient(145deg, var(--card-bg) 0%, var(--background-secondary) 100%)",
              borderRadius: "1.5rem",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--foreground-muted)",
            }}
          >
            Foto de Mauro
          </div>

          <div>
            <h2 className="section-title">Soy Mauro Mera</h2>
            <p
              style={{
                fontSize: "1.125rem",
                color: "var(--foreground-muted)",
                lineHeight: 1.8,
                marginBottom: "2rem",
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
      <section className="section section-alt">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 className="section-title">Acompañamiento que une lo humano con lo medible</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Decisiones conscientes, cultura saludable y cuidado del mundo interno: con
              psicología, diseño de experiencias y tecnología.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
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
                title: "Tecnología e IA con criterio",
                desc: "Claridad, seguimiento y lenguaje simple para decisiones complejas.",
              },
            ].map((item, i) => (
              <div key={i} className="card" style={{ textAlign: "center" }}>
                <div className="icon-box" style={{ margin: "0 auto 1.5rem" }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                  {item.title}
                </h3>
                <p style={{ color: "var(--foreground-muted)", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section" id="servicios">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 className="section-title">Servicios</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Tres rutas de acompañamiento según tu momento y necesidad.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {/* Card 1 - Empresas */}
            <div className="card">
              <div className="icon-box" style={{ marginBottom: "1.5rem" }}>
                <IconBuilding />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Consultoría organizacional
              </h3>
              <p style={{ color: "var(--foreground-muted)", marginBottom: "1.5rem", lineHeight: 1.7, fontSize: "0.95rem" }}>
                Acompaño empresas que quieren alinear cultura, liderazgo y equipos con sus resultados.
              </p>
              <ul style={{ marginBottom: "1.5rem" }}>
                {["Cultura y cambio cultural", "Escuela de ventas y servicio", "Liderazgo y mandos medios", "Talleres experienciales"].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--foreground-muted)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    <span style={{ color: "var(--primary)" }}><IconCheck /></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="#agendar" className="btn btn-primary" style={{ width: "100%" }}>
                Reunión sin costo
              </Link>
            </div>

            {/* Card 2 - Explora (Featured) */}
            <div className="card card-featured" style={{ position: "relative" }}>
              <div className="badge" style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)" }}>
                Destacado
              </div>
              <div className="icon-box icon-box-accent" style={{ marginBottom: "1.5rem" }}>
                <IconCompass />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Explora: Orientación vocacional
              </h3>
              <p style={{ color: "var(--foreground-muted)", marginBottom: "1.5rem", lineHeight: 1.7, fontSize: "0.95rem" }}>
                Un proceso probado (10+ años) potenciado con app e IA para decisiones claras.
              </p>
              <ul style={{ marginBottom: "1.5rem" }}>
                {["Evaluaciones vocacionales", "Sesiones 1 a 1 (joven + familia)", "App con IA para resultados", "Informe con recomendaciones"].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--foreground-muted)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    <span style={{ color: "var(--accent)" }}><IconCheck /></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="#agendar" className="btn btn-accent" style={{ width: "100%" }}>
                Agendar Explora
              </Link>
            </div>

            {/* Card 3 - Terapia */}
            <div className="card">
              <div className="icon-box icon-box-success" style={{ marginBottom: "1.5rem" }}>
                <IconHeart />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Psicoterapia y Coaching
              </h3>
              <p style={{ color: "var(--foreground-muted)", marginBottom: "1.5rem", lineHeight: 1.7, fontSize: "0.95rem" }}>
                Un espacio para ordenar tu mundo interno, sanar patrones y avanzar con propósito.
              </p>
              <ul style={{ marginBottom: "1.5rem" }}>
                {["Ansiedad, estrés, duelo, crisis", "Vínculos y patrones", "Decisiones y transiciones"].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--foreground-muted)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    <span style={{ color: "var(--success)" }}><IconCheck /></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="#agendar" className="btn btn-primary" style={{ width: "100%" }}>
                Agendar primera sesión
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Method Section */}
      <section className="section section-alt" id="metodo">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 className="section-title">Un proceso claro para cambios reales</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem" }}>
            {[
              { num: "01", icon: <IconSearch />, title: "Diagnóstico", desc: "Qué pasa, qué importa, qué duele." },
              { num: "02", icon: <IconPencil />, title: "Diseño", desc: "Sesiones, talleres y herramientas." },
              { num: "03", icon: <IconZap />, title: "Acción", desc: "Lo aplicamos en vida real." },
              { num: "04", icon: <IconChart />, title: "Seguimiento", desc: "Medición, ajustes y sostén." },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div className="step-number" style={{ margin: "0 auto 1.5rem" }}>
                  {step.num}
                </div>
                <div style={{ color: "var(--primary)", display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
                  {step.icon}
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  {step.title}
                </h3>
                <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href="#agendar" className="btn btn-primary">
              Hablemos de tu caso
              <IconArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio Teaser */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 className="section-title">Casos y experiencias</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Resultados, aprendizajes y transformaciones.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {[
              { title: "Programa de cultura y liderazgo", client: "Empresa del sector financiero" },
              { title: "Escuela de ventas y servicio", client: "Empresa de retail" },
              { title: "Proceso Explora institucional", client: "Institución educativa" },
            ].map((caso, i) => (
              <div key={i} className="card">
                <div
                  style={{
                    width: "100%",
                    height: "160px",
                    background: "linear-gradient(145deg, var(--primary-dark) 0%, var(--primary) 100%)",
                    borderRadius: "0.75rem",
                    marginBottom: "1.5rem",
                  }}
                />
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  {caso.title}
                </h3>
                <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>{caso.client}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/portafolio" className="btn btn-ghost">
              Ver portafolio completo
              <IconArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section section-alt">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 className="section-title">Lo que dicen quienes han trabajado conmigo</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {[
              {
                quote: "El proceso me ayudó a entender patrones que llevaba años repitiendo. Ahora tomo decisiones con más claridad.",
                author: "Anónimo",
                role: "Proceso de psicoterapia",
              },
              {
                quote: "Mauro logró que nuestro equipo de liderazgo conversara de lo importante, no solo de lo urgente.",
                author: "Gerente de Talento Humano",
                role: "Empresa de servicios",
              },
              {
                quote: "Explora le dio a mi hijo herramientas para decidir su carrera con información real, no con ansiedad.",
                author: "Padre de familia",
                role: "Proceso Explora",
              },
            ].map((test, i) => (
              <div key={i} className="card" style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: "1rem", left: "1.5rem" }}>
                  <IconQuote />
                </div>
                <p
                  style={{
                    fontSize: "1rem",
                    color: "var(--foreground)",
                    marginBottom: "1.5rem",
                    lineHeight: 1.7,
                    fontStyle: "italic",
                    paddingTop: "1rem",
                  }}
                >
                  "{test.quote}"
                </p>
                <div>
                  <p style={{ fontWeight: 600, marginBottom: "0.25rem", fontSize: "0.95rem" }}>{test.author}</p>
                  <p style={{ color: "var(--foreground-muted)", fontSize: "0.85rem" }}>{test.role}</p>
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
          padding: "6rem 0",
          background: "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)",
          textAlign: "center",
        }}
      >
        <div className="container">
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              marginBottom: "1rem",
              color: "white",
            }}
          >
            Si estás en un punto de decisión, este es un buen momento para acompañarte
          </h2>
          <p
            style={{
              fontSize: "1.125rem",
              opacity: 0.9,
              marginBottom: "2rem",
              maxWidth: "600px",
              margin: "0 auto 2rem",
              color: "white",
            }}
          >
            Te respondo con la mejor ruta según tu caso: empresa, Explora o terapia.
          </p>
          <Link
            href="mailto:contacto@mauromera.com"
            className="btn"
            style={{
              background: "white",
              color: "var(--primary-dark)",
              fontSize: "1rem",
              padding: "1rem 2rem",
            }}
          >
            <IconCalendar />
            Agendar ahora
          </Link>
        </div>
      </section>
    </>
  );
}
