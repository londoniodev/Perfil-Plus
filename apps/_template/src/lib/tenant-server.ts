export async function getTenantDesign(tenantId: string) {
  // Skip DB call during build time (static generation) — API is not accessible in Docker build context easily
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }
  try {
    // IMPORTANTE: Usamos fetch nativo en lugar de serverFetch porque:
    // 1. El endpoint /tenant/branding es @Public() y NO requiere JWT/cookies
    // 2. serverFetch llama s cookies() que marca el fetch como dinámico,
    //    impidiendo el cache ISR y causando errores en páginas estáticas
    // Use INTERNAL_API_URL inside Docker for SSR to avoid external routing hops and HTTPS 404s
    const internalUrl = process.env.INTERNAL_API_URL;
    const publicUrl = process.env.NEXT_PUBLIC_API_URL;

    // Fail-fast: En servidores Docker (Dokploy), INTERNAL_API_URL es obligatorio
    if (!internalUrl && process.env.NODE_ENV === 'production') {
      throw new Error("INTERNAL_API_URL is not defined for SSR fetch. Ensure it is set in Dokploy environment variables.");
    }

    const _apiUrl = (internalUrl || publicUrl || 'http://localhost:3001/api').replace(/\/+$/, "");
    const API_URL = _apiUrl.endsWith('/api') ? _apiUrl : `${_apiUrl}/api`;
    const finalEndpoint = `${API_URL}/tenant/branding`;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SSR BRANDING DEBUG] Fetching tenant ${tenantId} from: ${finalEndpoint}`);
    }

    const response = await fetch(finalEndpoint, {
      cache: 'force-cache',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-internal-token': process.env.INTERNAL_API_KEY || 'default_dev_secret_key',
      },
      next: {
        tags: [`tenant-branding-${tenantId}`, `tenant-brand-${tenantId}`, `tenant-${tenantId}-branding`],
      }
    });

    if (!response.ok) {
      console.error(`Branding API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    const design = data?.design ?? {
      colors: { primary: "#000000" },
      fonts: { heading: "Inter", body: "Inter" },
      radius: 0.5
    };

    return {
      name: data?.name || null,
      tagline: data?.tagline || null,
      ...design,
      logo: data?.logo || null,
      features: data?.features || [], // <--- Añadir features aquí
      headerLinks: data?.headerLinks || null,
      footerLinks: data?.footerLinks || null,
      socialLinks: data?.socialLinks || null,
      contactEmail: data?.contactEmail || null,
      contactPhone: data?.contactPhone || null,
      brandSettings: data?.brandSettings || null,
    };
  } catch (e) {
    console.warn("⚠️ API de Branding inalcanzable. Usando UI de contingencia:", e);
    return {
      name: null,
      tagline: null,
      colors: { primary: "#000000" },
      fonts: { heading: "Inter", body: "Inter" },
      radius: 0.5,
      features: [], // <--- Añadir esto para evitar navLinks vacíos por crash
    };
  }
}

/**
 * Identify tenant by host (Server Components fallback)
 * Use this when x-tenant-id header is missing to re-identify via host
 */
export async function identifyTenantByHost(host: string): Promise<{ id: string, slug: string, features: string[] } | null> {
  const _baseUrl = (process.env.INTERNAL_API_URL || 'http://localhost:3001/api').replace(/\/+$/, "");
  const API_URL = _baseUrl.endsWith('/api') ? _baseUrl : `${_baseUrl}/api`;
  const cleanHost = host.split(':')[0].replace(/^(www\.)/, "");
  
  try {
    const res = await fetch(`${API_URL}/tenant/identify?domain=${cleanHost}`, {
      headers: {
        'x-internal-token': process.env.INTERNAL_API_KEY || 'default_dev_secret_key'
      },
      next: { revalidate: 3600 } // Cache detection results for 1 hour
    });

    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.id,
      slug: data.slug || cleanHost,
      features: (data.features || []).map((f: string) => f.toUpperCase())
    };
  } catch (error) {
    console.error(`[Identify Fallback] Error for host ${cleanHost}:`, error);
    return null;
  }
}
