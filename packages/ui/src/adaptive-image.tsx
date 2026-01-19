"use client"

import * as React from "react"
import Image, { ImageProps } from "next/image"
import { cn } from "./lib/utils"
import { Skeleton } from "./skeleton"

const aspectRatios = {
    auto: "aspect-auto",
    square: "aspect-square",    // 1:1
    video: "aspect-video",      // 16:9
    portrait: "aspect-[2/3]",   // 2:3 (Portadas Libros)
    wide: "aspect-[21/9]",      // 21:9 (Cinemático/Headers)
    ultraWide: "aspect-[32/9]", // 32:9 (Banners delgados)
}

type AdaptiveImageProps = Omit<ImageProps, "width" | "height"> & {
    aspectRatio?: keyof typeof aspectRatios
    containerClassName?: string
    useSkeleton?: boolean
}

export function AdaptiveImage({
    src,
    alt,
    aspectRatio = "auto",
    className,
    containerClassName,
    useSkeleton = true,
    priority = false,
    sizes,
    ...props
}: AdaptiveImageProps) {
    const [isLoading, setIsLoading] = React.useState(true)

    // Optimización automática de 'sizes' basada en el uso probable
    const defaultSizes = aspectRatio === "auto" || aspectRatio === "wide"
        ? "(max-width: 768px) 100vw, 100vw" // Pantalla completa en móviles
        : "(max-width: 768px) 100vw, 50vw"  // Tarjetas/Columnas

    return (
        <div
            className={cn(
                "relative w-full overflow-hidden bg-muted rounded-xl",
                aspectRatios[aspectRatio],
                // Si es 'auto', necesitamos altura definida por el padre o contenido
                aspectRatio === "auto" ? "h-full" : "",
                containerClassName
            )}
        >
            {useSkeleton && isLoading && (
                <Skeleton className="absolute inset-0 z-10 h-full w-full" />
            )}

            <Image
                src={src}
                alt={alt}
                fill
                priority={priority}
                sizes={sizes || defaultSizes}
                onLoad={() => setIsLoading(false)}
                className={cn(
                    "object-cover transition-opacity duration-500",
                    useSkeleton && isLoading ? "opacity-0" : "opacity-100",
                    className
                )}
                {...props}
            />
        </div>
    )
}


