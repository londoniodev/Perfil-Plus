"use client";

import React from "react";
import { ExternalLink, Instagram, Facebook, Globe } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@alvarosky/ui";

interface LinktreeFallbackProps {
  tenantSlug: string;
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
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    whatsapp?: string;
    website?: string;
  };
}

export default function LinktreeFallback({ 
  tenantSlug, 
  marketingData,
  navLinks = [],
  branding,
  socialLinks
}: LinktreeFallbackProps) {
  
  // Variables estéticas con fallbacks
  const bgImage = branding?.backgroundImageUrl || null;
  const primaryColor = branding?.primaryColor || "#09090b";
  const logo = branding?.logoUrl || null;
  const tenantName = tenantSlug.replace(/-/g, " ");
  
  // Lista de navegación final con el botón de "Entrar" al final
  const linksToRender = [...navLinks];

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-zinc-950">
      
      {/* Background Layer - Full width/height sin deformación */}
      {bgImage ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
      )}

      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />

      {/* Tarjeta Central */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 flex flex-col items-center text-center"
      >
        {/* Avatar / Logo */}
        <div 
          className="w-28 h-28 rounded-full border-4 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center bg-zinc-900 transition-transform hover:scale-105 duration-300"
          style={{ borderColor: primaryColor }}
        >
          {logo ? (
            <img src={logo} alt={tenantName} className="w-full h-full object-cover" />
          ) : (
            <Globe className="w-12 h-12 text-white/40" />
          )}
        </div>

        {/* Textos */}
        <h1 className="text-3xl font-extrabold mt-6 text-white capitalize tracking-tighter sm:text-4xl">
          {marketingData?.heroTitle || tenantName}
        </h1>
        <p className="text-base text-zinc-400 mt-3 font-medium px-4">
          {marketingData?.heroSubtitle || "Descubre todo lo que tenemos preparado para ti..."}
        </p>

        {/* Links de Navegación  */}
        <div className="w-full flex flex-col gap-4 mt-10">
          {linksToRender.map((link, index) => {
            if (link.href === '/' && linksToRender.length > 1) return null;
            
            return (
              <motion.div
                key={`${link.href}-${index}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (index * 0.08) }}
              >
                <Link href={link.href} className="block group">
                  <div 
                    className="relative overflow-hidden w-full py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300 shadow-2xl text-center active:scale-95"
                    style={{ '--hover-color': primaryColor } as React.CSSProperties}
                  >
                    <span className="font-bold text-white text-lg tracking-wide group-hover:text-[var(--hover-color)] transition-colors">
                      {link.label}
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}

          {/* Botón de Entrada (Login) siempre al final */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (linksToRender.length * 0.08) }}
          >
            <Link href="/login" className="block group mt-2">
              <div 
                className="relative overflow-hidden w-full py-4 px-6 rounded-2xl border-2 transition-all duration-500 text-center active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                style={{ 
                    backgroundColor: primaryColor, 
                    borderColor: primaryColor,
                    color: '#fff'
                }}
              >
                <span className="font-black text-lg uppercase tracking-widest">
                  Entrar / Iniciar Sesión
                </span>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Social Footer - Conexión Real DB */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-14 flex items-center justify-center gap-8"
        >
          {socialLinks?.instagram && (
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all hover:scale-110">
              <Instagram className="w-6 h-6" />
            </a>
          )}
          {socialLinks?.facebook && (
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all hover:scale-110">
              <Facebook className="w-6 h-6" />
            </a>
          )}
          {socialLinks?.twitter && (
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all hover:scale-110">
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          )}
          {!socialLinks && (
              <span className="text-zinc-600 text-[10px] uppercase tracking-widest">Sin redes vinculadas</span>
          )}
        </motion.div>
        
        <div className="mt-10 flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity duration-500">
            <p className="text-[10px] text-white uppercase tracking-[0.3em] font-light">
                {tenantName} © {new Date().getFullYear()}
            </p>
            <p className="text-[11px] text-white font-bold tracking-widest">
                Alvaro Londoño Developer
            </p>
        </div>
      </motion.div>
    </div>
  );
}
