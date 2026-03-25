"use client";

import React from "react";
import { ExternalLink, Instagram, Facebook, Globe } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@alvarosky/ui";

interface LinktreeFallbackProps {
  tenantSlug: string;
  features: string[];
  marketingData?: {
    tenantSlug: string;
    heroTitle?: string;
    heroSubtitle?: string;
    // Opcionalmente podemos extraer social links o variables del branding si las hay
  };
  navLinks?: { label: string; href: string }[];
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    backgroundImageUrl?: string;
  };
}

export default function LinktreeFallback({ 
  tenantSlug, 
  marketingData,
  navLinks = [],
  branding 
}: LinktreeFallbackProps) {
  
  // Variables estéticas con fallbacks
  const bgImage = branding?.backgroundImageUrl || null;
  const primaryColor = branding?.primaryColor || "#09090b";
  const logo = branding?.logoUrl || null;
  const tenantName = tenantSlug.replace(/-/g, " ");
  
  // Si no pasamos navLinks explícitos en este bypass, al menos pintar los hardcodeados del step anterior
  // NOTA: Para respetar el paso 1, el router debería inyectarnos navLinks
  const linksToRender = navLinks.length > 0 ? navLinks : [
    { label: "Volver a Olympo", href: "/" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-zinc-950">
      
      {/* Background Layer */}
      {bgImage ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
      )}

      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      {/* Tarjeta Central */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-6 flex flex-col items-center text-center"
      >
        {/* Avatar / Logo */}
        <div 
          className="w-24 h-24 rounded-full border-2 overflow-hidden shadow-2xl flex items-center justify-center bg-zinc-900"
          style={{ borderColor: primaryColor }}
        >
          {logo ? (
            <img src={logo} alt={tenantName} className="w-full h-full object-cover" />
          ) : (
            <Globe className="w-10 h-10 text-white/50" />
          )}
        </div>

        {/* Textos */}
        <h1 className="text-2xl font-bold mt-4 text-white capitalize tracking-tight">
          {marketingData?.heroTitle || tenantName}
        </h1>
        <p className="text-sm text-zinc-300 mt-2 font-light">
          {marketingData?.heroSubtitle || "Descubre todos nuestros servicios"}
        </p>

        {/* Links de Navegación  */}
        <div className="w-full flex flex-col gap-4 mt-8">
          {linksToRender.map((link, index) => {
            // Saltamos el link de inicio si no es útil en un hub central
            if (link.href === '/' && linksToRender.length > 1) return null;
            
            return (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
              >
                <Link href={link.href} className="block group">
                  <div 
                    className="relative overflow-hidden w-full py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-300 shadow-lg text-center"
                    style={{ '--hover-color': primaryColor } as React.CSSProperties}
                  >
                    <span className="font-semibold text-white tracking-wide group-hover:text-[var(--hover-color)] transition-colors">
                      {link.label}
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Social Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex items-center justify-center gap-6"
        >
          <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors">
            <Globe className="w-5 h-5" />
          </a>
        </motion.div>
        
        <p className="mt-8 text-[10px] text-white/30 uppercase tracking-[0.2em]">
          Powered by Olympo SaaS
        </p>
      </motion.div>
    </div>
  );
}
