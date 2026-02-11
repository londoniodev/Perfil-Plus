"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";
import { Button, useToast } from "@alvarosky/ui";
import Link from "next/link";
import { useCart } from "@/store/use-cart";

interface StorePageClientProps {
    products: any[];
}

export function StorePageClient({ products }: StorePageClientProps) {
    const [activeCategory, setActiveCategory] = useState("all");
    const cart = useCart();
    const { success, error } = useToast();

    const categories = [
        { id: "all", label: "TODOS LOS PRODUCTOS" },
        { id: "DIGITAL", label: "PROGRAMAS DIGITALES" },
        { id: "PHYSICAL", label: "EQUIPAMIENTO" },
        { id: "SERVICE", label: "CONSULTORÍA" }
    ];

    const filteredProducts = activeCategory === "all"
        ? products
        : products.filter(p => p.productType === activeCategory);

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
        <div className="bg-zinc-950 min-h-screen">
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
                        <h1 className="text-7xl md:text-9xl font-black text-white mb-6 tracking-tighter uppercase">
                            TIENDA <span className="text-fuchsia-500 italic">PREMIUM</span>
                        </h1>
                        <p className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-medium">
                            Potencia tu rendimiento con nuestra selección exclusiva de suplementos y equipamiento de alta gama.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container px-4 py-20">
                {/* Advanced Filters Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row justify-between items-center gap-10 mb-20 border-b border-zinc-800 pb-10"
                >
                    <div className="flex flex-wrap gap-4 justify-center">
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
                </motion.div>

                {/* High-Fidelity Product Grid */}
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
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
                >
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.8 }
                                }
                            }}
                            className="group"
                        >
                            <Link href={`/tienda/${product.slug}`}>
                                <div className="relative aspect-[4/5] rounded-[2.5rem] bg-zinc-900 mb-8 overflow-hidden border border-zinc-800 transition-all duration-500 group-hover:border-fuchsia-500/30 group-hover:shadow-2xl group-hover:shadow-fuchsia-900/10 cursor-pointer">
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

                                    <div className="absolute bottom-8 left-8 right-8">
                                        <div className="flex gap-2 mb-4">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 px-3 py-1 rounded-full backdrop-blur-md">
                                                {product.productType === 'PHYSICAL' ? 'EQUIPAMIENTO' : product.productType}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2 leading-none">{product.name}</h3>
                                        <p className="text-fuchsia-500 font-black text-xl">${Number(product.variants[0]?.price || 0).toFixed(2)}</p>
                                    </div>
                                </div>
                            </Link>

                            <div className="px-4">
                                <Button
                                    onClick={(e) => handleAddToCart(e, product)}
                                    className="w-full bg-white text-zinc-950 hover:bg-fuchsia-600 hover:text-white h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all group-hover:translate-y-[-10px] duration-500 flex items-center gap-3"
                                >
                                    <ShoppingCart className="w-4 h-4" /> Añadir al carrito
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
