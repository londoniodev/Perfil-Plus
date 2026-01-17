"use client";

import { useEffect } from "react";
import { useToast } from "./toast";

interface ClientToastProps {
    message: string;
    type?: "success" | "error" | "warning" | "info";
    duration?: number;
}

export default function ClientToast({ message, type = "error", duration }: ClientToastProps) {
    const toast = useToast();

    useEffect(() => {
        if (type === "error") toast.error(message);
        else if (type === "success") toast.success(message);
        else if (type === "warning") toast.warning(message);
        else if (type === "info") toast.info(message);
    }, [message, type, duration, toast]);

    return null;
}

export { ClientToast };
