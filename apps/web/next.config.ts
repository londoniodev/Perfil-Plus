import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com https://sdk.mercadopago.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https:;
  font-src 'self' https://fonts.gstatic.com;
  frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.mercadopago.com https://www.mercadopago.com.co;
  connect-src 'self' https://api.mauromera.com https://*.mauromera.com http://localhost:3001 http://localhost:3000;
  media-src 'self' https://*.mauromera.com blob:;
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

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false, // Oculta X-Powered-By: Next.js
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
