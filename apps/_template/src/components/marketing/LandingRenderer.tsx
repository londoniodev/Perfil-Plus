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

/**
 * Genera un color complementario a partir de un hex.
 * Mezcla el color con negro para crear un tono oscuro que combine.
 */
function generateComplementaryDark(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  
  // Mezclar con negro al 85% para un tono oscuro elegante
  const darkR = Math.round(r * 0.15);
  const darkG = Math.round(g * 0.15);
  const darkB = Math.round(b * 0.15);
  
  return `rgb(${darkR}, ${darkG}, ${darkB})`;
}

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
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 }
    );

    const revealElements = containerRef.current.querySelectorAll(".reveal");
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [html, isReady]);

  const complementaryDark = generateComplementaryDark(primaryColor);

  return (
    <>
      {/* ── Loader Premium ── */}
      <div
        aria-hidden={isReady}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          background: `radial-gradient(ellipse at center, ${primaryColor}22 0%, ${complementaryDark} 70%, #000 100%)`,
          opacity: isReady ? 0 : 1,
          pointerEvents: isReady ? "none" : "auto",
          transition: "opacity 0.5s ease-out",
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="Cargando"
            style={{
              width: 80,
              height: 80,
              objectFit: "contain",
              borderRadius: "1rem",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              border: `3px solid ${primaryColor}33`,
              borderTopColor: primaryColor,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        )}
        <div
          style={{
            width: 40,
            height: 3,
            borderRadius: 4,
            background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
            animation: "shimmer 1.5s ease-in-out infinite",
          }}
        />
      </div>

      {/* ── Keyframes para animaciones del loader ── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes pulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
            @keyframes shimmer { 0%, 100% { opacity: 0.3; transform: scaleX(0.5); } 50% { opacity: 1; transform: scaleX(1); } }
          `,
        }}
      />

      {/* ── Contenido de la Landing ── */}
      <div
        ref={containerRef}
        className="w-full min-h-screen max-w-[100vw] overflow-x-hidden p-0 m-0"
        style={{
          opacity: isReady ? 1 : 0,
          transition: "opacity 0.4s ease-in",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
