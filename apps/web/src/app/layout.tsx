import type { Metadata } from "next";
import { Geist_Mono, Sansation } from "next/font/google";
import "./styles/index.css";
import { NavigationWrapper } from "./components/layout/NavigationWrapper";
import { Footer } from "./components/layout/Footer";
import { GlobalSchemas } from "./components/seo/JsonLd";

const sansation = Sansation({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mauromera.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mauro Mera | Psicología, cultura y decisiones conscientes",
    template: "%s | Mauro Mera",
  },
  description: "Psicólogo, consultor organizacional y coach. Acompaño a personas, equipos y organizaciones a tomar decisiones conscientes, fortalecer su cultura y cuidar su bienestar.",
  keywords: ["psicólogo", "consultor organizacional", "coach", "psicoterapia", "orientación vocacional", "liderazgo", "cultura organizacional", "Mauro Mera", "Colombia"],
  authors: [{ name: "Mauricio Mera", url: SITE_URL }],
  creator: "Mauricio Mera",
  publisher: "Mauro Mera",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: SITE_URL,
    siteName: "Mauro Mera",
    title: "Mauro Mera | Psicología, cultura y decisiones conscientes",
    description: "Psicólogo, consultor organizacional y coach. Acompaño a personas, equipos y organizaciones a tomar decisiones conscientes.",
    images: [
      {
        url: "/mauro_hero.png",
        width: 1200,
        height: 630,
        alt: "Mauro Mera - Psicólogo y Consultor Organizacional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mauro Mera | Psicología, cultura y decisiones conscientes",
    description: "Psicólogo, consultor organizacional y coach. Acompaño a personas, equipos y organizaciones a tomar decisiones conscientes.",
    images: ["/mauro_hero.png"],
    creator: "@mauromera",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // Agregar cuando estén disponibles:
    // google: 'google-site-verification-code',
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
      <body className={`${sansation.variable} ${geistMono.variable} antialiased`}>
        <GlobalSchemas />
        <NavigationWrapper footer={<Footer />}>
          {children}
        </NavigationWrapper>
      </body>
    </html>
  );
}

