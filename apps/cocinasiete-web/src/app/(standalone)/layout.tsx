import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Visor",
    description: "Visor de contenido",
};

export default function StandaloneLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {children}
        </div>
    );
}
