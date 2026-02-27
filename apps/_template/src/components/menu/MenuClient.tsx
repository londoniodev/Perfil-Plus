"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Grid3X3,
    MapPin,
    Search,
    X,
    ArrowRight,
    Minus,
    Plus
} from "lucide-react"
import { FaWhatsapp, FaInstagram, FaFacebook, FaXTwitter, FaYoutube, FaTiktok } from "react-icons/fa6"
import { Button } from "@alvarosky/ui"
import { useCart, useOrder, useMenu, type PublicProduct, type PublicCategory, type ProductVariant } from "@alvarosky/restaurant-sdk"
import Image from "next/image"
import dynamic from "next/dynamic"
import { formatCurrency } from "@/lib/utils"

// Lazy loaded modals to strip hundreds of KB from the initial JS bundle
const ProductModal = dynamic(() => import("./ProductModal").then(mod => mod.ProductModal), {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center"><div className="animate-spin text-primary w-10 h-10 border-4 border-current border-t-transparent rounded-full" /></div>
})
const NamePromptModal = dynamic(() => import("./NamePromptModal").then(mod => mod.NamePromptModal), { ssr: false })

// ─────────────────────────────────────────────
// Main Menu Client Component
// ─────────────────────────────────────────────
export default function MenuClient({
    slug,
    table
}: {
    slug: string,
    table?: string
}) {
    const { categories, products, restaurant, isLoading, isError } = useMenu(slug)

    const { addItem, totalItems, cart, total, removeItem, clearCart } = useCart()
    const { createOrder, isSubmitting } = useOrder()

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isNamePromptOpen, setIsNamePromptOpen] = useState(false)
    const [isFloatingCartVisible, setIsFloatingCartVisible] = useState(true)
    const [isSearchActive, setIsSearchActive] = useState(false)
    const [categoryScrollState, setCategoryScrollState] = useState<'start' | 'middle' | 'end'>('start')
    const lastScrollY = useRef(0)
    const categoryScrollRef = useRef<HTMLDivElement>(null)

    const handleCategoryScroll = () => {
        const el = categoryScrollRef.current
        if (!el) return

        const isStart = el.scrollLeft <= 5 // Small buffer
        const isEnd = Math.abs(el.scrollWidth - el.clientWidth - el.scrollLeft) < 5

        if (isStart) setCategoryScrollState('start')
        else if (isEnd) setCategoryScrollState('end')
        else setCategoryScrollState('middle')
    }

    useEffect(() => {
        handleCategoryScroll()

        // Check for MercadoPago redirect status
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const paymentStatus = params.get('payment')
            if (paymentStatus === 'success') {
                alert('✅ ¡Pago realizado con éxito! Tu orden ha sido pagada y ya está en cocina.')
                // Remove parameter from URL to prevent showing alert again on reload
                window.history.replaceState({}, document.title, window.location.pathname)
            } else if (paymentStatus === 'failure') {
                alert('❌ El pago no pudo ser procesado o fue rechazado.')
                window.history.replaceState({}, document.title, window.location.pathname)
            } else if (paymentStatus === 'pending') {
                alert('⏳ El pago está pendiente de confirmación.')
                window.history.replaceState({}, document.title, window.location.pathname)
            }
        }
    }, [])

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategoryId === "ALL" || p.categories?.some((c: PublicCategory) => c.id === selectedCategoryId)
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const currentScrollY = e.currentTarget.scrollTop
        const scrollDiff = currentScrollY - lastScrollY.current

        // Hide FAB on scroll down (if scrolled more than 10px), show on scroll up
        if (scrollDiff > 10 && currentScrollY > 50) {
            setIsFloatingCartVisible(false)
        } else if (scrollDiff < -10 || currentScrollY < 50) {
            setIsFloatingCartVisible(true)
        }

        lastScrollY.current = currentScrollY
    }

    if (isLoading) return <div className="min-h-screen bg-[#f8f7f6] flex items-center justify-center text-primary"><div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full" /></div>
    if (isError || !restaurant) return <div className="min-h-screen bg-[#f8f7f6] flex items-center justify-center text-slate-800">Error loading restaurant</div>

    const restaurantName = restaurant.name
    // Fallbacks
    const logo = restaurant.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${restaurantName}`

    const handleCheckout = () => {
        if (cart.length === 0) return
        setIsNamePromptOpen(true)
    }

    const handleConfirmOrder = async (customerName: string, paymentMethod: "CASH" | "MERCADOPAGO") => {
        const orderData = {
            cart,
            total: total(),
            customer: { name: customerName, phone: "0000000000" },
            tableId: table || undefined,
            paymentMethod: paymentMethod
        }

        const result = await createOrder(slug, orderData)

        if (result.success) {
            setIsNamePromptOpen(false)
            setIsCartOpen(false)
            clearCart()

            if (paymentMethod === "MERCADOPAGO") {
                try {
                    const res = await fetch(`/api/checkout/mercadopago`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId: result.orderId })
                    })
                    const data = await res.json()
                    if (data.init_point) {
                        window.location.href = data.init_point
                    } else {
                        console.error("MP Response:", data)
                        alert(`❌ Error obteniendo link de pago: ${data.error || 'Unknown'}`)
                    }
                } catch (e) {
                    console.error("MP Fetch Error:", e)
                    alert("❌ Error conectando c/ MercadoPago")
                }
            } else {
                alert(`✅ Orden creada exitosamente! #${(result as any).orderNumber || result.orderId}`)
            }
        } else {
            // @ts-ignore
            alert(`❌ Error al crear orden: ${result.error}`)
        }
    }

    // Username format
    const username = "@" + restaurantName.replace(/\s+/g, '').toLowerCase()

    const totalUniqueItems = cart.length
    const totalPrice = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0)

    const handleWhatsAppOrder = () => {
        // Just opens the cart drawer
        setIsCartOpen(true)
    }

    return (
        <div className="h-[100dvh] w-full bg-[#f8f7f6] text-slate-900 font-sans flex flex-col overflow-hidden">
            {/* Header */}
            <header className="shrink-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-12 flex items-center justify-between">
                <div className="flex items-center gap-4 justify-center w-full relative">
                    <h1 className="font-bold text-lg text-slate-900 tracking-tight">{username}</h1>
                </div>
            </header>

            {/* Scrollable Main Content */}
            <main
                className="flex-1 overflow-y-auto scrollbar-hide"
                onScroll={handleScroll}
            >

                {/* Profile Section */}
                <div className="px-4 pt-6 pb-2">
                    <div className="flex items-center justify-between mb-4">
                        {/* Avatar */}
                        <div className="relative p-1 rounded-full bg-gradient-to-tr from-primary to-primary/60">
                            <div className="bg-white p-0.5 rounded-full w-20 h-20 relative overflow-hidden">
                                <Image
                                    src={logo}
                                    alt="Logo"
                                    fill
                                    sizes="80px"
                                    className="object-cover rounded-full"
                                />
                            </div>
                        </div>
                        {/* Stats */}
                        <div className="flex flex-1 justify-around ml-6">
                            <div className="text-center">
                                <p className="font-bold text-lg text-slate-900 leading-tight">
                                    {products.filter(p => !p.categories?.some((c: PublicCategory) => c.slug === 'bebidas')).length}
                                </p>
                                <p className="text-xs text-slate-500">Platos</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-lg text-slate-900 leading-tight">
                                    {products.filter(p => p.categories?.some((c: PublicCategory) => c.slug === 'bebidas')).length}
                                </p>
                                <p className="text-xs text-slate-500">Bebidas</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-lg text-slate-900 leading-tight">
                                    {products.reduce((acc, p) => acc + (p.likesCount || 0), 0)}
                                </p>
                                <p className="text-xs text-slate-500">Likes</p>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-0.5">
                        <h2 className="font-bold text-slate-900 text-sm">{restaurantName}</h2>
                        <p className="text-sm text-slate-800">{restaurant.slogan}</p>
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary" />
                            {restaurant.address || "Ubicación del Restaurante"}
                        </p>
                        <div className="flex items-center gap-4 pt-1">
                            {restaurant.social?.instagram && (
                                <a href={restaurant.social.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                                    <FaInstagram className="w-5 h-5" />
                                </a>
                            )}
                            {restaurant.social?.facebook && (
                                <a href={restaurant.social.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                                    <FaFacebook className="w-5 h-5" />
                                </a>
                            )}
                            {restaurant.social?.twitter && (
                                <a href={restaurant.social.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                                    <FaXTwitter className="w-5 h-5" />
                                </a>
                            )}
                            {restaurant.social?.tiktok && (
                                <a href={restaurant.social.tiktok} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                                    <FaTiktok className="w-5 h-5" />
                                </a>
                            )}
                            {restaurant.social?.youtube && (
                                <a href={restaurant.social.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                                    <FaYoutube className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Consolidated Actions (Search + Social) */}
                <div className="px-4 py-4 flex items-center gap-3">
                    {/* Search Bar - Expandable */}
                    <motion.div
                        layout
                        className={`relative flex items-center bg-slate-100 rounded-full transition-all border border-slate-200 ${isSearchActive ? "flex-1" : "w-12 h-12 justify-center"
                            }`}
                        initial={false}
                    >
                        <Search className={`w-5 h-5 text-slate-400 absolute pointer-events-none ${isSearchActive ? "left-4" : "static"}`} />

                        {isSearchActive ? (
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar..."
                                className="w-full h-12 bg-transparent border-none outline-none pl-12 pr-10 text-sm md:text-base text-slate-800 placeholder:text-slate-400 rounded-full"
                                onBlur={() => {
                                    if (!searchQuery) setIsSearchActive(false)
                                }}
                            />
                        ) : (
                            <button
                                onClick={() => setIsSearchActive(true)}
                                className="absolute inset-0 w-full h-full rounded-full"
                                aria-label="Abrir búsqueda"
                            />
                        )}

                        {isSearchActive && (
                            <button
                                onClick={() => {
                                    setSearchQuery("")
                                    setIsSearchActive(false)
                                }}
                                className="absolute right-3 p-1 rounded-full bg-slate-200 text-slate-500"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </motion.div>

                    {/* WhatsApp Button - Collapsible */}
                    <motion.a
                        layout
                        href={restaurant.social?.whatsapp ? `https://wa.me/${restaurant.social.whatsapp}` : "#"}
                        target={restaurant.social?.whatsapp ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className={`bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold h-12 rounded-full active:opacity-80 transition-colors flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap shadow-sm shadow-[#25D366]/20 ${isSearchActive ? "w-12 px-0" : "flex-1 px-4"
                            }`}
                    >
                        <FaWhatsapp className="w-6 h-6 shrink-0" />
                        {!isSearchActive && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="text-sm"
                            >
                                WhatsApp
                            </motion.span>
                        )}
                    </motion.a>
                </div>

                <div className="mt-4" />

                {/* Categories (Story Style) */}
                <div
                    className="relative"
                    style={{
                        maskImage: categoryScrollState === 'start'
                            ? 'linear-gradient(to right, black 90%, transparent 100%)'
                            : categoryScrollState === 'end'
                                ? 'linear-gradient(to right, transparent 0%, black 10%)'
                                : 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                        WebkitMaskImage: categoryScrollState === 'start'
                            ? 'linear-gradient(to right, black 90%, transparent 100%)'
                            : categoryScrollState === 'end'
                                ? 'linear-gradient(to right, transparent 0%, black 10%)'
                                : 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'
                    }}
                >
                    <div
                        ref={categoryScrollRef}
                        onScroll={handleCategoryScroll}
                        className="flex gap-4 px-4 pb-6 pt-2 overflow-x-auto scrollbar-hide"
                    >
                        <div
                            onClick={() => setSelectedCategoryId("ALL")}
                            className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group"
                        >
                            <div className={`w-[72px] h-[72px] rounded-full p-[2px] transition-all ${selectedCategoryId === "ALL"
                                ? "bg-gradient-to-tr from-primary to-primary/60"
                                : "bg-transparent border-2 border-dashed border-slate-300 group-hover:border-primary/50"
                                }`}>
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative border border-slate-100">
                                    <Grid3X3 className={`w-6 h-6 ${selectedCategoryId === "ALL" ? "text-primary" : "text-slate-400"}`} />
                                    {selectedCategoryId === "ALL" && (
                                        <div className="absolute inset-0 bg-primary opacity-10" />
                                    )}
                                </div>
                            </div>
                            <span className={`text-xs font-medium transition-colors ${selectedCategoryId === "ALL" ? "text-primary font-bold" : "text-slate-500"
                                }`}>
                                Ver Todo
                            </span>
                        </div>

                        {categories.map((cat) => {
                            // Find first product image for this category
                            const catImage = products.find(p => p.categories?.some((c: PublicCategory) => c.id === cat.id))?.images?.[0]
                                || '/placeholder.jpg'
                            const isFallback = !products.find(p => p.categories?.some((c: PublicCategory) => c.id === cat.id))?.images?.[0]

                            return (
                                <div
                                    key={cat.id}
                                    onClick={() => setSelectedCategoryId(cat.id)}
                                    className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group"
                                >
                                    <div className={`w-[72px] h-[72px] rounded-full p-[2px] transition-all ${selectedCategoryId === cat.id
                                        ? "bg-gradient-to-tr from-primary to-primary/60 shadow-lg shadow-primary/20 scale-105"
                                        : "bg-transparent border-2 border-slate-200 group-hover:border-primary/50"
                                        }`}>
                                        <div className="w-full h-full rounded-full bg-slate-100 overflow-hidden relative border border-white">
                                            <Image
                                                src={catImage}
                                                alt={cat.name}
                                                fill
                                                sizes="72px"
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                unoptimized={isFallback}
                                            />
                                        </div>
                                    </div>

                                    <span className={`text-xs font-medium text-center truncate w-20 transition-colors ${selectedCategoryId === cat.id ? "text-primary font-bold" : "text-slate-500"
                                        }`}>
                                        {cat.name}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="border-b border-slate-200 mx-4 mb-2" />

                {/* Social Grid (Menu Items) - Animated */}
                <motion.div
                    layout
                    className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-[2px] bg-slate-100 pb-20"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                whileTap={{ scale: 0.95 }}
                                key={product.id}
                                onClick={() => setSelectedProduct(product)}
                                className="aspect-square relative cursor-pointer group overflow-hidden bg-white"
                            >
                                <Image
                                    src={product.images?.[0] || "/placeholder.jpg"}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 15vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    unoptimized={!product.images?.[0]}
                                />
                                {((product as any).isAvailable === false) && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                                        <span className="text-slate-800 text-xs font-bold px-2 py-1 border border-slate-300 rounded-full bg-white/80 shadow-sm">
                                            AGOTADO
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filteredProducts.length === 0 && (
                        <div className="col-span-3 py-10 text-center text-slate-400 w-full">
                            No hay productos en esta categoría
                        </div>
                    )}
                </motion.div>
            </main>

            <AnimatePresence>
                {/* Floating Cart Button */}
                {totalUniqueItems > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-4 right-4 z-50 flex justify-center pointer-events-none"
                    >
                        <button
                            onClick={handleWhatsAppOrder}
                            className="w-full max-w-sm bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-full shadow-xl shadow-primary/25 flex items-center justify-between pointer-events-auto transition-transform active:scale-95"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-white">
                                    {totalUniqueItems}
                                </div>
                                <span className="font-bold text-sm text-white">Ver pedido</span>
                            </div>

                            <div className="flex items-center gap-2 text-white">
                                <span className="text-sm font-bold bg-black/10 px-2 py-1 rounded-lg">{formatCurrency(totalPrice)}</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {selectedProduct && (
                    <ProductModal
                        slug={slug}
                        product={selectedProduct}
                        suggestedProducts={products.filter(p => p.id !== selectedProduct.id).slice(0, 5)}
                        onProductSelect={setSelectedProduct}
                        onClose={() => setSelectedProduct(null)}
                        onAddToCart={(p, v, m, q) => {
                            addItem({
                                productId: p.id,
                                name: p.name,
                                variantId: v,
                                price: Number(p.variants?.find((va: ProductVariant) => va.id === v)?.price ?? p.basePrice) || 0,
                                quantity: q,
                                modifiers: m,
                                image: p.images?.[0]
                            })
                            setSelectedProduct(null)
                        }}
                        restaurantName={restaurantName}
                        restaurantLogo={logo}
                    />
                )}
            </AnimatePresence>

            {/* Cart Drawer */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80]"
                            onClick={() => setIsCartOpen(false)}
                        />
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[90] max-h-[85vh] overflow-hidden flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)] text-slate-900"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/90 backdrop-blur-xl">
                                <h2 className="text-2xl font-bold text-slate-900">Tu Pedido</h2>
                                <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="text-slate-500 hover:bg-slate-100">
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {cart.map((item) => (
                                    <div key={item.variantId} className="flex gap-4 items-center">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {item.image && (
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    sizes="80px"
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-slate-900">{item.name}</h4>
                                            <p className="text-primary font-semibold text-sm">{formatCurrency(item.price)}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-1 text-slate-700">
                                            <button onClick={() => item.quantity > 1 ? addItem({ ...item, quantity: -1 }) : removeItem(item.variantId)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded-md transition-colors"><Minus className="w-4 h-4" /></button>
                                            <span className="font-bold w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => addItem({ ...item, quantity: 1 })} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded-md transition-colors"><Plus className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                                {cart.length === 0 && <p className="text-center text-slate-400 py-10 font-medium">Tu carrito está vacío</p>}
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-200 pb-10">
                                <div className="flex justify-between items-center mb-6 text-xl font-bold text-slate-900">
                                    <span>Total</span>
                                    <span className="text-primary">{formatCurrency(total())}</span>
                                </div>
                                <Button className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 rounded-xl" onClick={handleCheckout} disabled={isSubmitting || cart.length === 0}>
                                    {isSubmitting ? "Procesando..." : "Confirmar Pedido"}
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <NamePromptModal
                isOpen={isNamePromptOpen}
                onClose={() => setIsNamePromptOpen(false)}
                onConfirm={handleConfirmOrder}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
