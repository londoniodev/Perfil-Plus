import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Servicios | Empresas, Explora y Psicoterapia — Mauro Mera",
    description: "Tres rutas de acompañamiento: consultoría organizacional, orientación vocacional con IA (Explora) y psicoterapia/coaching. Procesos claros, humanos y medibles.",
};

export default function ServiciosPage() {
    return (
        <>
            {/* Hero */}
            <section style={{
                paddingTop: '120px',
                paddingBottom: '80px',
                background: 'linear-gradient(135deg, var(--background) 0%, #e2e8f0 100%)',
                textAlign: 'center',
            }}>
                <div className="container">
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: 800,
                        marginBottom: '1rem',
                    }}>
                        Trabaja conmigo
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--secondary)',
                        marginBottom: '2rem',
                        maxWidth: '600px',
                        margin: '0 auto 2rem',
                    }}>
                        Elige la ruta que mejor encaje con tu momento: organización, vocación o mundo interno.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <a href="#empresas" className="btn btn-secondary">Empresas</a>
                        <a href="#explora" className="btn btn-accent">Explora</a>
                        <a href="#terapia" className="btn btn-secondary">Psicoterapia</a>
                    </div>
                </div>
            </section>

            {/* Sección 1 — Empresas */}
            <section id="empresas" className="section">
                <div className="container">
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 className="section-title">Consultoría organizacional y programas de desarrollo</h2>
                        <p className="section-subtitle" style={{ marginBottom: '3rem' }}>
                            Cultura clara. Liderazgo humano. Equipos que conversan mejor y sostienen resultados.
                        </p>

                        {/* Problemas típicos */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                                Problemas típicos que resolvemos
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {[
                                    '"Tenemos estrategia, pero la cultura no acompaña."',
                                    '"El liderazgo está agotado y la conversación se volvió difícil."',
                                    '"Los equipos funcionan… pero no confían."',
                                    '"Queremos vender mejor sin romper el bienestar."',
                                ].map((problem, i) => (
                                    <div key={i} style={{
                                        padding: '1rem',
                                        background: 'var(--background)',
                                        borderRadius: '0.75rem',
                                        fontStyle: 'italic',
                                        color: 'var(--secondary)',
                                    }}>
                                        {problem}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Qué incluye */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Qué incluye</h3>
                            <ul style={{ color: 'var(--secondary)', lineHeight: 2, paddingLeft: '1.25rem' }}>
                                <li>Diagnóstico (cultura, liderazgo, clima, conversaciones)</li>
                                <li>Diseño de programa a la medida</li>
                                <li>Talleres experienciales</li>
                                <li>Acompañamiento 1:1 a líderes clave</li>
                                <li>Seguimiento, medición y entregables</li>
                            </ul>
                        </div>

                        {/* Beneficios */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Beneficios</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {[
                                    'Cultura coherente con la estrategia',
                                    'Liderazgo preparado para conversaciones difíciles',
                                    'Equipos con compromiso y propósito',
                                    'Programas medibles con seguimiento real',
                                ].map((benefit, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>✓</span>
                                        <span style={{ color: 'var(--secondary)' }}>{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '2rem',
                            borderRadius: '1rem',
                            textAlign: 'center',
                        }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                ¿Cómo empezamos?
                            </h3>
                            <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
                                Reunión de diagnóstico (sin costo) → Propuesta a la medida → Kick-off + plan de trabajo
                            </p>
                            <a href="#agendar" className="btn" style={{ background: 'white', color: 'var(--primary)' }}>
                                Agenda una reunión de diagnóstico sin costo
                            </a>
                            <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '1rem' }}>
                                En 30–45 min entendemos tu contexto y te digo la ruta más útil.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección 2 — Explora */}
            <section id="explora" className="section" style={{ background: 'var(--card-bg)' }}>
                <div className="container">
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{
                            display: 'inline-block',
                            background: 'var(--accent)',
                            color: 'white',
                            padding: '0.25rem 1rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            marginBottom: '1rem',
                        }}>
                            DESTACADO
                        </div>

                        <h2 className="section-title">Explora: orientación vocacional con acompañamiento humano e IA</h2>
                        <p className="section-subtitle" style={{ marginBottom: '3rem' }}>
                            Menos ansiedad. Más claridad. Decisiones de estudio y carrera con información que se entiende y se usa.
                        </p>

                        {/* Para quién */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Para quién es</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {[
                                    'Estudiantes de últimos grados',
                                    'Universitarios en duda o cambio',
                                    'Familias que quieren acompañar mejor',
                                    'Colegios/universidades/entidades',
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ color: 'var(--accent)', fontSize: '1.25rem' }}>→</span>
                                        <span style={{ color: 'var(--secondary)' }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Qué incluye */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Qué incluye Explora</h3>
                            <ul style={{ color: 'var(--secondary)', lineHeight: 2, paddingLeft: '1.25rem' }}>
                                <li>Evaluaciones vocacionales y perfil personal</li>
                                <li>Sesiones 1:1 con el joven (y familia si se requiere)</li>
                                <li>App con IA para organizar resultados, explicar fortalezas y sugerir rutas</li>
                                <li>Informe final con recomendaciones prácticas</li>
                            </ul>
                        </div>

                        {/* Resultados */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Resultados que buscamos</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {[
                                    'Decisiones más conscientes y menos impulsivas',
                                    'Menos riesgo de deserción y frustración',
                                    'Lenguaje claro para familia + estudiante',
                                    'Integración real: humano + tecnología',
                                ].map((result, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ color: 'var(--accent)', fontSize: '1.25rem' }}>✓</span>
                                        <span style={{ color: 'var(--secondary)' }}>{result}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTAs */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <a href="#agendar" className="btn btn-accent" style={{ flex: 1 }}>
                                Agendar Explora (Familias)
                            </a>
                            <a href="#agendar" className="btn btn-secondary" style={{ flex: 1 }}>
                                Solicitar programa institucional
                            </a>
                        </div>

                        {/* FAQ */}
                        <div style={{ marginTop: '3rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Preguntas frecuentes</h3>
                            {[
                                { q: '¿Cuánto dura el proceso?', a: 'Depende del caso; usualmente 4-6 sesiones + informe.' },
                                { q: '¿La IA reemplaza al acompañamiento?', a: 'No: traduce y organiza, el proceso es guiado y humano.' },
                                { q: '¿Es solo para elegir carrera?', a: 'También sirve para reorientación y cambios.' },
                            ].map((faq, i) => (
                                <div key={i} style={{
                                    padding: '1.25rem',
                                    background: 'var(--background)',
                                    borderRadius: '0.75rem',
                                    marginBottom: '1rem',
                                }}>
                                    <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{faq.q}</p>
                                    <p style={{ color: 'var(--secondary)' }}>{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección 3 — Psicoterapia */}
            <section id="terapia" className="section">
                <div className="container">
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 className="section-title">Psicoterapia y coaching personal para una vida con más sentido</h2>
                        <p className="section-subtitle" style={{ marginBottom: '3rem' }}>
                            Un espacio seguro para entenderte, sanar, ordenar y decidir.
                        </p>

                        {/* Lo que trabajamos */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Lo que trabajamos</h3>
                            <ul style={{ color: 'var(--secondary)', lineHeight: 2, paddingLeft: '1.25rem' }}>
                                <li>Ansiedad, estrés, duelo, crisis</li>
                                <li>Vínculos: pareja, familia, afectividad</li>
                                <li>Patrones repetidos e historia personal</li>
                                <li>Decisiones importantes y transiciones</li>
                                <li>Éxito externo vs bienestar interno (profesionales/emprendedores)</li>
                            </ul>
                        </div>

                        {/* Formato */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Formato</h3>
                            <ul style={{ color: 'var(--secondary)', lineHeight: 2, paddingLeft: '1.25rem' }}>
                                <li>Sesiones 1:1 (presencial u online según disponibilidad)</li>
                                <li>Procesos breves o acompañamientos de mediano plazo</li>
                                <li>Integración: psicoterapia + coaching + psicoeducación + ejercicios</li>
                            </ul>
                        </div>

                        {/* Beneficios */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Beneficios</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {[
                                    'Claridad emocional y mental',
                                    'Mejor gestión de conflictos y límites',
                                    'Más serenidad para decidir',
                                    'Sentirte "más en casa" contigo',
                                ].map((benefit, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ color: '#10b981', fontSize: '1.25rem' }}>✓</span>
                                        <span style={{ color: 'var(--secondary)' }}>{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div style={{ textAlign: 'center' }}>
                            <a href="#agendar" className="btn btn-primary">
                                Agendar primera sesión
                            </a>
                            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginTop: '1rem' }}>
                                Si no sabes por dónde empezar, lo armamos juntos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section id="agendar" style={{
                padding: '6rem 0',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                color: 'white',
                textAlign: 'center',
            }}>
                <div className="container">
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                        ¿No estás seguro cuál ruta necesitas?
                    </h2>
                    <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                        Agenda y te recomiendo la mejor opción según tu momento (empresa, Explora o psicoterapia/coaching).
                    </p>
                    <a href="mailto:contacto@mauromera.com" className="btn" style={{
                        background: 'white',
                        color: 'var(--primary)',
                        fontSize: '1.125rem',
                        padding: '1rem 2.5rem',
                    }}>
                        Agendar
                    </a>
                </div>
            </section>
        </>
    );
}
