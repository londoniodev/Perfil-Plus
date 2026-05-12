"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ------------------------------------------------------------------
 * LANDING RENDERER (MOTOR DE REACT PARA HEADLESS CMS)
 * ------------------------------------------------------------------
 * IMPORTANTE PARA FUTUROS AGENTES AI Y DESARROLLADORES:
 *
 * 1. SEGURIDAD (XSS): El HTML entrante (`html` prop) YA DEBE venir pre-sanitizado
 *    desde el servidor (usando DOMPurify en page.tsx).
 *
 * 2. CSS EXTERNO: Los <link> de stylesheets se renderizan server-side en page.tsx
 *    (no aquí) para evitar FOUC. Este componente solo muestra un loader premium
 *    mientras el CSS termina de cargar.
 *
 * 3. ANIMACIONES: IntersectionObserver para la clase `.reveal`.
 *    Para expandir (carruseles, modales), diseñar HTML inerte en S3 con clases
 *    como `.oly-carousel` y programar la activación aquí.
 * ------------------------------------------------------------------
 */

interface LandingRendererProps {
  html: string;
  logoUrl?: string;
  primaryColor?: string;
}

export default function LandingRenderer({
  html,
  logoUrl,
  primaryColor = "#3b82f6",
}: LandingRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Detectar cuando el contenido + CSS están listos
  useEffect(() => {
    // Esperar a que todos los stylesheets del documento estén cargados
    const checkStylesheets = () => {
      const sheets = document.styleSheets;
      try {
        // Intentar acceder a las reglas de cada stylesheet
        // Si no están cargadas, lanzan un error
        for (let i = 0; i < sheets.length; i++) {
          const sheet = sheets[i];
          if (sheet.href) {
            sheet.cssRules; // Lanza error si no está cargado (CORS ok en nuestro caso)
          }
        }
        return true;
      } catch {
        return false;
      }
    };

    // Polling corto — máximo 3 segundos, luego mostramos de todas formas
    let attempts = 0;
    const maxAttempts = 30; // 30 * 100ms = 3s
    const interval = setInterval(() => {
      attempts++;
      if (checkStylesheets() || attempts >= maxAttempts) {
        clearInterval(interval);
        setIsReady(true);
      }
    }, 100);

    // Safety: si todo falla, mostrar después de 2s
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsReady(true);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // IntersectionObserver para animaciones .reveal
  useEffect(() => {
    if (!containerRef.current || !isReady) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            
            // Soporte para staggered children si existen
            const children = entry.target.querySelectorAll('.reveal-scale, .reveal, .reveal-left, .reveal-right');
            children.forEach((c, i) => {
              (c as HTMLElement).style.transitionDelay = `${i * 0.15}s`;
              c.classList.add("visible");
            });
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
    );

    // Pequeño delay para asegurar que el DOM inyectado está listo para querySelector
    const timer = setTimeout(() => {
      const revealElements = containerRef.current?.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
      revealElements?.forEach((el) => {
        observer.observe(el);
        // Force check for elements already in viewport
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
           el.classList.add("visible");
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [html, isReady]);

  // Usar CSS variables para el gradiente
  return (
    <>
      {/* ── Loader Premium ── */}
      <div
        aria-hidden={isReady}
        className="flex h-screen w-full flex-col items-center justify-center gap-6"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#000",
          opacity: isReady ? 0 : 1,
          pointerEvents: isReady ? "none" : "auto",
          transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Cargando"
            className="w-auto h-20 max-w-[280px] md:h-24 md:max-w-[340px] object-contain animate-pulse"
          />
        ) : (
          <div 
            className="w-12 h-12 rounded-full border-4 animate-spin" 
            style={{ 
              borderColor: `${primaryColor}20`, 
              borderTopColor: primaryColor 
            }}
          />
        )}
        
        <div
          className="w-10 h-1 rounded flex overflow-hidden opacity-80"
          style={{
            background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
            animation: "shimmer 1.5s ease-in-out infinite",
          }}
        />
      </div>

      {/* ── Keyframes y Estilos Globales para Landings ── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes shimmer { 0%, 100% { opacity: 0.3; transform: scaleX(0.5); } 50% { opacity: 1; transform: scaleX(1); } }
            
            /* Animaciones de Reveal al hacer Scroll */
            .reveal, .reveal-left, .reveal-right, .reveal-scale { 
              opacity: 0; 
              will-change: transform, opacity;
            }
            .reveal { transform: translateY(30px); transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1); }
            .reveal-left { transform: translateX(-40px); transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1); }
            .reveal-right { transform: translateX(40px); transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1); }
            .reveal-scale { transform: scale(0.94); transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1); }

            .reveal.visible, .reveal-left.visible, .reveal-right.visible, .reveal-scale.visible {
              opacity: 1 !important;
              transform: translate(0) scale(1) !important;
            }

            /* Efecto Granular Premium */
            .grain-overlay::after {
              content: "";
              position: fixed;
              inset: 0;
              width: 100%;
              height: 100%;
              pointer-events: none;
              z-index: 9999;
              opacity: 0.04;
              background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
            }
          `,
        }}
      />

      {/* ── Contenido de la Landing ── */}
      <div
        ref={containerRef}
        className="w-full min-h-screen max-w-[100vw] overflow-x-hidden p-0 m-0 grain-overlay"
        style={{
          opacity: isReady ? 1 : 0,
          background: "#121212",
          transition: "opacity 0.5s ease-in",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
