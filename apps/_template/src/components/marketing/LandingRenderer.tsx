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
 * 2. ANIMACIONES JS: React elimina la ejecución de etiquetas <script> al usar 
 *    `dangerouslySetInnerHTML`. Por lo tanto, CUALQUIER interactividad JS de la 
 *    Landing (Sliders, Observers, Acordeones) DEBE programarse aquí mismo, 
 *    escaneando el DOM (`containerRef`) tras montarse.
 * 
 * 3. EXPANSIÓN: Actualmente solo soportamos animaciones CSS `.reveal` que 
 *    dependen de un IntersectionObserver (ver el useEffect).
 *    Si necesitas un "Carrusel", diseña el HTML inerte en S3 con una clase 
 *    ej: `.oly-carousel` y haz que este archivo lo procese/convierta a un Swiper React.
 * ------------------------------------------------------------------
 */
interface LandingRendererProps {
  html: string;
}

export default function LandingRenderer({ html }: LandingRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Ejecutar lógica de IntersectionObserver para la clase .reveal
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            // Opcional: observer.unobserve(entry.target) si solo queremos que anime una vez
          }
        });
      },
      { threshold: 0.1 }
    );

    const revealElements = containerRef.current.querySelectorAll(".reveal");
    revealElements.forEach((el) => observer.observe(el));

    // Cleanup observer al desmontar
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
