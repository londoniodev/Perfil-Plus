import React from "react";
import dynamic from "next/dynamic";

// Fallbacks
import DefaultLanding from "@/components/marketing/DefaultLanding";
import DefaultFormacion from "@/app/(marketing)/formacion/FormacionContent";

/**
 * Patrón Registry para componentes de Storefront.
 * Evita la interpolación de strings en imports dinámicos para garantizar compatibilidad con el bundler de Next.js.
 */
const LANDING_REGISTRY: Record<string, any> = {
    // "mauromera": dynamic(() => import("@/components/storefronts/mauromera/Landing")), -> Migrated to S3
    // "soydeborasoysaludable": dynamic(() => import("@/components/storefronts/deborahmoscoso/Landing")), -> Migrated to S3
    // "cm7mman6x000208jsf3h9h2k1": dynamic(() => import("@/components/storefronts/deborahmoscoso/Landing")), -> Migrated to S3
    // "cocinasiete": dynamic(() => import("@/components/storefronts/cocinasiete/Landing")), -> Migrated to S3
    "alvarolondono": dynamic(() => import("@/components/storefronts/alvarolondono/Landing")),
    "xn--alvarolondoo-khb.dev": dynamic(() => import("@/components/storefronts/alvarolondono/Landing")),
};

const FORMACION_REGISTRY: Record<string, any> = {
    // "mauromera": dynamic(() => import("@/components/storefronts/mauromera/formacion/FormacionContent")), -> Migrated to S3
};

/**
 * Resuelve el componente de Landing para un inquilino específico.
 */
export function resolveLanding(slug: string) {
    return LANDING_REGISTRY[slug];
}

/**
 * Resuelve el componente de Formación para un inquilino específico.
 */
export function resolveFormacion(slug: string) {
    return FORMACION_REGISTRY[slug];
}
