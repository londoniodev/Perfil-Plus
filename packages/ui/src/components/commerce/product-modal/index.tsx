"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { PublicProduct } from "@alvarosky/restaurant-sdk"
import { useProductSocial } from "../../../hooks/use-product-social"
import { useProductModifiers } from "../../../hooks/use-product-modifiers"

import { ProductModalHeader } from "./product-modal-header"
import { ProductHero } from "./product-hero"
import { ProductSocialActions } from "./product-social-actions"
import { ProductVariantSelector, ProductModifierGroup } from "./product-modifier-group"
import { ProductComments } from "./product-comments"
import { ProductRecommendations } from "./product-recommendations"
import { ProductStickyFooter } from "./product-sticky-footer"
import { PhoneAuthModal } from "./phone-auth-modal"

export function ProductModal({
    product,
    apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    suggestedProducts = [],
    onClose,
    onAddToCart,
    onProductSelect,
    restaurantName,
    restaurantLogo
}: {
    product: PublicProduct
    apiUrl?: string
    suggestedProducts?: PublicProduct[]
    onClose: () => void
    onAddToCart: (product: PublicProduct, variantId: string, selectedModifiers: any[], quantity: number) => void
    onProductSelect: (product: PublicProduct) => void
    restaurantName: string
    restaurantLogo: string
}) {
    // 1. Hook para Variantes, Precios y Modificadores
    const modifiersState = useProductModifiers(product)

    // 2. Hook para Estado Social (Likes, Shares, Comments)
    const socialState = useProductSocial({
        product,
        apiUrl
    })

    // Control del Overlay en Body / Cancel con ESC
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

    const handleAdd = () => {
        if (!modifiersState.validateSelections()) return;
        
        onAddToCart(
            product, 
            modifiersState.selectedVariant, 
            modifiersState.getFlatModifiers(), 
            modifiersState.quantity
        );
        onClose();
    }

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                key="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Main Dialog */}
            <motion.div
                key="modal-content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-modal-title"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="fixed inset-0 sm:inset-x-0 sm:bottom-0 sm:top-auto sm:max-h-[96vh] bg-white sm:rounded-t-3xl z-[70] overflow-hidden flex flex-col sm:border-t border-slate-200 shadow-2xl shadow-black/10"
            >
                <ProductModalHeader onClose={onClose} />

                <main className="flex-1 overflow-y-auto pb-32">
                    <article className="bg-[#f8f9fa]">
                        <ProductHero 
                            product={product}
                            unitPrice={modifiersState.unitPrice}
                            restaurantName={restaurantName}
                            restaurantLogo={restaurantLogo}
                        />

                        <ProductSocialActions 
                            isLiked={socialState.isLiked}
                            likesCount={socialState.likesCount}
                            isBookmarked={socialState.isBookmarked}
                            restaurantName={restaurantName}
                            productDescription={product.description}
                            onLike={() => socialState.handleSocialAction("LIKE")}
                            onCommentFocus={() => document.getElementById("comment-input")?.focus()}
                            onShare={() => socialState.handleShare()}
                            onBookmark={() => socialState.setIsBookmarked(!socialState.isBookmarked)}
                        />

                        {/* Modifiers Section */}
                        {(product.variants && product.variants.length > 1 || (product.modifierGroups && product.modifierGroups.length > 0)) && (
                            <section aria-label="Opciones de personalización" className="px-4 py-4 space-y-4">
                                <ProductVariantSelector 
                                    variants={product.variants ?? []} 
                                    selectedVariant={modifiersState.selectedVariant}
                                    onSelect={modifiersState.setSelectedVariant}
                                />
                                {product.modifierGroups?.map((group: any) => (
                                    <ProductModifierGroup 
                                        key={group.id}
                                        group={group}
                                        selectedModifiers={modifiersState.selectedModifiers}
                                        toggleModifier={modifiersState.toggleModifier}
                                    />
                                ))}
                            </section>
                        )}

                        <ProductComments 
                            comments={socialState.comments}
                            commentText={socialState.commentText}
                            setCommentText={socialState.setCommentText}
                            onCommentSubmit={() => socialState.handleSocialAction("COMMENT")}
                        />

                        <div className="h-2 bg-slate-100 w-full mb-4 border-y border-slate-200" aria-hidden="true"></div>

                        <ProductRecommendations 
                            suggestedProducts={suggestedProducts} 
                            onProductSelect={onProductSelect} 
                        />
                    </article>
                </main>

                <ProductStickyFooter 
                    quantity={modifiersState.quantity}
                    setQuantity={modifiersState.setQuantity}
                    totalPrice={modifiersState.totalPrice}
                    onAdd={handleAdd}
                    hasModifiers={!!(product.modifierGroups && product.modifierGroups.length > 0)}
                />

                <PhoneAuthModal
                    isOpen={socialState.showPhoneAuth}
                    onClose={() => socialState.setShowPhoneAuth(false)}
                    onSuccess={socialState.handleAuthSuccess}
                />
            </motion.div>
        </AnimatePresence>
    )
}
