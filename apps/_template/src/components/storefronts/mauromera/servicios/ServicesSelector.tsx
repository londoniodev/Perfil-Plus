"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@alvarosky/ui";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@alvarosky/ui";
import { cn } from "@/lib/utils";
import { GLASS_CARD_STYLES, GLASS_CARD_HOVER } from "@/constants/styles";
import {
    IconBuilding,
    IconCompass,
    IconHeart,
    IconCheck,
    IconCalendar,
    IconAward as IconGraduationCap,
    IconUsers,
    IconExternalLink
} from "@alvarosky/ui";

// --- Components Helpers ---

const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="text-center mb-12">
        <h2 className="heading-h2 mb-4">{title}</h2>
        <p className="text-body max-w-2xl mx-auto">
            {subtitle}
        </p>
    </div>
);

const FeatureList = ({ items, iconColor = "var(--primary)" }: { items: string[], iconColor?: string }) => (
    <ul className="flex flex-col gap-3 text-left">
        {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 shrink-0" style={{ color: iconColor }}>
                    <IconCheck className="w-4 h-4" />
                </span>
                <span className="text-foreground/90">{item}</span>
            </li>
        ))}
    </ul>
);

// --- Content Components ---

const ContentEmpresas = ({ color = "hsl(var(--primary))" }: { color?: string }) => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SectionHeading
            title="Consultoría organizacional & desarrollo"
            subtitle="Cultura clara. Liderazgo humano. Equipos que conversan mejor y sostienen resultados. Transformamos la dinámica interna para potenciar el negocio."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className={cn(GLASS_CARD_STYLES, "h-full")}>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">¿Te suena familiar?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[
                        { text: "Estrategia clara, pero cultura desconectada.", author: "CEO frustrado" },
                        { text: "Líderes operativos, pero sin herramientas humanas.", author: "RRHH" },
                        { text: "Silos entre áreas que frenan la agilidad.", author: "Gerencia" },
                        { text: "Alta rotación de talento clave.", author: "Equipo" }
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="p-3 rounded-lg border border-l-4 bg-background/50 text-sm italic"
                            style={{ borderLeftColor: color, borderColor: "var(--border)" }}
                        >
                            "{item.text}"
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className={cn(GLASS_CARD_STYLES, "h-full")}>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Nuestra Intervención</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6 text-sm">
                        No entregamos PDFs que nadie lee. Diseñamos experiencias y acompañamientos que cambian comportamientos.
                    </p>
                    <FeatureList iconColor={color} items={[
                        "Diagnóstico de cultura y clima (más allá de la encuesta).",
                        "Desarrollo de habilidades conversacionales para líderes.",
                        "Alineación de equipos directivos (Team Coaching).",
                        "Diseño de rituales y artefactos culturales.",
                        "Gestión del cambio para nuevas implementaciones."
                    ]} />
                </CardContent>
            </Card>
        </div>

        {/* Process Steps */}
        <div className="bg-muted/30 rounded-2xl p-8 mb-12">
            <h3 className="heading-h2 text-center mb-10">Cómo trabajamos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { step: "01", title: "Entender", desc: "Diagnóstico profundo y entrevistas." },
                    { step: "02", title: "Diseñar", desc: "Co-creación de la ruta de solución." },
                    { step: "03", title: "Activar", desc: "Talleres, coaching y mentoría." },
                    { step: "04", title: "Medir", desc: "Seguimiento a indicadores de impacto." }
                ].map((s, i) => (
                    <div key={i} className="text-center">
                        <div className="text-3xl font-bold text-muted-foreground/50 mb-2">{s.step}</div>
                        <h4 className="font-bold mb-1" style={{ color }}>{s.title}</h4>
                        <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="text-center mt-12">
            <Button asChild size="lg" style={{ background: color, borderColor: color }} className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <Link
                    href="https://wa.me/573183771838?text=Hola%20Mauro,%20me%20interesa%20consultoría%20para%20empresas."
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <IconCalendar className="mr-2 h-5 w-5" />
                    Agenda reunión de diagnóstico
                </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
                30 min para evaluar si somos el fit correcto.
            </p>
        </div>
    </div>
);

const ContentExplora = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SectionHeading
            title="Explora: Orientación Vocacional y Profesional"
            subtitle="Menos ansiedad. Más claridad. Decisiones de estudio y carrera con información que se entiende y se usa. Tecnología + Humanidad."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className={cn(GLASS_CARD_STYLES, "h-full")}>
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-accent">Para jóvenes y familias</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6 text-sm">
                        La pregunta "¿Qué vas a estudiar?" no tiene que ser una tortura. Transformamos la incertidumbre en un plan de acción concreto.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: <IconGraduationCap />, label: "Estudiantes 10° y 11°" },
                            { icon: <IconUsers />, label: "Universitarios en duda" },
                            { icon: <IconHeart />, label: "Padres que acompañan" },
                            { icon: <IconCompass />, label: "Proyectos de vida" },
                        ].map((tag, i) => (
                            <div key={i} className="flex flex-col items-center justify-center p-4 rounded-lg bg-accent/5 border border-accent/20 text-center gap-2">
                                <span className="text-accent text-2xl">{tag.icon}</span>
                                <span className="text-xs font-medium text-foreground/80">{tag.label}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className={cn(GLASS_CARD_STYLES, "h-full")}>
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-accent">Lo que incluye el programa</CardTitle>
                </CardHeader>
                <CardContent>
                    <FeatureList iconColor="var(--accent)" items={[
                        "Test de perfil vocacional profundo (Intereses + Aptitudes).",
                        "Sesión de análisis y entrega de resultados (Online).",
                        "Acceso a la plataforma Explora con Asistente IA.",
                        "Roadmap de carreras sugeridas y universidades.",
                        "Plan de acción para la toma de decisión final."
                    ]} />
                </CardContent>
            </Card>
        </div>

        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-8 mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 max-w-3xl mx-auto text-center">
                <h3 className="text-xl font-bold text-accent mb-4">
                    ¿Por qué es diferente?
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                    La mayoría de tests te dan una lista fría de carreras. <strong>Explora</strong> combina data precisa con acompañamiento humano. Usamos IA para procesar miles de opciones, pero la decisión la tomas tú con criterio y acompañamiento experto.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent text-black">Data-driven</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-background border border-border text-foreground">100% Personalizado</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-background border border-border text-foreground">Moderno</span>
                </div>
            </div>
        </div>

        <div className="text-center">
            <Button asChild variant="accent" size="lg" className="shadow-lg hover:shadow-xl hover:shadow-accent/20 transition-all hover:-translate-y-1">
                <Link
                    href="https://app.universoexplora.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Iniciar Explora
                    <IconExternalLink className="ml-2 h-4 w-4" />
                </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
                Empieza hoy mismo tu proceso de descubrimiento.
            </p>
        </div>
    </div>
);

const ContentTerapia = ({ color = "hsl(var(--success))" }: { color?: string }) => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SectionHeading
            title="Psicoterapia y coaching"
            subtitle="Un espacio seguro para entenderte, sanar, ordenar y decidir. Más allá del alivio sintomático, buscamos una vida con mayor sentido y agencia."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className={cn(GLASS_CARD_STYLES, "h-full hover:bg-white/[0.06]")}>
                <CardContent className="pt-8 px-6 pb-6 text-center flex flex-col items-center h-full">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500/10 text-green-500 mb-4 text-2xl">
                        <IconHeart />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Clínica & Salud Mental</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Ansiedad, depresión leve, duelos, estrés crónico. Un enfoque compasivo para recuperar tu equilibrio.
                    </p>
                </CardContent>
            </Card>

            <Card className={cn(GLASS_CARD_STYLES, "h-full hover:bg-white/[0.06]")}>
                <CardContent className="pt-8 px-6 pb-6 text-center flex flex-col items-center h-full">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500/10 text-green-500 mb-4 text-2xl">
                        <IconUsers />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Vínculos y Relaciones</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Dificultades de pareja, familia, o patrones repetitivos en cómo te relacionas con los demás.
                    </p>
                </CardContent>
            </Card>

            <Card className={cn(GLASS_CARD_STYLES, "h-full hover:bg-white/[0.06]")}>
                <CardContent className="pt-8 px-6 pb-6 text-center flex flex-col items-center h-full">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500/10 text-green-500 mb-4 text-2xl">
                        <IconCompass />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Coaching & Propósito</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Bloqueos creativos, decisiones de carrera, síndrome del impostor y búsqueda de sentido vital.
                    </p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 bg-white/[0.02] border border-white/5 rounded-2xl p-8 mb-12">
            <div className="md:col-span-3">
                <h3 className="heading-h2 mb-4 text-white">
                    Mi enfoque
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                    Integro herramientas de la <strong>Psicología Profunda</strong>, <strong>Terapia Cognitiva</strong> y <strong>Filosofía Práctica</strong>. No creo en las "curas mágicas", pero sí en el poder de la conversación honesta para transformar la propia narrativa.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                    Las sesiones son espacios de confidencialidad absoluta, escucha activa y preguntas que abren nuevas perspectivas.
                </p>
            </div>
            <div className="md:col-span-2 bg-black/20 rounded-xl p-6 border border-white/5">
                <h4 className="font-bold mb-4" style={{ color }}>Modalidades</h4>
                <ul className="space-y-3 text-sm">
                    <li className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span>Online (Google Meet)</span>
                        <span className="text-muted-foreground text-xs">Global</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span>Presencial</span>
                        <span className="text-muted-foreground text-xs">Cali, Colombia</span>
                    </li>
                    <li className="flex justify-between items-center pt-1">
                        <span>Duración</span>
                        <span className="text-muted-foreground text-xs">50 minutos</span>
                    </li>
                </ul>
            </div>
        </div>

        <div className="text-center">
            <Button asChild size="lg" style={{ background: color, borderColor: color }} className="shadow-lg hover:shadow-xl hover:shadow-green-500/20 transition-all hover:-translate-y-1">
                <Link
                    href="https://wa.me/573183771838?text=Hola%20Mauro,%20me%20interesa%20iniciar%20psicoterapia."
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <IconCalendar className="mr-2 h-5 w-5" />
                    Agendar primera sesión
                </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
                Si tienes dudas sobre qué modalidad es para ti, escríbeme.
            </p>
        </div>
    </div>
);

export function ServicesSelector() {
    const [activeTab, setActiveTab] = useState<"empresas" | "explora" | "psicoterapia">("empresas");

    useEffect(() => {
        const hash = window.location.hash.replace("#", "");
        if (hash === "empresas") setActiveTab("empresas");
        else if (hash === "explora") setActiveTab("explora");
        else if (hash === "bienestar" || hash === "psicoterapia") setActiveTab("psicoterapia");
    }, []);

    const tabs = [
        { id: "empresas", label: "Empresas", icon: <IconBuilding />, color: "hsl(var(--primary))" },
        { id: "explora", label: "Explora", icon: <IconCompass />, color: "hsl(var(--accent))" },
        { id: "psicoterapia", label: "Psicoterapia", icon: <IconHeart />, color: "hsl(var(--success))" },
    ];

    const currentTabColor = tabs.find(t => t.id === activeTab)?.color || "var(--primary)";

    return (
        <section className="relative pb-20 pt-0 md:pb-32 md:pt-0 overflow-hidden">
            {/* Background Glows */}
            <div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[150px] opacity-20 pointer-events-none transition-colors duration-700"
                style={{ background: currentTabColor }}
            />

            <div className="container relative z-10">
                {/* Selector Tabs */}
                <div className="flex justify-center mb-16">
                    <div className="flex gap-2 p-1 rounded-full bg-muted/50 border border-border">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex items-center rounded-full transition-all duration-300 font-medium text-sm",
                                        isActive ? "gap-2.5 px-6 py-2.5 text-white" : "p-2.5"
                                    )}
                                    style={{
                                        background: isActive ? tab.color : "transparent",
                                        color: isActive ? (tab.id === "explora" ? "black" : "white") : tab.color,
                                    }}
                                >
                                    <span className="text-lg">{tab.icon}</span>
                                    {isActive && <span>{tab.label}</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div>
                    {activeTab === "empresas" && <ContentEmpresas color="hsl(var(--primary))" />}
                    {activeTab === "explora" && <ContentExplora />}
                    {activeTab === "psicoterapia" && <ContentTerapia color="hsl(var(--success))" />}
                </div>
            </div>
        </section>
    );
}
