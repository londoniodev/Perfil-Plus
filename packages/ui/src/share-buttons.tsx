"use client"

import * as React from "react"
import { Check, Copy, Facebook, Linkedin, Twitter, Phone } from "lucide-react" // Phone como fallback de WhatsApp
import { Button } from "./button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./tooltip"
import { cn } from "./lib/utils"

interface ShareButtonsProps {
    url: string
    title: string
    className?: string
}

export function ShareButtons({ url, title, className }: ShareButtonsProps) {
    const [copied, setCopied] = React.useState(false)

    // Ensure we are on client/browser before accessing window/navigator or encoding
    const [encodedUrl, setEncodedUrl] = React.useState("")
    const [encodedTitle, setEncodedTitle] = React.useState("")

    React.useEffect(() => {
        setEncodedUrl(encodeURIComponent(url))
        setEncodedTitle(encodeURIComponent(title))
    }, [url, title])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const shareLinks = [
        {
            label: "Twitter",
            icon: Twitter,
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        },
        {
            label: "LinkedIn",
            icon: Linkedin,
            href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
        },
        {
            label: "Facebook",
            icon: Facebook,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        },
        {
            label: "WhatsApp",
            icon: Phone,
            href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
        },
    ]

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <span className="text-sm font-medium text-muted-foreground mr-2">Compartir:</span>
            <TooltipProvider>
                {shareLinks.map((item) => (
                    <Tooltip key={item.label}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-muted"
                                onClick={() => window.open(item.href, '_blank', 'width=600,height=400')}
                                title={`Compartir en ${item.label}`}
                            >
                                <item.icon className="h-4 w-4" />
                                <span className="sr-only">{item.label}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Compartir en {item.label}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}

                {/* Botón de Copiar */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-muted"
                            onClick={copyToClipboard}
                            title="Copiar enlace"
                        >
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            <span className="sr-only">Copiar enlace</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{copied ? "¡Copiado!" : "Copiar enlace"}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}


