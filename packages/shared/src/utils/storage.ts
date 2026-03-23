/**
 * Genera un nombre de bucket estandarizado y seguro para S3/MinIO.
 * Elimina puntos y caracteres especiales que pueden causar problemas con Certificados SSL/Wildcards.
 * 
 * @param slug - El slug del tenant (ej: "bocata-artesanal.com")
 * @returns Un string saneado (ej: "bocata-artesanalcom")
 */
export function getStorageSlug(slug: string): string {
  if (!slug) return 'default';
  
  // 1. Minúsculas
  // 2. Eliminar todo lo que no sea a-z, 0-9 o guiones (-)
  // Esto elimina puntos, espacios y caracteres especiales.
  return slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

/**
 * Genera el nombre completo del bucket según el tipo (público o privado).
 */
export function getBucketName(slug: string, isPrivate: boolean): string {
  const sanitizedSlug = getStorageSlug(slug);
  const suffix = isPrivate ? 'private' : 'public';
  return `${sanitizedSlug}-${suffix}`;
}
