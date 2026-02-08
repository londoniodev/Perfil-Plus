export type CategoriaId = "Empresas" | "Explora" | "Liderazgo" | "Bienestar";

export interface CasoResult {
    metric: string;
    label: string;
}

export interface Caso {
    id: number;
    titulo: string;
    cliente: string;
    categoria: CategoriaId;
    color: string;
    contexto: string;
    reto: string;
    intervencion: string;
    resultados: CasoResult[];
}

export interface Testimonial {
    id: string;
    authorName: string;
    authorRole: string;
    quote: string;
    avatarUrl?: string;
}

export interface Service {
    id: string;
    title: string;
    description: string;
    iconName: string;
    features: string[];
}

