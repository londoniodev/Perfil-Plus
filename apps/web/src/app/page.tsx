export default function Home() {
  return (
    <>
      {/* Bloque 1 — Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '72px',
        background: 'linear-gradient(135deg, var(--background) 0%, #e2e8f0 100%)',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center',
        }}>
          <div className="animate-fade-in-up">
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              color: 'var(--foreground)',
            }}>
              Psicología, experiencias y tecnología para transformar{' '}
              <span style={{ color: 'var(--primary)' }}>decisiones, cultura y bienestar</span>.
            </h1>

            <p style={{
              fontSize: '1.25rem',
              color: 'var(--secondary)',
              marginBottom: '2rem',
              lineHeight: 1.7,
            }}>
              Acompaño a personas, equipos y organizaciones a construir claridad interna y resultados sostenibles, con procesos profundos y aplicables a la vida real.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <a href="#agendar" className="btn btn-primary">
                Agendar
              </a>
              <a href="#servicios" className="btn btn-secondary">
                Ver servicios
              </a>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>
              Más de 10 años acompañando procesos de cambio y decisiones difíciles.
            </p>
          </div>

          <div className="animate-fade-in-up animate-delay-200" style={{
            display: 'flex',
            justifyContent: 'center',
          }}>
            {/* Placeholder para foto/video de Mauro */}
            <div style={{
              width: '400px',
              height: '500px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
              borderRadius: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: 600,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}>
              Foto de Mauro
            </div>
          </div>
        </div>
      </section>

      {/* Bloque 2 — Barra de confianza */}
      <section style={{
        padding: '4rem 0',
        background: 'var(--card-bg)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container">
          <p style={{
            textAlign: 'center',
            color: 'var(--secondary)',
            fontSize: '1.125rem',
            marginBottom: '2rem',
          }}>
            Trabajo con personas y organizaciones que quieren evolucionar sin perderse a sí mismas.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '2rem',
          }}>
            {[
              'Cultura organizacional',
              'Liderazgo y equipos',
              'Orientación vocacional (IA)',
              'Psicoterapia y coaching',
              'Talleres experienciales',
            ].map((item, i) => (
              <div key={i} style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--background)',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                fontWeight: 500,
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bloque 3 — Quién soy */}
      <section className="section" id="sobre-mi">
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr',
          gap: '4rem',
          alignItems: 'center',
        }}>
          <div style={{
            width: '100%',
            aspectRatio: '1',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
            borderRadius: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
          }}>
            Foto de Mauro
          </div>

          <div>
            <h2 className="section-title">Soy Mauro Mera</h2>
            <p style={{
              fontSize: '1.125rem',
              color: 'var(--secondary)',
              lineHeight: 1.8,
              marginBottom: '2rem',
            }}>
              Psicólogo, consultor organizacional y coach. Integro psicología, pedagogía experiencial y herramientas digitales (incluida IA) para diseñar experiencias de transformación profundas, claras y accionables.
            </p>
            <a href="#metodo" className="btn btn-secondary">
              Conocer mi enfoque
            </a>
          </div>
        </div>
      </section>

      {/* Bloque 4 — Propuesta central */}
      <section className="section" style={{ background: 'var(--card-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>
              Acompañamiento que une lo humano con lo medible
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Decisiones conscientes, cultura saludable y cuidado del mundo interno: con psicología, diseño de experiencias y tecnología.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
          }}>
            {[
              {
                title: 'Psicología aplicada',
                desc: 'Comprender lo que pasa adentro para actuar mejor afuera.',
                icon: '🧠',
              },
              {
                title: 'Diseño de experiencias',
                desc: 'Talleres y procesos que se viven, no solo se entienden.',
                icon: '✨',
              },
              {
                title: 'Tecnología e IA con criterio',
                desc: 'Claridad, seguimiento y lenguaje simple para decisiones complejas.',
                icon: '🤖',
              },
            ].map((item, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bloque 5 — Servicios principales */}
      <section className="section" id="servicios">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Servicios</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Tres rutas de acompañamiento según tu momento y necesidad.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
          }}>
            {/* Card 1 — Empresas */}
            <div className="card">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                marginBottom: '1.5rem',
              }}>
                🏢
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Consultoría organizacional
              </h3>
              <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                Acompaño empresas que quieren alinear cultura, liderazgo y equipos con sus resultados. Programas a la medida con diagnóstico, talleres experienciales y seguimiento.
              </p>
              <ul style={{ color: 'var(--secondary)', marginBottom: '1.5rem', paddingLeft: '1.25rem' }}>
                <li>Cultura y cambio cultural</li>
                <li>Escuela de ventas y servicio</li>
                <li>Liderazgo y mandos medios</li>
                <li>Talleres: comunicación, propósito, bienestar</li>
              </ul>
              <a href="#agendar" className="btn btn-primary" style={{ width: '100%' }}>
                Reunión de diagnóstico sin costo
              </a>
            </div>

            {/* Card 2 — Explora */}
            <div className="card" style={{ border: '2px solid var(--accent)' }}>
              <div style={{
                position: 'absolute' as const,
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--accent)',
                color: 'white',
                padding: '0.25rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}>
                DESTACADO
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                marginBottom: '1.5rem',
              }}>
                🎯
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Explora: Orientación vocacional con IA
              </h3>
              <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                Un proceso probado (10+ años) potenciado con una app e IA que traduce resultados complejos en información clara, cercana y accionable.
              </p>
              <ul style={{ color: 'var(--secondary)', marginBottom: '1.5rem', paddingLeft: '1.25rem' }}>
                <li>Evaluaciones vocacionales y perfil</li>
                <li>Sesiones 1 a 1 (joven + familia)</li>
                <li>App con IA para explicar resultados</li>
                <li>Informe final con recomendaciones</li>
              </ul>
              <a href="#agendar" className="btn btn-accent" style={{ width: '100%' }}>
                Agendar Explora
              </a>
            </div>

            {/* Card 3 — Terapia */}
            <div className="card">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                marginBottom: '1.5rem',
              }}>
                💚
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Psicoterapia y Coaching
              </h3>
              <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                Un espacio para ordenar tu mundo interno, sanar patrones, tomar decisiones y avanzar con más serenidad y propósito.
              </p>
              <ul style={{ color: 'var(--secondary)', marginBottom: '1.5rem', paddingLeft: '1.25rem' }}>
                <li>Ansiedad, estrés, duelo, crisis</li>
                <li>Vínculos, historia personal, patrones</li>
                <li>Decisiones importantes y transiciones</li>
              </ul>
              <a href="#agendar" className="btn btn-primary" style={{ width: '100%' }}>
                Agendar primera sesión
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Bloque 6 — Cómo trabajo */}
      <section className="section" id="metodo" style={{ background: 'var(--card-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Un proceso claro para cambios reales</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem',
          }}>
            {[
              { num: '01', title: 'Diagnóstico y claridad', desc: 'Qué pasa, qué importa, qué duele.' },
              { num: '02', title: 'Diseño de experiencia', desc: 'Sesiones/talleres + herramientas.' },
              { num: '03', title: 'Acción y práctica', desc: 'Lo aplicamos en vida real.' },
              { num: '04', title: 'Seguimiento', desc: 'Medición, ajustes y sostén.' },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'var(--primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {step.title}
                </h3>
                <p style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <a href="#agendar" className="btn btn-primary">
              Hablemos de tu caso
            </a>
          </div>
        </div>
      </section>

      {/* Bloque 7 — Portafolio teaser */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Casos y experiencias</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Resultados, aprendizajes y transformaciones en organizaciones y procesos individuales.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
          }}>
            {[
              { title: 'Programa de cultura y liderazgo', client: 'Empresa del sector financiero' },
              { title: 'Escuela de ventas y servicio', client: 'Empresa de retail' },
              { title: 'Proceso Explora', client: 'Institución educativa' },
            ].map((caso, i) => (
              <div key={i} className="card">
                <div style={{
                  width: '100%',
                  height: '180px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                  borderRadius: '0.75rem',
                  marginBottom: '1.5rem',
                }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {caso.title}
                </h3>
                <p style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
                  {caso.client}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a href="/portafolio" className="btn btn-secondary">
              Ver portafolio completo
            </a>
          </div>
        </div>
      </section>

      {/* Bloque 8 — Testimonios */}
      <section className="section" style={{ background: 'var(--card-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Lo que dicen quienes han trabajado conmigo</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
          }}>
            {[
              {
                quote: '"El proceso me ayudó a entender patrones que llevaba años repitiendo. Ahora tomo decisiones con más claridad."',
                author: 'Anónimo',
                role: 'Proceso de psicoterapia',
              },
              {
                quote: '"Mauro logró que nuestro equipo de liderazgo conversara de lo importante, no solo de lo urgente."',
                author: 'Gerente de Talento Humano',
                role: 'Empresa de servicios',
              },
              {
                quote: '"Explora le dio a mi hijo herramientas para decidir su carrera con información real, no con ansiedad."',
                author: 'Padre de familia',
                role: 'Proceso Explora',
              },
            ].map((test, i) => (
              <div key={i} className="card">
                <p style={{
                  fontSize: '1.05rem',
                  fontStyle: 'italic',
                  color: 'var(--foreground)',
                  marginBottom: '1.5rem',
                  lineHeight: 1.7,
                }}>
                  {test.quote}
                </p>
                <div>
                  <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{test.author}</p>
                  <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>{test.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a href="#agendar" className="btn btn-primary">
              Quiero empezar
            </a>
          </div>
        </div>
      </section>

      {/* Bloque 9 — CTA final */}
      <section id="agendar" style={{
        padding: '6rem 0',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
        color: 'white',
        textAlign: 'center',
      }}>
        <div className="container">
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}>
            Si estás en un punto de decisión, este es un buen momento para acompañarte
          </h2>
          <p style={{
            fontSize: '1.125rem',
            opacity: 0.9,
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem',
          }}>
            Te respondo con la mejor ruta según tu caso: empresa, Explora o terapia.
          </p>
          <a href="mailto:contacto@mauromera.com" className="btn" style={{
            background: 'white',
            color: 'var(--primary)',
            fontSize: '1.125rem',
            padding: '1rem 2.5rem',
          }}>
            Agendar ahora
          </a>
        </div>
      </section>
    </>
  );
}
