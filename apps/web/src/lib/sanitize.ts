import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'strong', 'em', 'u', 'strike', 's',
    'a', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'img', 'figure', 'figcaption', 'table', 'thead', 'tbody',
    'tr', 'th', 'td', 'hr', 'div', 'span', 'sub', 'sup'
];

const ALLOWED_ATTR = [
    'href', 'src', 'alt', 'title', 'class', 'id',
    'target', 'rel', 'width', 'height', 'style',
    'loading', 'decoding'
];

/**
 * Sanitiza contenido HTML para prevenir ataques XSS.
 * Permite solo tags y atributos seguros para contenido editorial.
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
        ADD_ATTR: ['target'],
    });
}

/**
 * Sanitiza contenido HTML de forma más estricta.
 * Para contenido generado por usuarios (comentarios, etc).
 */
export function sanitizeHtmlStrict(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
    });
}
