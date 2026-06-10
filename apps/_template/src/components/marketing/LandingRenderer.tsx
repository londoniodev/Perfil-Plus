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
  businessName?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  let r = 0, g = 0, b = 0;
  // Standardize hex
  const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
  if (cleanHex.length === 4) {
    r = parseInt(cleanHex[1] + cleanHex[1], 16);
    g = parseInt(cleanHex[2] + cleanHex[2], 16);
    b = parseInt(cleanHex[3] + cleanHex[3], 16);
  } else if (cleanHex.length === 7) {
    r = parseInt(cleanHex.substring(1, 3), 16);
    g = parseInt(cleanHex.substring(3, 5), 16);
    b = parseInt(cleanHex.substring(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function LandingRenderer({
  html,
  logoUrl,
  primaryColor = "#3b82f6",
  businessName,
}: LandingRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Detectar cuando el contenido + CSS están listos
  useEffect(() => {
    // Esperar a que todos los <link rel="stylesheet"> del documento estén cargados
    const checkStylesheets = () => {
      const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
      for (let i = 0; i < linkElements.length; i++) {
        const link = linkElements[i] as HTMLLinkElement;
        // Un stylesheet cross-origin lanza SecurityError al acceder a cssRules,
        // pero .sheet será null si aún no terminó de cargar.
        if (link.href && !link.sheet) {
          return false;
        }
      }
      return true;
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

  // IntersectionObserver para animaciones .reveal y Parallax
  useEffect(() => {
    if (!containerRef.current || !isReady) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            entry.target.classList.add("active"); // Fallback para templates que usan .active en su CSS
            
            // Soporte para staggered children si existen
            const children = entry.target.querySelectorAll('.reveal-scale, .reveal, .reveal-left, .reveal-right, .card-hover');
            children.forEach((c, i) => {
              (c as HTMLElement).style.transitionDelay = `${(i + 1) * 0.1}s`;
              setTimeout(() => {
                c.classList.add("visible");
                c.classList.add("active"); // Fallback
              }, 50);
            });
            
            // Una vez visible, dejamos de observar para ahorrar recursos
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px -20px 0px" }
    );

    // Re-escaneo más robusto del DOM inyectado
    const scanAndObserve = () => {
      const revealElements = containerRef.current?.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
      revealElements?.forEach((el) => {
        // Aseguramos estado inicial si por algo se coló un 'visible'
        if (el.getBoundingClientRect().top > window.innerHeight) {
           el.classList.remove("visible");
           el.classList.remove("active");
        }
        observer.observe(el);
      });
    };

    const timer1 = setTimeout(scanAndObserve, 100);
    const timer2 = setTimeout(scanAndObserve, 500);

    // ── Lógica de Parallax Nativo ──
    const parallaxImages = containerRef.current.querySelectorAll(".parallax-img") as NodeListOf<HTMLElement>;
    
    const updateParallax = () => {
      if (window.innerWidth < 1024) {
        parallaxImages.forEach(img => {
          img.style.transform = "none";
        });
        return;
      }

      parallaxImages.forEach(img => {
        const parent = img.closest("section");
        if (!parent) return;

        const rect = parent.getBoundingClientRect();
        const viewHeight = window.innerHeight;

        // Solo actualizar si la sección está visible en pantalla
        if (rect.top < viewHeight && rect.bottom > 0) {
          const centerScreen = viewHeight / 2;
          const parentCenter = rect.top + (rect.height / 2);
          const relativeOffset = parentCenter - centerScreen;
          
          // Desplazamiento lento en el eje Y basado en la posición en pantalla
          const translateY = relativeOffset * -0.15;
          img.style.transform = `translate3d(0, ${translateY}px, 0) scale(1.03)`;
        }
      });
    };

    // Capturar scroll en cualquier nivel del documento
    const handleScroll = () => {
      requestAnimationFrame(updateParallax);
    };

    document.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    
    // Posicionamiento inicial
    const initialTimer = setTimeout(updateParallax, 150);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(initialTimer);
      observer.disconnect();
      document.removeEventListener("scroll", handleScroll, { capture: true });
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
          <div className="flex flex-col items-center gap-4">
             <div 
              className="w-12 h-12 rounded-full border-4 animate-spin" 
              style={{ 
                borderColor: `${primaryColor}20`, 
                borderTopColor: primaryColor 
              }}
            />
            {businessName && <span className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase">{businessName}</span>}
          </div>
        )}
        
        <div
          className="w-10 h-1 rounded flex overflow-hidden opacity-80"
          style={{
            background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
            animation: "shimmer 1.5s ease-in-out infinite",
          }}
        />
      </div>

      {/* ── Contenido de la Landing ── */}
      <div
        ref={containerRef}
        className="w-full min-h-screen max-w-[100vw] overflow-x-hidden p-0 m-0 landing-content"
        style={{
          opacity: isReady ? 1 : 0,
          transition: "opacity 0.5s ease-in",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Logic to wrap letters for animations after DOM is ready */}
      <script 
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const observer = new MutationObserver(() => {
                const dropHeaders = document.querySelectorAll('.animate-drop:not(.processed)');
                dropHeaders.forEach(header => {
                  header.classList.add('processed');
                  // Use innerHTML to preserve <br> tags, then process only text nodes
                  const fragment = document.createDocumentFragment();
                  const childNodes = Array.from(header.childNodes);
                  header.innerHTML = '';
                  childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                      const text = node.textContent.trim();
                      [...text].forEach((char, i) => {
                        const span = document.createElement('span');
                        span.textContent = char === ' ' ? '\\u00A0' : char;
                        span.className = 'drop-letter';
                        span.style.transitionDelay = (i * 0.05) + 's';
                        fragment.appendChild(span);
                      });
                    } else {
                      // Preserve non-text nodes like <br>
                      fragment.appendChild(node.cloneNode(true));
                    }
                  });
                  header.appendChild(fragment);
                  const spans = header.querySelectorAll('.drop-letter');
                  spans.forEach((span, i) => {
                    setTimeout(() => span.classList.add('visible'), 100 + (i * 50));
                  });
                });
              });
              observer.observe(document.body, { childList: true, subtree: true });
            })();
          `
        }}
      />

      {/* ── Keyframes y Estilos Globales para Landings (Al final para mayor prioridad) ── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes shimmer { 0%, 100% { opacity: 0.3; transform: scaleX(0.5); } 50% { opacity: 1; transform: scaleX(1); } }
            
            /* ── Animaciones de Reveal al hacer Scroll (Genérico, todos los tenants) ── */
            .reveal, .reveal-left, .reveal-right, .reveal-scale { 
              opacity: 0; 
              will-change: transform, opacity;
              transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .reveal { transform: translateY(60px); }
            .reveal-left { transform: translateX(-60px); }
            .reveal-right { transform: translateX(60px); }
            .reveal-scale { transform: scale(0.92); }

            .reveal.visible, .reveal-left.visible, .reveal-right.visible, .reveal-scale.visible {
              opacity: 1 !important;
              transform: translate(0) scale(1) !important;
            }

            /* ── Falling Letters Animation (Genérico) ── */
            .drop-letter {
              display: inline-block;
              opacity: 0;
              transform: translateY(-30px);
              transition: opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }
            
            .drop-letter.visible {
              opacity: 1;
              transform: translateY(0) !important;
            }

            /* ── Typewriter Animation (Genérico) ── */
            .typewriter {
              display: inline-block;
              position: relative;
              clip-path: inset(0 100% 0 0);
              animation: reveal-type 3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              animation-delay: 1.2s;
            }

            @keyframes reveal-type {
              to { clip-path: inset(0 0 0 0); }
            }

            .typewriter::after {
              content: '';
              position: absolute;
              right: 0;
              top: 0;
              bottom: 0;
              width: 2px;
              background-color: ${primaryColor};
              animation: blink-cursor 0.8s step-end infinite;
            }

            @keyframes blink-cursor {
              from, to { opacity: 0 }
              50% { opacity: 1 }
            }

            /* ── Glassmorphism Box (Genérico, usa primaryColor del tenant) ── */
            .glass-box {
              background-color: ${hexToRgba(primaryColor, 0.75)} !important;
              background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%) !important;
              backdrop-filter: blur(40px) saturate(200%) !important;
              -webkit-backdrop-filter: blur(40px) saturate(200%) !important;
              border: 1px solid rgba(255, 255, 255, 0.2) !important;
              border-radius: 9999px !important;
              padding-left: 3rem !important;
              padding-right: 3rem !important;
              box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.7), 0 0 50px ${hexToRgba(primaryColor, 0.3)} !important;
              transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out !important;
            }

            .section-divider {
              border-radius: 9999px !important;
              background: ${primaryColor} !important;
              height: 4px !important;
              width: 80px !important;
              margin: 0 auto !important;
            }

            .landing-content {
              position: relative;
              z-index: 1;
            }
          `,
        }}
      />
    </>
  );
}
