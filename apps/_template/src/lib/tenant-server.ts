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
    const _apiUrl = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api:3001/api').replace(/\/+$/, "");
    const API_URL = _apiUrl.endsWith('/api') ? _apiUrl : `${_apiUrl}/api`;
    const finalEndpoint = `${API_URL}/tenant/branding`;

    console.log(`[SSR BRANDING DEBUG] Fetching tenant ${tenantId} from: ${finalEndpoint}`);

    const response = await fetch(finalEndpoint, {
      cache: 'force-cache',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-internal-token': process.env.INTERNAL_API_KEY || 'default_dev_secret_key',
      },
      next: {
        tags: ['tenant-branding', `tenant-branding-${tenantId}`, `tenant-brand-${tenantId}`, `tenant-${tenantId}-branding`],
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
      headerLinks: data?.headerLinks || null,
      footerLinks: data?.footerLinks || null,
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
      radius: 0.5
    };
  }
}
