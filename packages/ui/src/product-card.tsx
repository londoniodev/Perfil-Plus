import * as React from "react"
import { cn } from "./lib/utils"
import { AdaptiveImage } from "./adaptive-image"
import { Badge } from "./badge"
import { PriceDisplay } from "./price-display"
import { Button } from "./button"
import { ShoppingCart, Download, Briefcase } from "lucide-react"

// Tipo local para no depender directamente de Prisma en la UI pura
interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    category?: string
    imageSrc: string
    price: number | string
    productType: "DIGITAL" | "PHYSICAL" | "SERVICE"
    slug: string
}

export function ProductCard({
    title,
    category,
    imageSrc,
    price,
    productType,
    slug,
    className,
    ...props
}: ProductCardProps) {

    const isDigital = productType === "DIGITAL"
    const isService = productType === "SERVICE"

    return (
        <div
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition hover:shadow-md",
                className
            )}
            {...props}
        >
            {/* Zona de Imagen */}
            <div className="relative w-full overflow-hidden">
                <AdaptiveImage
                    src={imageSrc}
                    alt={title}
                    // Si es digital (libro) usa portrait, si es físico usa square o auto
                    aspectRatio={isDigital ? "portrait" : "square"}
                    className="transition-transform duration-500 group-hover:scale-105"
                />

                {/* Badges Superpuestos */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {category && (
                        <Badge variant="secondary" className="backdrop-blur-md bg-background/80 shadow-sm">
                            {category}
                        </Badge>
                    )}
                    {isDigital && (
                        <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                            <Download className="h-3 w-3 mr-1" /> Digital
                        </Badge>
                    )}
                    {isService && (
                        <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm">
                            <Briefcase className="h-3 w-3 mr-1" /> Servicio
                        </Badge>
                    )}
                </div>
            </div>

            {/* Zona de Contenido */}
            <div className="flex flex-1 flex-col p-4 gap-3">
                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {title}
                </h3>

                <div className="pt-3 border-t flex items-center justify-between gap-4 mt-auto">
                    <PriceDisplay price={price} size="sm" />

                    {/* Botón visual (La navegación real la maneja el Link padre) */}
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:text-primary">
                        {isDigital ? <Download className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
        </div>
    )
}


