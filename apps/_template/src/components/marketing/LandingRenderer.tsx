"use client";

import { useEffect, useRef } from "react";

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
