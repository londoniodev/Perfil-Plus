import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// La interfaz ThrottlerRequest cambió en v6 de @nestjs/throttler
interface ThrottlerRequest {
  context: ExecutionContext;
  limit: number;
  ttl: number;
  throttler: any;
  getTracker: () => Promise<string>;
  generateKey: () => string;
}

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(requestProps: any): Promise<boolean> {
    const { context } = requestProps;
    const request = context.switchToHttp().getRequest();

    // Si la petición viene de Next.js internamente dentro de Docker y trae el token secreto, BYPASS completo.
    const internalToken =
      request.headers['x-internal-token'] ||
      request.headers['x-revalidate-secret'];
    const expectedToken =
      process.env.INTERNAL_API_KEY || 'default_dev_secret_key';

    if (internalToken === expectedToken) {
      return true; // Bypass Throttler
    }

    // Si la petición es SSE (Server-Sent Events) conectándose a /events o /sse, BYPASS completo
    const urlToMatch = request.originalUrl || request.url || request.path || '';
    if (urlToMatch.includes('/events') || urlToMatch.includes('/sse')) {
      return true;
    }

    // De lo contrario, proceder con el Rate Limiting normal
    return super.handleRequest(requestProps);
  }

  protected getTracker(req: Record<string, any>): Promise<string> {
    return new Promise<string>((resolve) => {
      // Si el usuario está autenticado, trackear por su ID único de usuario/empleado
      if (req.user && (req.user.sub || req.user.id)) {
        resolve(`user-${req.user.sub || req.user.id}`);
      } else {
        // Si es público, trackear por IP (tomando en cuenta el proxy inverso)
        const ip = req.ips?.length ? req.ips[0] : req.ip;
        resolve(`ip-${ip}`);
      }
    });
  }
}
