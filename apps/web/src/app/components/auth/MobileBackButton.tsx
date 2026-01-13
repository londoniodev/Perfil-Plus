"use client";

import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@/app/components/icons";

export function MobileBackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push('/')}
            className="mobile-back-button"
            aria-label="Volver al inicio"
            style={{
                position: "fixed",
                top: "1.5rem",
                left: "1.5rem",
                zIndex: 50,
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--foreground)",
                cursor: "pointer",
                transition: "all 0.2s ease"
            }}
        >
            <IconArrowLeft />
            {/* Hover effect */}
            <style jsx>{`
                button:hover {
                    background: rgba(255, 255, 255, 0.2) !important;
                    transform: scale(1.05);
                }
            `}</style>
        </button>
    );
}
