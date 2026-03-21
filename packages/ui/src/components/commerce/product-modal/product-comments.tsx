"use client"

import { useRef, useEffect, useState } from "react"
import { MessageCircle, ChevronDown, ChevronUp, ArrowRight } from "lucide-react"

export function ProductComments({
    comments,
    commentText,
    setCommentText,
    onCommentSubmit
}: {
    comments: { id: string; userName: string; content: string; createdAt: string }[]
    commentText: string
    setCommentText: (text: string) => void
    onCommentSubmit: () => void
}) {
    const [isCommentsExpanded, setIsCommentsExpanded] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            const scrollHeight = textareaRef.current.scrollHeight
            textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`
            textareaRef.current.style.overflowY = scrollHeight > 120 ? 'auto' : 'hidden'
        }
    }, [commentText])

    return (
        <section aria-labelledby="comments-title" className="border-t border-slate-100 pt-6 mt-2 relative group px-4 bg-white">
            <h4 id="comments-title" className="flex items-center gap-2 text-sm font-bold mb-4 text-slate-900 tracking-tight">
                <MessageCircle className="w-4 h-4 text-slate-500" aria-hidden="true" />
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
                            <article key={comment.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <header className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-primary/50 flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
                                            aria-hidden="true"
                                        >
                                            {comment.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-sm text-slate-900">{comment.userName}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </header>
                                <p className="text-sm text-slate-700 leading-relaxed pl-9">
                                    {comment.content}
                                </p>
                            </article>
                        ))}

                        {!isCommentsExpanded && comments.length > 5 && (
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/95 to-transparent flex items-end justify-center pb-0 z-10 pt-10">
                                <button
                                    onClick={() => setIsCommentsExpanded(true)}
                                    className="flex items-center gap-2 text-primary font-bold text-sm bg-white px-6 py-2.5 rounded-full shadow-lg border border-slate-100 hover:scale-105 hover:shadow-xl transition focus-visible:ring-2 focus-visible:ring-primary outline-none"
                                    aria-expanded="false"
                                    aria-controls="comments-list"
                                >
                                    Ver más opiniones
                                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                                </button>
                            </div>
                        )}

                        {isCommentsExpanded && (
                            <div className="sticky bottom-4 flex justify-center z-20 py-4 transition-opacity duration-300">
                                <button
                                    onClick={() => setIsCommentsExpanded(false)}
                                    className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold text-xs bg-white px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl border border-slate-200 hover:scale-105 transition focus-visible:ring-2 focus-visible:ring-primary outline-none"
                                    aria-expanded="true"
                                    aria-controls="comments-list"
                                >
                                    Ver menos
                                    <ChevronUp className="w-3 h-3" aria-hidden="true" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="relative pb-6">
                <label htmlFor="comment-input" className="sr-only">Escribe tu opinión</label>
                <textarea
                    ref={textareaRef}
                    id="comment-input"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Escribe tu opinión..."
                    rows={1}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3.5 pl-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 placeholder:text-slate-500 resize-none overflow-hidden min-h-[48px] transition"
                    style={{ maxHeight: '120px' }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            onCommentSubmit()
                        }
                    }}
                />
                <button
                    onClick={onCommentSubmit}
                    disabled={!commentText.trim()}
                    className="absolute right-2 top-3 p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-slate-900 outline-none"
                    aria-label="Enviar comentario"
                >
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
            </div>
        </section>
    )
}
