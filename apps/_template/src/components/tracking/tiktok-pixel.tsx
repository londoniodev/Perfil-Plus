"use client"

import { useEffect, useRef } from "react"
import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"

interface TikTokPixelProps {
  /** Pixel Code del tenant (ej: "CXXXXXXXXXXXXXXXXX") — Solo el ID público */
  pixelId: string
}

/**
 * TikTok Browser Pixel — Se inyecta en el layout del storefront.
 *
 * Responsabilidades:
 * 1. Carga el SDK de TikTok (ttq).
 * 2. Inicializa el pixel con el ID del tenant.
 * 3. Dispara un PageView en rutas dinámicas.
 */
export function TikTokPixel({ pixelId }: TikTokPixelProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isInitialLoad = useRef(true)

  useEffect(() => {
    // Evitar hacer track en el mount inicial ya que el Script lo hace automáticamente
    if (isInitialLoad.current) {
        isInitialLoad.current = false
        return
    }
    
    // Disparar evento de PageView en cada cambio de ruta client-side
    if (typeof window !== "undefined" && (window as any).ttq) {
      ;(window as any).ttq.page()
    }
  }, [pathname, searchParams])

  if (!pixelId) return null

  // Para que el TikTok Pixel Helper (la extensión de Chrome) detecte el Pixel,
  // ttq.load() DEBE estar dentro del código fuente del script inyectado.
  return (
    <Script
      id="tiktok-pixel-sdk"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
  ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
  ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
  for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
  ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
  ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
  ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
  ttq._o=ttq._o||{};ttq._o[e]=n||{};
  var s=document.createElement("script");s.type="text/javascript";s.async=true;s.src=r+"?sdkid="+e+"&lib="+t;
  var a=document.getElementsByTagName("script")[0];
  if(a) a.parentNode.insertBefore(s,a); else document.head.appendChild(s);
  };
  ttq.load('${pixelId}');
  ttq.page();
}(window, document, 'ttq');
        `.trim(),
      }}
    />
  )
}
