"use client"

import { useState } from "react"
import { Copy, Check, Link2, ExternalLink } from "lucide-react"
import { Button, useToast } from "@alvarosky/ui"
import { generateBoldWebhookUrl } from "@/actions/admin/generate-webhook-url"

export function BoldWebhookSection() {
    const toast = useToast()
    const [webhookUrl, setWebhookUrl] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        setIsGenerating(true)
        try {
            const result = await generateBoldWebhookUrl()
            if (result.success && result.url) {
                setWebhookUrl(result.url)
                toast.success("URL del webhook generada correctamente")
            } else {
                toast.error(result.error || "Error generando la URL")
            }
        } catch {
            toast.error("Error inesperado al generar la URL")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl)
            setCopied(true)
            toast.success("URL copiada al portapapeles")
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error("No se pudo copiar. Selecciónala manualmente.")
        }
    }

    return (
        <div className="border-t border-emerald-500/20 pt-4 mt-4 space-y-3">
            <header className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                <h5 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">URL de Webhook</h5>
            </header>

            <p className="text-xs text-muted-foreground leading-relaxed">
                Copia esta URL y pégala en el panel de{" "}
                <a
                    href="https://panel.bold.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-emerald-600 hover:text-emerald-500 inline-flex items-center gap-0.5"
                >
                    Bold Merchants <ExternalLink className="h-3 w-3 inline" aria-hidden="true" />
                </a>{" "}
                → <strong>Integraciones</strong> → <strong>Webhooks</strong> → <strong>Crear webhook</strong>.
                Marca todos los eventos (venta aprobada, rechazada, anulaciones).
            </p>

            {!webhookUrl ? (
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-500"
                >
                    {isGenerating ? (
                        <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" aria-hidden="true" />
                            Generando...
                        </>
                    ) : (
                        <>
                            <Link2 className="mr-2 h-4 w-4" aria-hidden="true" />
                            Generar URL de Webhook
                        </>
                    )}
                </Button>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                readOnly
                                value={webhookUrl}
                                className="w-full bg-muted/50 border border-emerald-500/20 rounded-md px-3 py-2 text-xs font-mono text-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                aria-label="URL del webhook de Bold"
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="shrink-0 text-emerald-600 hover:bg-emerald-500/10"
                            aria-label={copied ? "Copiado" : "Copiar URL del webhook"}
                        >
                            {copied ? (
                                <Check className="h-4 w-4" aria-hidden="true" />
                            ) : (
                                <Copy className="h-4 w-4" aria-hidden="true" />
                            )}
                        </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground/70">
                        ⚠️ Esta URL es única para tu negocio. No la compartas públicamente.
                    </p>
                </div>
            )}
        </div>
    )
}
