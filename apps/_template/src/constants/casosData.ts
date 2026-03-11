/**
 * Datos de casos de estudio para el portafolio.
 * Separados para facilitar mantenimiento y posible carga desde API en el futuro.
 */

import { Caso, CasoResult, CategoriaId } from "@/types/marketing";

export const casos: Caso[] = [
    {
        id: 1,
        titulo: "Programa de cultura y liderazgo",
        cliente: "Empresa del sector financiero",
        categoria: "Empresas",
        color: "#3b82f6",
        contexto: "Una empresa de 500+ empleados enfrentaba desalineación entre la estrategia de crecimiento y la cultura interna.",
        reto: "Alinear la cultura organizacional con los objetivos estratégicos y desarrollar habilidades de liderazgo.",
        intervencion: "Diagnóstico de cultura de 4 semanas, programa de desarrollo de 6 meses con talleres mensuales.",
        resultados: [
            { metric: "85%", label: "Mejora clima" },
            { metric: "30%", label: "Menor rotación" },
            { metric: "100%", label: "Líderes activos" },
        ],
    },
    {
        id: 101,
        titulo: "Cultura de servicio al cliente",
        cliente: "Retail y Moda",
        categoria: "Empresas",
        color: "#3b82f6",
        contexto: "La marca creció rápido pero la experiencia en tienda se volvió inconsistente.",
        reto: "Estandarizar el modelo de servicio sin perder la autenticidad de cada asesor.",
        intervencion: "Diseño de protocolo de servicio + Escuela de anfitriones para 120 colaboradores.",
        resultados: [
            { metric: "+15%", label: "Ticket promedio" },
            { metric: "9.2/10", label: "NPS Cliente" },
            { metric: "Zero", label: "Quejas graves" },
        ],
    },
    {
        id: 102,
        titulo: "Fusión cultural post-adquisición",
        cliente: "Sector Tecnológico",
        categoria: "Empresas",
        color: "#3b82f6",
        contexto: "Dos empresas de software se fusionaron con estilos de trabajo opuestos (ágil vs tradicional).",
        reto: "Crear una nueva identidad cultural compartida y reducir la fricción operativa.",
        intervencion: "Talleres de alineación de valores + Coaching a equipo directivo + Embajadores culturales.",
        resultados: [
            { metric: "100%", label: "Visión unificada" },
            { metric: "Baja", label: "Fuga de talento" },
            { metric: "Rápida", label: "Integración" },
        ],
    },
    {
        id: 103,
        titulo: "Liderazgo para la innovación",
        cliente: "Laboratorio Farmacéutico",
        categoria: "Empresas",
        color: "#3b82f6",
        contexto: "Necesidad de agilizar la toma de decisiones y fomentar la innovación en mandos medios.",
        reto: "Romper silos y empoderar a los líderes para proponer mejoras.",
        intervencion: "Hackathon de soluciones internas + Programa de liderazgo adaptativo.",
        resultados: [
            { metric: "12", label: "Proyectos nuevos" },
            { metric: "40%", label: "Más agilidad" },
            { metric: "Alta", label: "Participación" },
        ],
    },
    {
        id: 2,
        titulo: "Proceso Explora institucional",
        cliente: "Institución educativa",
        categoria: "Explora",
        color: "#f97316",
        contexto: "Colegio con alta ansiedad vocacional en estudiantes de último año, buscando modernizar su departamento de psicología.",
        reto: "Implementar un proceso de orientación vocacional escalable que integrara tecnología y acompañamiento humano.",
        intervencion: "Piloto con 60 estudiantes: evaluaciones, sesiones 1:1, app con IA, talleres con padres.",
        resultados: [
            { metric: "92%", label: "Satisfacción familias" },
            { metric: "80%", label: "Decisión segura" },
            { metric: "Perm.", label: "Programa adoptado" },
        ],
    },
    {
        id: 3,
        titulo: "Transformación de mandos medios",
        cliente: "Empresa de manufactura",
        categoria: "Liderazgo",
        color: "#9c27b0",
        contexto: "Supervisores promovidos por su excelente desempeño técnico, pero sin formación en gestión de personas, generando conflictos.",
        reto: "Desarrollar competencias de liderazgo, comunicación asertiva y resolución de conflictos en 25 supervisores de planta.",
        intervencion: "Programa de 8 meses: taller mensual + coaching grupal + herramientas prácticas de gestión diaria.",
        resultados: [
            { metric: "40%", label: "Menos conflictos" },
            { metric: "4.5/5", label: "Evaluación desempeño" },
            { metric: "25", label: "Líderes formados" },
        ],
    },
    {
        id: 6,
        titulo: "Taller de bienestar y propósito",
        cliente: "Equipo directivo de ONG",
        categoria: "Bienestar",
        color: "#10b981",
        contexto: "Equipo de alto rendimiento con síntomas claros de burnout y desconexión con el propósito original de la organización.",
        reto: "Reconectar al equipo con el impacto de su trabajo y establecer límites saludables de desconexión.",
        intervencion: "Retiro inmersivo de 2 días con metodología experiencial + seguimiento de 3 meses para sostener hábitos.",
        resultados: [
            { metric: "12", label: "Directivos renovados" },
            { metric: "100%", label: "Acuerdos de equipo" },
            { metric: "0", label: "Burnout reportado" },
        ],
    },
    {
        id: 5,
        titulo: "Proceso Explora familiar",
        cliente: "Familia (caso anónimo)",
        categoria: "Explora",
        color: "#f97316",
        contexto: "Joven de 17 años bloqueado en su decisión de carrera, con mucha presión familiar y miedo a equivocarse.",
        reto: "Clarificar perfil vocacional separando intereses genuinos de expectativas externas.",
        intervencion: "5 sesiones individuales + 2 familiares + app IA + informe final de ruta de carrera.",
        resultados: [
            { metric: "3", label: "Opciones claras" },
            { metric: "Bajó", label: "Nivel de ansiedad" },
            { metric: "100%", label: "Alineación familiar" },
        ],
    },
];


