import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const apiDomain = new URL(apiUrl).origin;
const s3Domain = process.env.NEXT_PUBLIC_S3_DOMAIN || 's3.xn--alvarolondoo-khb.dev';

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com https://sdk.mercadopago.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https: https://${s3Domain};
  font-src 'self' https://fonts.gstatic.com;
  frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.mercadopago.com https://www.mercadopago.com.co;
  connect-src 'self' ${apiDomain} https://${s3Domain} http://localhost:3001 http://localhost:3000 http://127.0.0.1:3001 http://127.0.0.1:3000;
  media-src 'self' https://${s3Domain} blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  ${isProd ? 'upgrade-insecure-requests;' : ''}
`;

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin-allow-popups' // Permite popups (MercadoPago)
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-site' // Permite recursos del mismo sitio
  }
];


const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["jsdom", "isomorphic-dompurify"],
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "s3.xn--alvarolondoo-khb.dev",
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Legacy ebooks → tienda redirects
      {
        source: '/ebooks',
        destination: '/tienda',
        permanent: true,
      },
      {
        source: '/ebooks/:slug',
        destination: '/tienda/:slug',
        permanent: true,
      },
      {
        source: '/ebooks/mis-compras',
        destination: '/compras',
        permanent: true,
      },
    ];
  },
};

export default withPWA(nextConfig);

