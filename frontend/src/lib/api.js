import { useEffect, useState } from 'react';

const BASE = import.meta.env.VITE_API_URL ?? '';

export async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Error de conexión');
    err.status = res.status;
    err.details = data.errors;
    throw err;
  }
  return data;
}

// Caché en memoria para el contenido público (lo piden varios componentes a la vez).
// Dura un minuto para que los cambios hechos en el panel se vean pronto.
const cache = new Map();
const TTL = 60 * 1000;

function cachedGet(path) {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL) return hit.promise;
  const promise = api(path).catch((err) => {
    cache.delete(path);
    throw err;
  });
  cache.set(path, { promise, at: Date.now() });
  return promise;
}

export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, error: null, loading: true });
    cachedGet(path)
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((error) => !cancelled && setState({ data: null, error, loading: false }));
    return () => {
      cancelled = true;
    };
  }, [path]);

  return state;
}
