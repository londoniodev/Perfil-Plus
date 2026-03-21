"use client";

import { PlasmicRootProvider } from "@plasmicapp/loader-nextjs";
import { PLASMIC } from "./plasmic-init";

/**
 * Client-side wrapper para Plasmic.
 * Recibe `prefetchedData` desde el Server Component para evitar
 * pasar el Loader (no serializable) directamente como prop.
 */
export function PlasmicClientRootProvider(
  props: Omit<React.ComponentProps<typeof PlasmicRootProvider>, "loader">
) {
  return (
    <PlasmicRootProvider loader={PLASMIC} {...props}>
      {props.children}
    </PlasmicRootProvider>
  );
}
