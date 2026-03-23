"use client"

import { useState, useEffect } from "react"
import type { PublicProduct } from "@alvarosky/restaurant-sdk"

export function useProductSocial({
    product,
    apiUrl
}: {
    product: PublicProduct
    apiUrl: string
}) {
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(product.likesCount || 0)
    const [comments, setComments] = useState(product.comments || [])
    const [isBookmarked, setIsBookmarked] = useState(false)
    
    // Auth related
    const [showPhoneAuth, setShowPhoneAuth] = useState(false)
    const [pendingAction, setPendingAction] = useState<"LIKE" | "COMMENT" | null>(null)
    const [commentText, setCommentText] = useState("")

    const API_URL = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`

    useEffect(() => {
        const checkStatus = async () => {
            const userPhone = localStorage.getItem('user_phone')
            if (userPhone) {
                try {
                    const res = await fetch(`${API_URL}/public/restaurant/products/${product.id}/like-status/${userPhone}`)
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
    }, [product.id, API_URL])

    const executeAction = async (action: "LIKE" | "COMMENT", phone: string) => {
        if (action === "LIKE") {
            const newIsLiked = !isLiked
            setIsLiked(newIsLiked)
            setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1))

            try {
                await fetch(`${API_URL}/public/restaurant/products/${product.id}/like`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userPhone: phone })
                })
            } catch (e) {
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

            setComments(prev => [newComment, ...prev])
            setCommentText("")

            try {
                await fetch(`${API_URL}/public/restaurant/products/${product.id}/comment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userPhone: phone, content: newComment.content })
                })
            } catch (e) {
                setComments(prev => prev.filter(c => c.id !== newComment.id))
            }
        }
    }

    const handleSocialAction = (action: "LIKE" | "COMMENT") => {
        const userPhone = localStorage.getItem('user_phone')
        if (!userPhone) {
            setPendingAction(action)
            setShowPhoneAuth(true)
            return
        }
        executeAction(action, userPhone)
    }

    const handleAuthSuccess = (phone: string) => {
        localStorage.setItem('user_phone', phone)
        setShowPhoneAuth(false)
        if (pendingAction) {
            executeAction(pendingAction, phone)
            setPendingAction(null)
        }
    }

    const handleShare = async (url: string = window.location.href) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Mira este plato: ${product.name}`,
                    text: `Te recomiendo probar ${product.name} en nuestro restaurante!`,
                    url
                })
            } catch (error) {
                console.log('Error sharing', error)
            }
        } else {
            navigator.clipboard.writeText(url)
            alert("Link copiado al portapapeles!")
        }
    }

    return {
        isLiked,
        likesCount,
        comments,
        isBookmarked,
        setIsBookmarked,
        showPhoneAuth,
        setShowPhoneAuth,
        commentText,
        setCommentText,
        handleSocialAction,
        handleAuthSuccess,
        handleShare
    }
}
