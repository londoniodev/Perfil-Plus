"use client";

import React from "react";
import { Button } from "@alvarosky/ui";
import { 
  UtensilsCrossed, 
  ShoppingBag, 
  Store, 
  ExternalLink,
  Instagram,
  Facebook,
  Globe,
  Layout
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface LinktreeFallbackProps {
  tenantSlug: string;
  features: string[];
  branding?: {
    logo?: string;
    primaryColor?: string;
    bannerUrl?: string;
  };
}

export default function LinktreeFallback({ 
  tenantSlug, 
  features,
  branding 
}: LinktreeFallbackProps) {
  
  const hasRestaurant = features.includes("RESTAURANT");
  const hasShop = features.includes("SHOP");
  const hasServices = features.includes("SERVICES");
  const hasBooking = features.includes("BOOKING");

  const links = [
    {
      id: "menu",
      title: "Ver Menú Digital",
      subtitle: "Explora nuestra carta y pide online",
      icon: <UtensilsCrossed className="w-6 h-6" />,
      href: "/menu",
      show: hasRestaurant,
      gradient: "from-orange-500 to-red-600",
    },
    {
      id: "shop",
      title: "Tienda Online",
      subtitle: "Compra nuestros productos",
      icon: <ShoppingBag className="w-6 h-6" />,
      href: "/tienda",
      show: hasShop,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      id: "services",
      title: "Nuestros Servicios",
      subtitle: "Conoce lo que hacemos",
      icon: <Store className="w-6 h-6" />,
      href: "/servicios",
      show: hasServices,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      id: "booking",
      title: "Reservas",
      subtitle: "Agenda tu cita ahora",
      icon: <Layout className="w-6 h-6" />,
      href: "/reservas",
      show: hasBooking,
      gradient: "from-purple-500 to-pink-600",
    }
  ].filter(link => link.show);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-start py-12 px-4 bg-background">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col items-center mb-12 text-center"
      >
        <div className="w-24 h-24 rounded-full bg-muted border-2 border-primary/20 flex items-center justify-center overflow-hidden mb-6 shadow-xl">
          {branding?.logo ? (
            <img src={branding.logo} alt={tenantSlug} className="w-full h-full object-cover" />
          ) : (
            <Globe className="w-10 h-10 text-muted-foreground" />
          )}
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2 capitalize">
          {tenantSlug.replace(/-/g, " ")}
        </h1>
        <p className="text-muted-foreground font-medium max-w-[280px]">
          Bienvenido a nuestra plataforma digital. Elige una opción para continuar.
        </p>
      </motion.div>

      {/* Links Section */}
      <div className="w-full max-w-md space-y-4">
        {links.length > 0 ? (
          links.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={link.href} className="block group">
                <div className="relative p-1 rounded-2xl bg-gradient-to-r transition-all duration-300 group-hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                  <div className={`absolute inset-0 bg-gradient-to-r ${link.gradient} rounded-2xl`} />
                  <div className="relative bg-background rounded-[calc(1rem-2px)] p-4 flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${link.gradient} text-white shadow-md`}>
                      {link.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {link.subtitle}
                      </p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 px-6 border-2 border-dashed rounded-3xl opacity-50">
            <p className="text-muted-foreground italic">No hay servicios configurados aún.</p>
          </div>
        )}
      </div>

      {/* Social Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 flex items-center gap-6"
      >
        <Instagram className="w-6 h-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
        <Facebook className="w-6 h-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
        <Globe className="w-6 h-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
      </motion.div>
      
      <p className="mt-8 text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-40">
        Powered by Olympo SaaS
      </p>
    </div>
  );
}
