export interface ServiceItem {
    id: string;
    title: string;
    description: string;
    icon?: string;
}

export interface TenantMarketingData {
    tenantSlug: string;
    heroTitle: string;
    heroSubtitle?: string;
    ctaText?: string;
    ctaUrl?: string;
    services?: ServiceItem[];
}

export type CategoriaId = "Empresas" | "Explora" | "Liderazgo" | "Bienestar" | string;

export interface CasoResult {
    metric: string;
    label: string;
}

export interface Caso {
    id: number | string;
    titulo: string;
    cliente: string;
    categoria: CategoriaId;
    color: string;
    contexto: string;
    reto: string;
    intervencion: string;
    resultados: CasoResult[];
}
