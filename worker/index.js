// Worker de Cloudflare: sirve el frontend y reenvía /api y /uploads al backend.
// Así el navegador siempre habla con el mismo dominio (sin CORS) y las URLs
// de fotos guardadas como "/uploads/..." funcionan tal cual.

const PROXIED = ['/api/', '/uploads/'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!PROXIED.some((p) => url.pathname.startsWith(p))) {
      return env.ASSETS.fetch(request);
    }

    if (!env.API_ORIGIN) {
      return Response.json(
        { error: 'El backend aún no está configurado (falta API_ORIGIN en Cloudflare).' },
        { status: 503 }
      );
    }

    const target = new URL(url.pathname + url.search, env.API_ORIGIN);
    const headers = new Headers(request.headers);
    // IP real del visitante para el límite de intentos del backend.
    // Se reemplaza (no se agrega) para que nadie pueda falsificarla.
    const clientIp = request.headers.get('CF-Connecting-IP');
    if (clientIp) headers.set('X-Forwarded-For', clientIp);
    headers.set('X-Forwarded-Proto', 'https');
    headers.set('X-Forwarded-Host', url.host);

    return fetch(target, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });
  },
};
