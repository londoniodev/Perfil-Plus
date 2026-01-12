import type { Metadata } from "next";
import { Geist_Mono, Genos, Nunito } from "next/font/google";
import "./styles/index.css";
import { NavigationWrapper } from "./components/NavigationWrapper";
import { Footer } from "./components/Footer";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const genos = Genos({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mauro Mera | Psicología, cultura y decisiones conscientes",
  description: "Psicólogo, consultor organizacional y coach. Acompaño a personas, equipos y organizaciones a tomar decisiones conscientes, fortalecer su cultura y cuidar su bienestar.",
  keywords: ["psicólogo", "consultor organizacional", "coach", "psicoterapia", "orientación vocacional", "liderazgo", "cultura organizacional"],
  authors: [{ name: "Mauricio Mera" }],
  openGraph: {
    title: "Mauro Mera | Psicología, cultura y decisiones conscientes",
    description: "Psicólogo, consultor organizacional y coach. Acompaño a personas, equipos y organizaciones a tomar decisiones conscientes.",
    type: "website",
    locale: "es_CO",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${nunito.variable} ${geistMono.variable} ${genos.variable} antialiased`}>
        <NavigationWrapper footer={<Footer />}>
          {children}
        </NavigationWrapper>
      </body>
    </html>
  );
}
