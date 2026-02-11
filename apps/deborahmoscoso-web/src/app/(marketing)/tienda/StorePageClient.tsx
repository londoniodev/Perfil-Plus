"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Search } from "lucide-react";
import { Button, useToast, PriceDisplay } from "@alvarosky/ui";
import Link from "next/link";
import { useCart } from "@/store/use-cart";

interface StorePageClientProps {
    products: any[];
}

export function StorePageClient({ products }: StorePageClientProps) {
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const cart = useCart();
    const { success, error } = useToast();

    const categories = [
        { id: "all", label: "TODOS LOS PRODUCTOS" },
        { id: "PHYSICAL", label: "SUPLEMENTACIÓN Y SALUD" },
        { id: "DIGITAL", label: "PROGRAMAS DIGITALES" },
        { id: "SERVICE", label: "CONSULTORÍA" }
    ];

    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === "all" || product.productType === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        return matchesCategory && matchesSearch;
    });

    const handleAddToCart = (e: React.MouseEvent, product: any) => {
        e.preventDefault();
        e.stopPropagation();

        const defaultVariant = product.variants[0];
        if (!defaultVariant) {
            error("Este producto no tiene una variante disponible.");
            return;
        }

        cart.addItem({
            productId: product.id,
            variantId: defaultVariant.id,
            title: product.name,
            subtitle: defaultVariant.name || "Estándar",
            imageSrc: product.images[0] || "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop",
            price: Number(defaultVariant.price),
            quantity: 1,
            productType: product.productType
        });

        success(`${product.name} añadido al carrito`);
    };

    return (
        <div className="bg-zinc-950 min-h-screen text-white">
            {/* Immersive Shop Hero */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1593073715694-8149e9185a97?q=80&w=2070&auto=format&fit=crop"
                        alt="Shop Hero"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/60 to-zinc-950" />
                </div>

                <div className="container relative z-10 px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-7xl md:text-9xl font-black text-white mb-6 tracking-tighter uppercase leading-none">
                            TIENDA <span className="text-fuchsia-500 italic">PREMIUM</span>
                        </h1>
                        <p className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-medium">
                            Potencia tu rendimiento con nuestra selección exclusiva de suplementos y equipamiento de alta gama.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container px-4 py-20">
                {/* Search Bar */}
                <div className="max-w-2xl mx-auto w-full relative group mb-12">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-zinc-500 group-focus-within:text-fuchsia-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="¿Qué estás buscando hoy?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-16 bg-zinc-900/50 border border-zinc-800 rounded-full pl-16 pr-8 text-sm focus:outline-none focus:border-fuchsia-500/50 focus:ring-4 focus:ring-fuchsia-500/10 transition-all placeholder:text-zinc-600 font-medium"
                    />
                </div>

                {/* Category Bar */}
                <div className="flex flex-wrap gap-4 justify-center mb-16">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat.id
                                ? "bg-fuchsia-600 border-fuchsia-500 text-white shadow-lg shadow-fuchsia-900/40"
                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="min-h-[400px]">
                    {filteredProducts.length > 0 ? (
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.1 }
                                }
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        >
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 30 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                                    }}
                                    className="group"
                                >
                                    <Link href={`/tienda/${product.slug}`}>
                                        <div className="relative aspect-[4/5] rounded-[2.5rem] bg-zinc-900 mb-6 overflow-hidden border border-zinc-800 transition-all duration-500 group-hover:border-fuchsia-500/30 group-hover:shadow-2xl group-hover:shadow-fuchsia-900/10">
                                            <img
                                                src={product.images[0] || "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop"}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />

                                            <div className="absolute top-6 right-6 bg-zinc-950/80 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/5">
                                                <Star className="w-3 h-3 text-fuchsia-500 fill-fuchsia-500" />
                                                <span className="text-xs font-bold text-white">4.9</span>
                                            </div>

                                            <div className="absolute bottom-6 left-6 right-6">
                                                <PriceDisplay
                                                    price={product.variants[0]?.price || 0}
                                                    currency="COP"
                                                    className="mb-1"
                                                    size="sm"
                                                />
                                                <h3 className="text-xl font-bold text-white leading-tight uppercase italic">{product.name}</h3>
                                            </div>
                                        </div>
                                    </Link>

                                    <Button
                                        onClick={(e) => handleAddToCart(e, product)}
                                        className="w-full bg-white text-zinc-950 hover:bg-fuchsia-600 hover:text-white h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                                    >
                                        <ShoppingCart className="w-4 h-4" /> Añadir al carrito
                                    </Button>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-900 rounded-[3rem]">
                            <Search className="h-12 w-12 text-zinc-800 mb-6" />
                            <h3 className="text-2xl font-bold text-zinc-500 uppercase tracking-tighter italic">No se encontraron productos</h3>
                            <p className="text-zinc-600 mt-2 font-medium max-w-sm">Prueba con términos diferentes o busca en otra categoría de productos.</p>
                            <Button
                                variant="ghost"
                                className="mt-10 text-fuchsia-500 hover:text-fuchsia-400 font-bold uppercase tracking-widest text-[10px]"
                                onClick={() => {
                                    setSearchQuery("");
                                    setActiveCategory("all");
                                }}
                            >
                                Limpiar búsqueda y filtros
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
