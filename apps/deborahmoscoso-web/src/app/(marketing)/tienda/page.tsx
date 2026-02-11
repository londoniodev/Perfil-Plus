"use client";

import { Fill, Button } from "@alvarosky/ui";
import { motion } from "framer-motion";
import { Filter, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const products = [
    {
        id: "1",
        title: "Proteína Isolata Premium",
        category: "suplementos",
        price: 45.99,
        rating: 5,
        image: "/images/product-protein.jpg",
        tags: ["Masa Muscular", "Recuperación"]
    },
    {
        id: "2",
        title: "Suero Facial Revitalizante",
        category: "woman",
        price: 32.50,
        rating: 4.8,
        image: "/images/product-serum-woman.jpg",
        tags: ["Skin Care", "Glow"]
    },
    {
        id: "3",
        title: "Bálsamo para Barba Elite",
        category: "man",
        price: 18.00,
        rating: 4.9,
        image: "/images/product-beard-balm.jpg",
        tags: ["Cuidado Masculino", "Estilo"]
    },
    {
        id: "4",
        title: "Pre-Workout Energy Boost",
        category: "suplementos",
        price: 39.00,
        rating: 4.7,
        image: "/images/product-preworkout.jpg",
        tags: ["Energía", "Rendimiento"]
    },
    {
        id: "5",
        title: "Crema Hidratante Pro-Active",
        category: "man",
        price: 25.00,
        rating: 4.6,
        image: "/images/product-moisturizer.jpg",
        tags: ["Cuidado Masculino", "Protección"]
    },
    {
        id: "6",
        title: "Vitaminas Daily Essential",
        category: "woman",
        price: 29.99,
        rating: 5,
        image: "/images/product-vitamins.jpg",
        tags: ["Salud", "Vitalidad"]
    }
];

const categories = [
    { id: "all", label: "Todo" },
    { id: "suplementos", label: "Suplementos" },
    { id: "man", label: "Hombres" },
    { id: "woman", label: "Mujeres" }
];

export default function StorePage() {
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredProducts = activeCategory === "all"
        ? products
        : products.filter(p => p.category === activeCategory);

    return (
        <Fill className="bg-zinc-950 min-h-screen">
            {/* Header Section */}
            <div className="py-20 bg-gradient-to-b from-emerald-500/10 to-transparent">
                <div className="container px-4 text-center">
                    <h1 className="text-5xl font-bold text-white mb-4">Tienda Exclusive</h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Suplementación de alto grado y cuidado personal premium.
                        Calidad sin compromisos para tu estilo de vida saludable.
                    </p>
                </div>
            </div>

            <div className="container px-4 pb-24">
                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-6 mb-12 border-b border-zinc-800 pb-8">
                    <div className="flex items-center gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id
                                        ? "bg-emerald-600 text-white"
                                        : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    <Button variant="ghost" className="text-zinc-400 gap-2">
                        <Filter className="w-4 h-4" /> Filtrar por objetivo
                    </Button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col hover:border-emerald-500/50 transition-colors"
                        >
                            <div className="relative aspect-square overflow-hidden bg-zinc-800">
                                {/* Placeholder image icon */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ShoppingCart className="w-20 h-20 text-white/5 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-bold text-white">{product.rating}</span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex gap-2 mb-3 flex-wrap">
                                    {product.tags.map(tag => (
                                        <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                    {product.title}
                                </h4>
                                <p className="text-2xl font-bold text-white mt-auto mb-6">
                                    ${product.price.toFixed(2)}
                                </p>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4" /> Añadir al Carrito
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Fill>
    );
}
