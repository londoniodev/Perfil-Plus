"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, CreditCard, ChevronLeft, Star, ShieldCheck, Truck, Package } from "lucide-react";
import { Button, useToast, PriceDisplay } from "@alvarosky/ui";
import Link from "next/link";
import { useCart } from "@/store/use-cart";
import { useRouter } from "next/navigation";

interface ProductDetailClientProps {
    product: any;
    relatedProducts?: any[];
}

export function ProductDetailClient({ product, relatedProducts = [] }: ProductDetailClientProps) {
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || null);
    const [mainImage, setMainImage] = useState(product.images[0] || "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop");
    const [isBuyingNow, setIsBuyingNow] = useState(false);

    const cart = useCart();
    const { success, error } = useToast();
    const router = useRouter();

    const handleAddToCart = (prod: any = product, variant: any = selectedVariant) => {
        if (!variant) {
            error("Por favor, selecciona una variante.");
            return;
        }

        cart.addItem({
            productId: prod.id,
            variantId: variant.id,
            title: prod.name,
            subtitle: variant.name || "Estándar",
            imageSrc: prod.images[0] || mainImage,
            price: Number(variant.price),
            quantity: 1,
            productType: prod.productType
        });

        success(`${prod.name} añadido al carrito`);
    };

    const handleBuyNow = async () => {
        if (!selectedVariant) {
            error("Por favor, selecciona una variante.");
            return;
        }

        setIsBuyingNow(true);
        try {
            // Importar la Server Action dinámicamente
            const { placeOrder } = await import("@/actions/checkout");

            const result = await placeOrder([
                {
                    variantId: selectedVariant.id,
                    quantity: 1
                }
            ]);

            if (result.success && result.paymentUrl) {
                window.location.href = result.paymentUrl;
            } else {
                error(result.error || "Error al procesar la compra");
                setIsBuyingNow(false);
            }
        } catch (err) {
            console.error("Error en Buy Now:", err);
            error("Error al conectar con el servidor");
            setIsBuyingNow(false);
        }
    };

    return (
        <div className="bg-zinc-950 min-h-screen text-white pt-32 pb-20">
            <div className="container px-4">
                {/* Back Button */}
                <Link href="/tienda" className="inline-flex items-center gap-2 text-zinc-500 hover:text-fuchsia-500 transition-colors mb-12 group">
                    <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span className="text-xs font-black uppercase tracking-widest">Volver a la tienda</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
                    {/* Left: Image Gallery */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            {/* Thumbnails */}
                            <div className="md:col-span-2 order-2 md:order-1 flex md:flex-col gap-4">
                                {product.images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(img)}
                                        className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${mainImage === img ? "border-fuchsia-500 p-0.5" : "border-zinc-800 opacity-50 hover:opacity-100"}`}
                                    >
                                        <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover rounded-xl" />
                                    </button>
                                ))}
                            </div>

                            {/* Main Image View */}
                            <div className="md:col-span-10 order-1 md:order-2">
                                <motion.div
                                    key={mainImage}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="aspect-[4/5] rounded-[3rem] bg-zinc-900 border border-zinc-800 overflow-hidden relative group"
                                >
                                    <img src={mainImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent" />
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Product Details */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            {/* Badge & Rating */}
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 px-4 py-1.5 rounded-full backdrop-blur-md">
                                    {product.productType === 'PHYSICAL' ? 'EQUIPAMIENTO' : product.productType}
                                </span>
                                <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
                                    <Star className="w-3 h-3 text-fuchsia-500 fill-fuchsia-500" />
                                    <span className="text-xs font-bold">4.9</span>
                                    <span className="text-zinc-500 text-[10px] ml-1">(124 reseñas)</span>
                                </div>
                            </div>

                            <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter leading-none uppercase">
                                {product.name}
                            </h1>

                            <PriceDisplay
                                price={selectedVariant?.price || 0}
                                currency="COP"
                                className="mb-8"
                                size="lg"
                            />

                            <p className="text-zinc-400 text-lg leading-relaxed mb-10 font-medium">
                                {product.description || "Potencia tu rendimiento con este producto exclusivo. Diseñado para ofrecer la máxima calidad y resultados extraordinarios en tu rutina diaria."}
                            </p>

                            {/* Variant Selector */}
                            {product.variants.length > 1 && (
                                <div className="mb-10">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Seleccionar Opción</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {product.variants.map((variant: any) => (
                                            <button
                                                key={variant.id}
                                                onClick={() => setSelectedVariant(variant)}
                                                className={`px-6 py-4 rounded-2xl text-xs font-bold transition-all border ${selectedVariant?.id === variant.id ? "bg-fuchsia-600 border-fuchsia-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"}`}
                                            >
                                                {variant.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-4 mb-12">
                                <Button
                                    onClick={handleBuyNow}
                                    disabled={isBuyingNow}
                                    className="h-16 rounded-[1.25rem] bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-fuchsia-900/40 relative overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        <CreditCard className="w-4 h-4" />
                                        {isBuyingNow ? "Procesando..." : "Comprar Ahora"}
                                    </span>
                                </Button>

                                <Button
                                    onClick={() => handleAddToCart()}
                                    variant="outline"
                                    className="h-16 rounded-[1.25rem] border-zinc-800 bg-zinc-900/50 text-white hover:bg-zinc-800 font-black uppercase tracking-[0.2em] text-[10px] group"
                                >
                                    <span className="flex items-center justify-center gap-3">
                                        <ShoppingCart className="w-4 h-4 transition-transform group-hover:scale-110" />
                                        Añadir al carrito
                                    </span>
                                </Button>
                            </div>

                            {/* Value Props */}
                            <div className="grid grid-cols-1 gap-6 pt-10 border-t border-zinc-900">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800 transition-colors group-hover:border-fuchsia-500/50">
                                        <ShieldCheck className="w-6 h-6 text-fuchsia-500" />
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-black uppercase tracking-widest text-white">Garantía Premium</h5>
                                        <p className="text-[10px] text-zinc-500 font-medium">Pago 100% seguro y devolución garantizada.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800 transition-colors group-hover:border-fuchsia-500/50">
                                        <Truck className="w-6 h-6 text-fuchsia-500" />
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-black uppercase tracking-widest text-white">Envío Rápido</h5>
                                        <p className="text-[10px] text-zinc-500 font-medium">Recibe tu pedido en tiempo récord.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Recommended Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-40">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">Recomendaciones <span className="text-fuchsia-500">Premium</span></h2>
                                <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mt-2">Productos seleccionados para tu transformación</p>
                            </div>
                            <Link href="/tienda" className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-500 hover:text-fuchsia-400 transition-colors border-b border-fuchsia-500/20 pb-1">
                                Ver toda la tienda
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map((item) => (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ y: -10 }}
                                    className="group relative bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-fuchsia-500/30"
                                >
                                    <Link href={`/tienda/${item.slug}`} className="block aspect-square overflow-hidden relative">
                                        <img
                                            src={item.images[0] || "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop"}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                                    </Link>
                                    <div className="p-8">
                                        <h3 className="text-lg font-bold uppercase italic leading-tight mb-2 line-clamp-1 group-hover:text-fuchsia-500 transition-colors uppercase italic">{item.name}</h3>
                                        <PriceDisplay
                                            price={item.variants[0]?.price || 0}
                                            currency="COP"
                                            className="mb-6"
                                            size="sm"
                                        />
                                        <Button
                                            onClick={() => handleAddToCart(item, item.variants[0])}
                                            variant="outline"
                                            className="w-full h-12 rounded-xl border-zinc-800 bg-zinc-900/50 text-[8px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                                        >
                                            Añadir al carrito
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
