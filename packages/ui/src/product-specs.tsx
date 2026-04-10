import * as React from "react"
import { cn } from "./lib/utils"
import { Check, FileDown, ExternalLink } from "lucide-react"

interface ProductSpecsProps {
    specs: Record<string, string | number | null> | null // Tipo compatible con Prisma Json
    className?: string
}

export function ProductSpecs({ specs, className }: ProductSpecsProps) {
    if (!specs || Object.keys(specs).length === 0) return null

    const formatLabel = (key: string) => {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    }

    const isUrl = (val: string) => {
        return val.startsWith('http://') || val.startsWith('https://') || val.includes('http');
    }

    // Limpia el valor si viene con prefijos como "PDF: "
    const getLinkData = (val: string) => {
        const urlMatch = val.match(/https?:\/\/[^\s]+/);
        if (!urlMatch) return { isLink: false, url: '', label: val };
        
        const url = urlMatch[0];
        let label = val.replace(url, '').replace(/[:\s]+$/, '').trim();
        if (!label) label = "Ver enlace";
        
        return { isLink: true, url, label };
    }

    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}>
            {Object.entries(specs).map(([key, value]) => {
                if (value === null) return null
                
                // Filtrar SOURCE_URL
                if (key.toLowerCase() === 'source_url') return null

                const valStr = String(value);
                const { isLink, url } = getLinkData(valStr);
                const isPdf = url.toLowerCase().endsWith('.pdf');

                return (
                    <div key={key} className="flex items-start gap-3 p-3 rounded-md border bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="mt-0.5 text-muted-foreground shrink-0">
                            {isLink ? (
                                isPdf ? <FileDown className="h-4 w-4 text-primary" /> : <ExternalLink className="h-4 w-4 text-primary" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                        </div>
                        <div className="flex flex-col text-sm min-w-0 w-full">
                            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider mb-1">
                                {formatLabel(key)}
                            </span>
                            {isLink ? (
                                <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-semibold text-primary hover:underline flex items-center gap-1.5"
                                >
                                    Ver
                                </a>
                            ) : (
                                <span className="font-semibold text-foreground break-all" title={valStr}>
                                    {valStr}
                                </span>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}


