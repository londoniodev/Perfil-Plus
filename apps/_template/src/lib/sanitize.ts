import DOMPurify from "isomorphic-dompurify";

/**
 * Configuración estándar de sanitización para Perfil-Plus.
 * Permite estructuras comunes de landing pages pero bloquea scripts maliciosos.
 */
const DEFAULT_CONFIG = {
    ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
        'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe',
        'img', 'span', 'section', 'main', 'article', 'aside', 'footer', 'header',
        'nav', 'details', 'summary', 'picture', 'source', 'video', 'audio', 'style'
    ],
    ALLOWED_ATTR: [
        'href', 'name', 'target', 'src', 'alt', 'title', 'class', 'id', 'style',
        'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'autoplay',
        'controls', 'muted', 'loop', 'poster', 'preload', 'type'
    ],
    ALLOWED_IFRAME_DOMAINS: ['youtube.com', 'youtu.be', 'vimeo.com', 'google.com']
};

/**
 * Sanitiza contenido HTML para su renderizado seguro en el cliente.
 * @param html El HTML bruto a sanitizar.
 * @returns El HTML limpio.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return '';
    
    return DOMPurify.sanitize(html, {
        ...DEFAULT_CONFIG,
        ADD_TAGS: ['iframe'], // Asegurar que iframe esté permitido
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
    }) as string;
}
