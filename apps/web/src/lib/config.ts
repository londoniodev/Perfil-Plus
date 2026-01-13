// Configuración centralizada de la URL de la API
// En producción usa la URL de producción, en desarrollo usa la variable de entorno o localhost

export const API_BASE = process.env.NODE_ENV === 'production'
    ? "https://api.mauromera.com/api"
    : (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api");
