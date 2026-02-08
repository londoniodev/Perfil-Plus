import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Platform Admin",
    description: "Control Tower - Gestión de Tenants",
};

import { Toaster } from "sonner";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" className="dark">
            <body className={inter.className}>
                {children}
                <Toaster richColors position="top-center" />
            </body>
        </html>
    );
}
