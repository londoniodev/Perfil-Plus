/**
 * Custom Image Loader para Next.js
 * 
 * Este cargador permite que las imágenes alojadas en el bucket S3/MinIO se sirvan
 * directamente desde el origen, evitando que el servidor de optimización de Next.js
 * falle al intentar procesar dominios con Punycode o caracteres especiales.
 */
export default function minioLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // Si la imagen ya es una URL completa de S3, la devolvemos tal cual (o con parámetros de resize si el origin los soporta)
  if (src.includes('xn--') || src.includes('s3.')) {
    // Nota: Si configuramos un proxy de redirección o redimensionamiento en MinIO, 
    // aquí podríamos añadir query params como ?width=${width}
    return src;
  }

  // Fallback para imágenes locales o de otros dominios que Next.js deba optimizar (normalmente no se llega aquí si se configura globalmente)
  return src;
}
