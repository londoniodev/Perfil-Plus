"use client"

import { ThumbsUp, MessageSquare, Share2, Bookmark } from "lucide-react"

export function ProductSocialActions({
    isLiked,
    likesCount,
    isBookmarked,
    restaurantName,
    productDescription,
    onLike,
    onCommentFocus,
    onShare,
    onBookmark
}: {
    isLiked: boolean
    likesCount: number
    isBookmarked: boolean
    restaurantName: string
    productDescription?: string
    onLike: () => void
    onCommentFocus: () => void
    onShare: () => void
    onBookmark: () => void
}) {
    return (
        <section aria-label="Acciones sociales y descripción">
            <div className="px-4 py-4 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onLike} 
                            className={`transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary rounded p-1 ${isLiked ? 'text-primary' : 'text-slate-700 hover:text-slate-900'}`}
                            aria-label={isLiked ? "Quitar me gusta" : "Dar me gusta"}
                            aria-pressed={isLiked}
                        >
                            <ThumbsUp className={`w-7 h-7 ${isLiked ? 'fill-current' : ''}`} aria-hidden="true" />
                        </button>
                        <button 
                            onClick={onCommentFocus} 
                            className="text-slate-700 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
                            aria-label="Responder o comentar"
                        >
                            <MessageSquare className="w-7 h-7" aria-hidden="true" />
                        </button>
                        <button 
                            onClick={onShare} 
                            className="text-slate-700 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
                            aria-label="Compartir producto"
                        >
                            <Share2 className="w-7 h-7" aria-hidden="true" />
                        </button>
                    </div>
                    <button 
                        onClick={onBookmark} 
                        className={`transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded p-1 hover:text-slate-900 ${isBookmarked ? 'text-primary' : 'text-slate-700'}`}
                        aria-label={isBookmarked ? "Quitar de guardados" : "Guardar para después"}
                        aria-pressed={isBookmarked}
                    >
                        <Bookmark className={`w-7 h-7 ${isBookmarked ? 'fill-current' : ''}`} aria-hidden="true" />
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm text-slate-900 font-bold">
                        {likesCount} {likesCount === 1 ? 'me gusta' : 'me gustas'}
                    </p>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-slate-800 leading-relaxed">
                        <span className="font-bold mr-1 text-slate-900">{restaurantName}</span>
                        {productDescription}{" "}
                        <span className="text-primary font-medium">#delicioso #foodie</span>
                    </p>
                </div>
            </div>
        </section>
    )
}
