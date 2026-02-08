"use client";

import { useEffect } from "react";
import { Button, IconAlertTriangle } from "@alvarosky/ui";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
            <div className="bg-destructive/10 rounded-full p-6 mb-6">
                <IconAlertTriangle size={64} className="text-destructive" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Algo salió mal</h2>
            <p className="text-muted-foreground mb-8">
                Ha ocurrido un error inesperado al cargar esta página.
            </p>
            <Button onClick={() => reset()} variant="outline">
                Intentar de nuevo
            </Button>
        </div>
    );
}

