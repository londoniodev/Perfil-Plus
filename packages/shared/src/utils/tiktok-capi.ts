/**
 * TikTok Conversions API (CAPI) — Server-Side Event Sender
 *
 * Este módulo se ejecuta EXCLUSIVAMENTE en el backend (NestJS o Next.js Server Actions).
 * NUNCA importar desde código cliente — El accessToken es una credencial secreta.
 *
 * @see https://business-api.tiktok.com/portal/docs?id=1771100865818625
 */

const TIKTOK_CAPI_ENDPOINT =
  "https://business-api.tiktok.com/open_api/v1.3/event/track/";

export interface TikTokServerEventPayload {
  /** Pixel Code del tenant (ej: "CXXXXXXXXXXXXXXXXX") */
  pixelCode: string;
  /** Access Token secreto del tenant — JAMÁS exponer al cliente */
  accessToken: string;
  /** Nombre del evento TikTok (ej: "CompletePayment", "PlaceAnOrder") */
  eventName: string;
  /** ID único para deduplicación browser ↔ server (usa orderId) */
  eventId: string;
  /** IP del comprador (extraída de headers del request) */
  userIp: string;
  /** User-Agent del navegador del comprador */
  userAgent: string;
  /** Monto total de la transacción */
  totalAmount: number;
  /** Moneda ISO 4217 leída de la config del tenant (ej: "COP", "USD") */
  currency: string;
}

/**
 * Envía un evento de conversión a la API de TikTok (Server-Side).
 *
 * Diseñado para ser:
 * - Non-blocking: No lanza excepciones — logueamos y seguimos.
 * - Server-only: Se ejecuta en NestJS Listeners o Next.js `after()`.
 * - Deduplication-ready: El `eventId` debe coincidir con el del Browser Pixel.
 *
 * @returns `true` si el evento fue aceptado, `false` si falló (sin lanzar error).
 */
export async function sendTikTokServerEvent(
  payload: TikTokServerEventPayload
): Promise<boolean> {
  const {
    pixelCode,
    accessToken,
    eventName,
    eventId,
    userIp,
    userAgent,
    totalAmount,
    currency,
  } = payload;

  // Guard clause: Si no hay credenciales, no intentar
  if (!pixelCode || !accessToken) {
    return false;
  }

  const body = {
    pixel_code: pixelCode,
    event: eventName,
    event_id: eventId,
    timestamp: new Date().toISOString(),
    context: {
      user_agent: userAgent,
      ip: userIp,
    },
    properties: {
      value: totalAmount,
      currency: currency,
    },
  };

  try {
    const response = await fetch(TIKTOK_CAPI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify({
        pixel_code: pixelCode,
        data: [body],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(
        `[TikTok CAPI] HTTP ${response.status} for event "${eventName}" (eventId: ${eventId}): ${errorText}`
      );
      return false;
    }

    const result = await response.json().catch(() => null);

    if (result?.code !== 0) {
      console.error(
        `[TikTok CAPI] API error for event "${eventName}" (eventId: ${eventId}):`,
        result?.message || "Unknown API error"
      );
      return false;
    }

    console.log(
      `[TikTok CAPI] ✅ Event "${eventName}" sent successfully (eventId: ${eventId}, amount: ${totalAmount} ${currency})`
    );
    return true;
  } catch (error) {
    // Non-blocking: Un fallo de tracking JAMÁS debe interrumpir una venta
    console.error(
      `[TikTok CAPI] Network error for event "${eventName}" (eventId: ${eventId}):`,
      error instanceof Error ? error.message : "Unknown network error"
    );
    return false;
  }
}
