/**
 * Custom Image Loader para Next.js
 * 
 * Este cargador permite que las imágenes alojadas en el bucket S3/MinIO se sirvan
 * directamente desde el origen, evitando que el servidor de optimización de Next.js
 * falle al intentar procesar dominios con Punycode o caracteres especiales.
 */
export default function minioLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // 1. Si ya es una URL absoluta externa (no propia), devolver tal cual
  if (src.startsWith('http') && !src.includes('xn--') && !src.includes('s3.')) {
    return src;
  }

  // 2. Si es una imagen propia del bucket S3/MinIO
  if (src.includes('xn--') || src.includes('s3.')) {
    // Si configuráramos un servicio de resize (ej: imgproxy), añadiríamos params aquí
    return src;
  }

  // 3. Fallback: Devolver src original. 
  // Nota: Si es una ruta relativa local (ej: /images/...), Next.js intentará servirla desde public
  return src;
}
