"use client";

import { useEffect, useRef } from "react";

/**
 * ------------------------------------------------------------------
 * LANDING RENDERER (MOTOR DE REACT PARA HEADLESS CMS)
 * ------------------------------------------------------------------
 * IMPORTANTE PARA FUTUROS AGENTES AI Y DESARROLLADORES:
 * 
 * 1. SEGURIDAD (XSS): El HTML entrante (`html` prop) YA DEBE venir pre-sanitizado 
 *    desde el servidor (usando DOMPurify en page.tsx) para cortar cualquier 
 *    <script> malicioso o handlers (onclick) inyectados en S3.
 * 
 * 2. CSS EXTERNO: DOMPurify elimina las etiquetas <link> por seguridad.
 *    Por eso, page.tsx las extrae ANTES de sanitizar y las pasa en la prop
 *    `stylesheetUrls`. Este componente las inyecta de forma segura en el <head>.
 *    Solo se permiten URLs de dominios confiables (S3 y Google Fonts).
 * 
 * 3. ANIMACIONES JS: React elimina la ejecución de etiquetas <script> al usar 
 *    `dangerouslySetInnerHTML`. Por lo tanto, CUALQUIER interactividad JS de la 
 *    Landing (Sliders, Observers, Acordeones) DEBE programarse aquí mismo, 
 *    escaneando el DOM (`containerRef`) tras montarse.
 * 
 * 4. EXPANSIÓN: Actualmente solo soportamos animaciones CSS `.reveal` que 
 *    dependen de un IntersectionObserver (ver el useEffect).
 *    Si necesitas un "Carrusel", diseña el HTML inerte en S3 con una clase 
 *    ej: `.oly-carousel` y haz que este archivo lo procese/convierta a un Swiper React.
 * ------------------------------------------------------------------
 */

// Dominios permitidos para inyección de stylesheets (whitelist de seguridad)
const TRUSTED_STYLESHEET_DOMAINS = [
  "s3.perfil.plus",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
];

function isTrustedStylesheetUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return TRUSTED_STYLESHEET_DOMAINS.some((d) => parsed.hostname === d);
  } catch {
    return false;
  }
}

interface LandingRendererProps {
  html: string;
  stylesheetUrls?: string[];
}

export default function LandingRenderer({ html, stylesheetUrls = [] }: LandingRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Inyectar stylesheets seguros en el <head>
  useEffect(() => {
    const injectedLinks: HTMLLinkElement[] = [];

    for (const url of stylesheetUrls) {
      if (!isTrustedStylesheetUrl(url)) {
        console.warn(`[LandingRenderer] Stylesheet bloqueada por seguridad: ${url}`);
        continue;
      }

      // Evitar duplicados
      const exists = document.querySelector(`link[href="${url}"]`);
      if (exists) continue;

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
      injectedLinks.push(link);
    }

    // Cleanup: remover al desmontar
    return () => {
      injectedLinks.forEach((link) => link.remove());
    };
  }, [stylesheetUrls]);

  // IntersectionObserver para animaciones .reveal
  useEffect(() => {
    if (!containerRef.current) return;

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
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen max-w-[100vw] overflow-x-hidden p-0 m-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
