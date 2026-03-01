"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeft,
    MoreHorizontal,
    Tag,
    ThumbsUp,
    MessageSquare,
    Share2,
    Bookmark,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Minus,
    Plus,
    ArrowRight,
    BadgeCheck
} from "lucide-react"
import Image from "next/image"
import type { PublicProduct } from "@alvarosky/restaurant-sdk"
import { PhoneAuthModal } from "./PhoneAuthModal"
import { formatCurrency } from "@/lib/utils"

// Fallback food images for products without uploaded photos
const FOOD_FALLBACK_IMAGES = [
    '/dashboard/images/food/food-1.png', // burger
    '/dashboard/images/food/food-2.png', // fries
    '/dashboard/images/food/food-3.png', // smoothie
    '/dashboard/images/food/food-4.png', // salad
    '/dashboard/images/food/food-5.png', // pizza
    '/dashboard/images/food/food-6.png', // dessert
]

/** Deterministic fallback image based on product id or name */
function getFallbackImage(id: string, name?: string): string {
    if (name) {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('burger') || lowerName.includes('hamburguesa')) return FOOD_FALLBACK_IMAGES[0];
        if (lowerName.includes('papa') || lowerName.includes('frie') || lowerName.includes('salchipapa')) return FOOD_FALLBACK_IMAGES[1];
        if (lowerName.includes('jugo') || lowerName.includes('smoothie') || lowerName.includes('limonada') || lowerName.includes('gaseosa') || lowerName.includes('malteada')) return FOOD_FALLBACK_IMAGES[2];
        if (lowerName.includes('ensalada') || lowerName.includes('salad') || lowerName.includes('nuggets')) return FOOD_FALLBACK_IMAGES[3];
        if (lowerName.includes('pizza') || lowerName.includes('perro caliente')) return FOOD_FALLBACK_IMAGES[4];
        if (lowerName.includes('postre') || lowerName.includes('brownie') || lowerName.includes('dessert')) return FOOD_FALLBACK_IMAGES[5];
    }
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FOOD_FALLBACK_IMAGES[sum % FOOD_FALLBACK_IMAGES.length]
}
export function ProductModal({
    slug,
    product,
    suggestedProducts = [],
    onClose,
    onAddToCart,
    onProductSelect,
    restaurantName,
    restaurantLogo
}: {
    slug: string
    product: PublicProduct
    suggestedProducts?: PublicProduct[]
    onClose: () => void
    onAddToCart: (product: PublicProduct, variantId: string, selectedModifiers: any[], quantity: number) => void
    onProductSelect: (product: PublicProduct) => void
    restaurantName: string
    restaurantLogo: string
}) {
    const [quantity, setQuantity] = useState(1)
    const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]?.id || product.id)
    const [selectedModifiers, setSelectedModifiers] = useState<Record<string, Record<string, { price: number; qty: number; name: string }>>>({})

    // Social State
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(product.likesCount || 0)
    const [comments, setComments] = useState(product.comments || [])
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [showPhoneAuth, setShowPhoneAuth] = useState(false)
    const [pendingAction, setPendingAction] = useState<"LIKE" | "COMMENT" | null>(null)
    const [commentText, setCommentText] = useState("")
    const [isCommentsExpanded, setIsCommentsExpanded] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            const scrollHeight = textareaRef.current.scrollHeight
            textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`
            textareaRef.current.style.overflowY = scrollHeight > 120 ? 'auto' : 'hidden'
        }
    }, [commentText])

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    // Load initial state
    useEffect(() => {
        const checkStatus = async () => {
            const userPhone = localStorage.getItem('user_phone')
            if (userPhone) {
                try {
                    const res = await fetch(`${API_URL}/public/restaurant/${slug}/products/${product.id}/like-status/${userPhone}`)
                    if (res.ok) {
                        const data = await res.json()
                        setIsLiked(data.isLiked)
                    }
                } catch (e) {
                    console.error("Failed to check like status", e)
                }
            }
        }
        checkStatus()
    }, [product.id, slug, API_URL])

    // Close on Escape or back button
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        window.history.pushState({ modal: true }, '')
        const handlePopState = () => onClose()
        window.addEventListener('popstate', handlePopState)
        document.body.style.overflow = 'hidden'
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('popstate', handlePopState)
            document.body.style.overflow = ''
        }
    }, [onClose])

    const currentVariant = product.variants?.find((v: any) => v.id === selectedVariant)
    const unitPrice = currentVariant?.price ?? product.basePrice

    const modifierTotal = Object.values(selectedModifiers).reduce((groupSum, mods) => {
        return groupSum + Object.entries(mods).reduce((sum, [_, data]) => {
            return sum + (data as any).price * (data as any).qty
        }, 0)
    }, 0)

    const totalPrice = (unitPrice + modifierTotal) * quantity

    const toggleModifier = (groupId: string, modifier: any, maxSelect: number) => {
        setSelectedModifiers(prev => {
            const group = { ...(prev[groupId] || {}) }
            if (group[modifier.id]) {
                delete group[modifier.id]
            } else {
                const currentCount = Object.keys(group).length
                if (currentCount >= maxSelect) {
                    if (maxSelect === 1) {
                        return { ...prev, [groupId]: { [modifier.id]: { price: modifier.price, qty: 1, name: modifier.name } } }
                    }
                    return prev
                }
                group[modifier.id] = { price: modifier.price, qty: 1, name: modifier.name }
            }
            return { ...prev, [groupId]: group }
        })
    }

    const handleAdd = () => {
        if (product.modifierGroups) {
            for (const group of product.modifierGroups) {
                const selectedInGroup = selectedModifiers[group.id] ? Object.keys(selectedModifiers[group.id]).length : 0;
                const minSelections = (group as any).minSelect ?? (group as any).minSelections ?? 0;
                if (selectedInGroup < minSelections) {
                    alert(`Por favor selecciona al menos ${minSelections} opción(es) para ${group.name}`);
                    return;
                }
            }
        }

        const flatModifiers = Object.values(selectedModifiers).flatMap(group =>
            Object.entries(group).map(([id, data]) => ({
                modifierId: id,
                modifierName: (data as any).name,
                priceAdjustment: Number((data as any).price) || 0,
                quantity: (data as any).qty
            }))
        )
        onAddToCart(product, selectedVariant, flatModifiers, quantity)
        onClose()
    }

    // Social Actions
    const handleSocialAction = (action: "LIKE" | "COMMENT") => {
        const userPhone = localStorage.getItem('user_phone')
        if (!userPhone) {
            setPendingAction(action)
            setShowPhoneAuth(true)
            return
        }
        executeAction(action, userPhone)
    }

    const executeAction = async (action: "LIKE" | "COMMENT", phone: string) => {
        if (action === "LIKE") {
            // Optimistic update
            const newIsLiked = !isLiked
            setIsLiked(newIsLiked)
            setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1))

            try {
                await fetch(`${API_URL}/public/restaurant/${slug}/products/${product.id}/like`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userPhone: phone })
                })
            } catch (e) {
                // Revert on error
                setIsLiked(!newIsLiked)
                setLikesCount(prev => !newIsLiked ? prev + 1 : Math.max(0, prev - 1))
            }
        } else if (action === "COMMENT") {
            if (!commentText.trim()) return

            const newComment = {
                id: Date.now().toString(),
                userName: "Yo",
                content: commentText,
                createdAt: new Date().toISOString()
            }

            // Optimistic update
            setComments(prev => [newComment, ...prev])
            setCommentText("")

            try {
                await fetch(`${API_URL}/public/restaurant/${slug}/products/${product.id}/comment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userPhone: phone, content: newComment.content })
                })
            } catch (e) {
                setComments(prev => prev.filter(c => c.id !== newComment.id))
            }
        }
    }

    const handleAuthSuccess = (phone: string) => {
        localStorage.setItem('user_phone', phone)
        setShowPhoneAuth(false)
        if (pendingAction) {
            executeAction(pendingAction, phone)
            setPendingAction(null)
        }
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Mira este plato: ${product.name}`,
                    text: `Te recomiendo probar ${product.name} en nuestro restaurante!`,
                    url: window.location.href
                })
            } catch (error) {
                console.log('Error sharing', error)
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href)
            alert("Link copiado al portapapeles!")
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                key="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
                onClick={onClose}
            />
            {/* Main Modal Container */}
            <motion.div
                key="modal-content"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="fixed inset-0 sm:inset-x-0 sm:bottom-0 sm:top-auto sm:max-h-[96vh] bg-white sm:rounded-t-3xl z-[70] overflow-hidden flex flex-col sm:border-t border-slate-200 shadow-2xl shadow-black/10"
            >
                {/* Header */}
                <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="text-slate-600 hover:text-slate-900 transition-colors -ml-1">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="text-lg font-bold text-slate-900">Detalle</div>
                    </div>
                </header>

                {/* Main Content Area (Scrollable) */}
                <main className="flex-1 overflow-y-auto pb-32">
                    <article className="bg-[#f8f9fa]">
                        {/* User Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-primary to-primary/60">
                                        <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative">
                                            <Image
                                                src={restaurantLogo || '/placeholder.png'}
                                                alt="Logo"
                                                fill
                                                sizes="40px"
                                                className="object-cover bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1">
                                        <h3 className="text-sm font-bold text-slate-900">{restaurantName}</h3>
                                        <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500" />
                                    </div>
                                    <p className="text-xs text-slate-500">{product.name}</p>
                                </div>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                <MoreHorizontal className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Hero Image */}
                        <div className="relative w-full aspect-square bg-slate-100">
                            <Image
                                src={product.images?.[0] || getFallbackImage(product.id, product.name)}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                                className="object-cover"
                            />
                            {/* Image Overlay Tags */}
                            <div className="absolute bottom-4 left-4 bg-white/90 shadow-sm backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 border border-slate-200/50">
                                <Tag className="w-3 h-3 text-slate-700" />
                                <span className="text-slate-900 text-xs font-bold">{formatCurrency(unitPrice)}</span>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="px-4 py-4 bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => handleSocialAction("LIKE")} className={`transition-transform hover:scale-110 ${isLiked ? 'text-primary' : 'text-slate-700 hover:text-slate-900'}`}>
                                        <ThumbsUp className={`w-7 h-7 ${isLiked ? 'fill-current' : ''}`} />
                                    </button>
                                    <button onClick={() => textareaRef.current?.focus()} className="text-slate-700 hover:text-slate-900 transition-colors">
                                        <MessageSquare className="w-7 h-7" />
                                    </button>
                                    <button onClick={handleShare} className="text-slate-700 hover:text-slate-900 transition-colors">
                                        <Share2 className="w-7 h-7" />
                                    </button>
                                </div>
                                <button onClick={() => setIsBookmarked(!isBookmarked)} className={`transition-colors hover:text-slate-900 ${isBookmarked ? 'text-primary' : 'text-slate-700'}`}>
                                    <Bookmark className={`w-7 h-7 ${isBookmarked ? 'fill-current' : ''}`} />
                                </button>
                            </div>

                            {/* Likes */}
                            <div className="flex items-center gap-2 mb-3">
                                <p className="text-sm text-slate-900 font-bold">
                                    {likesCount} {likesCount === 1 ? 'me gusta' : 'me gustas'}
                                </p>
                            </div>

                            {/* Caption */}
                            <div className="mb-6">
                                <p className="text-sm text-slate-800 leading-relaxed">
                                    <span className="font-bold mr-1 text-slate-900">{restaurantName}</span>
                                    {product.description}{" "}
                                    <span className="text-primary font-medium">#delicioso #foodie</span>
                                </p>
                            </div>

                            {/* Modifiers Section (Integrated) */}
                            {product.variants && product.variants.length > 1 && (
                                <div className="mb-6 space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Elige una opción</p>
                                    <div className="space-y-2">
                                        {product.variants.map((variant: any) => (
                                            <button
                                                key={variant.id}
                                                onClick={() => setSelectedVariant(variant.id)}
                                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-sm font-medium ${selectedVariant === variant.id ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
                                            >
                                                <span>{variant.name}</span>
                                                <span className={selectedVariant === variant.id ? "font-bold" : ""}>{formatCurrency(Number(variant.price))}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Modifier Groups Section */}
                            {product.modifierGroups && product.modifierGroups.length > 0 && (
                                <div className="mb-6 space-y-4">
                                    {product.modifierGroups.map((group: any) => {
                                        const minSelections = group.minSelect ?? group.minSelections ?? 0;
                                        const maxSelections = group.maxSelect ?? group.maxSelections ?? 1;

                                        return (
                                            <div key={group.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                                <div className="flex justify-between items-center mb-3">
                                                    <p className="text-xs font-bold uppercase text-slate-800 tracking-wider">{group.name}</p>
                                                    <p className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${minSelections > 0 ? 'text-amber-700 bg-amber-100' : 'text-slate-500 bg-slate-200'}`}>
                                                        {minSelections > 0 ? `Requerido (Mín. ${minSelections})` : 'Opcional'}
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    {group.modifiers?.map((mod: any) => {
                                                        const groupSelections = selectedModifiers[group.id] || {};
                                                        const isSelected = !!groupSelections[mod.id];

                                                        return (
                                                            <button
                                                                key={mod.id}
                                                                onClick={() => toggleModifier(group.id, mod, maxSelections)}
                                                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-sm font-medium ${isSelected ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-slate-300 bg-white'}`}>
                                                                        {isSelected && maxSelections === 1 && <div className="w-2 h-2 rounded-full bg-white" />}
                                                                        {isSelected && maxSelections > 1 && <div className="w-2 h-2 bg-white rotate-45" style={{ clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)' }} />}
                                                                    </div>
                                                                    <span>{mod.name}</span>
                                                                </div>
                                                                <span className={`text-xs ${isSelected ? 'font-bold' : 'font-medium text-slate-500'}`}>
                                                                    {Number(mod.price) > 0 ? `+${formatCurrency(Number(mod.price))}` : ''}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}



                            {/* Comments Section */}
                            <div className="border-t border-slate-100 pt-6 mt-2 relative group">
                                <h4 className="flex items-center gap-2 text-sm font-bold mb-4 text-slate-900 tracking-tight">
                                    <MessageCircle className="w-4 h-4 text-slate-500" />
                                    Comentarios ({comments.length})
                                </h4>

                                <div className="space-y-4 mb-6 relative">
                                    {comments.length === 0 ? (
                                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100/50 shadow-sm">
                                            <p className="text-sm text-slate-500 mb-2 font-medium">Aún no hay opiniones</p>
                                            <p className="text-xs text-primary font-bold">¡Sé el primero en probarlo!</p>
                                        </div>
                                    ) : (
                                        <>
                                            {(isCommentsExpanded ? comments : comments.slice(0, 5)).map((comment) => (
                                                <div key={comment.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-primary/50 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                                                                {comment.userName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-bold text-sm text-slate-900">{comment.userName}</span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-700 leading-relaxed pl-9">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            ))}

                                            {/* Expand Overlay */}
                                            {!isCommentsExpanded && comments.length > 5 && (
                                                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/95 to-transparent flex items-end justify-center pb-0 z-10 pt-10">
                                                    <button
                                                        onClick={() => setIsCommentsExpanded(true)}
                                                        className="flex items-center gap-2 text-primary font-bold text-sm bg-white px-6 py-2.5 rounded-full shadow-lg border border-slate-100 hover:scale-105 hover:shadow-xl transition-all"
                                                    >
                                                        Ver más opiniones
                                                        <ChevronDown className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Collapse Button (Sticky inside map container) */}
                                            {isCommentsExpanded && (
                                                <div className="sticky bottom-4 flex justify-center z-20 py-4 transition-opacity duration-300">
                                                    <button
                                                        onClick={() => setIsCommentsExpanded(false)}
                                                        className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold text-xs bg-white px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl border border-slate-200 hover:scale-105 transition-all"
                                                    >
                                                        Ver menos
                                                        <ChevronUp className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Add Comment Input */}
                                <div className="relative">
                                    <textarea
                                        ref={textareaRef}
                                        id="comment-input"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Escribe tu opinión..."
                                        rows={1}
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3.5 pl-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 placeholder:text-slate-500 resize-none overflow-hidden min-h-[48px] transition-all"
                                        style={{ maxHeight: '120px' }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSocialAction("COMMENT")
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => handleSocialAction("COMMENT")}
                                        disabled={!commentText.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-sm"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-2 bg-slate-100 w-full mb-4 border-y border-slate-200"></div>

                        {/* Suggested Items */}
                        <div className="px-4 pb-8 mb-4">
                            <h4 className="text-sm font-bold text-slate-900 mb-4 tracking-tight">Combina bien con</h4>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 snap-x">
                                {suggestedProducts.map(item => (
                                    <div key={item.id} className="flex-shrink-0 w-[140px] group cursor-pointer snap-start" onClick={() => {
                                        onProductSelect(item)
                                    }}>
                                        <div className="w-[140px] h-[140px] rounded-2xl overflow-hidden mb-3 relative bg-slate-100 border border-slate-200 shadow-sm">
                                            <Image
                                                src={item.images?.[0] || getFallbackImage(item.id, item.name)}
                                                alt={item.name}
                                                fill
                                                sizes="150px"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 truncate mb-0.5 group-hover:text-primary transition-colors">{item.name}</p>
                                        <p className="text-sm text-slate-500 font-medium">{formatCurrency(Number(item.basePrice))}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </article>
                </main>

                {/* Sticky Action Footer */}
                <div className="absolute bottom-0 w-full z-30">
                    <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-4 pb-8 sm:pb-4 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
                            <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1.5 h-14 border border-slate-200 shadow-inner">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-full flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-slate-700 transition-all"><Minus className="w-5 h-5" /></button>
                                <span className="font-bold text-slate-900 w-6 text-center text-lg">{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-full flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-slate-700 transition-all"><Plus className="w-5 h-5" /></button>
                            </div>

                            <button
                                onClick={handleAdd}
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 px-6 rounded-xl shadow-lg shadow-primary/25 flex items-center justify-between gap-2 transition-all active:scale-[0.98] whitespace-nowrap text-lg"
                            >
                                <span>Añadir</span>
                                <span className="bg-black/10 px-2 py-1 rounded-lg text-sm">{formatCurrency(totalPrice)}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <PhoneAuthModal
                    isOpen={showPhoneAuth}
                    onClose={() => setShowPhoneAuth(false)}
                    onSuccess={handleAuthSuccess}
                />
            </motion.div>
        </AnimatePresence>
    )
}
