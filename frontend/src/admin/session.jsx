import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const KEY = 'proasa_admin_session';
const BASE = import.meta.env.VITE_API_URL ?? '';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

function save(session) {
  try {
    if (session) localStorage.setItem(KEY, JSON.stringify(session));
    else localStorage.removeItem(KEY);
  } catch {
    /* almacenamiento no disponible: la sesión dura lo que dure la pestaña */
  }
}

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(load);

  const logout = useCallback(() => {
    save(null);
    setSession(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api('/admin/login', { method: 'POST', body: { email, password } });
    save(data);
    setSession(data);
  }, []);

  // Llamadas autenticadas; si la sesión expiró, se cierra sola
  const request = useCallback(
    async (path, options = {}) => {
      try {
        return await api(path, { ...options, token: session?.token });
      } catch (err) {
        if (err.status === 401) logout();
        throw err;
      }
    },
    [session, logout]
  );

  // Subida con barra de progreso (fetch no reporta progreso de subida)
  const upload = useCallback(
    (path, formData, onProgress) =>
      new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${BASE}/api${path}`);
        xhr.setRequestHeader('Authorization', `Bearer ${session?.token}`);
        xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
        xhr.onload = () => {
          let data = {};
          try {
            data = JSON.parse(xhr.responseText);
          } catch {
            /* respuesta vacía */
          }
          if (xhr.status === 401) logout();
          if (xhr.status >= 200 && xhr.status < 300) resolve(data);
          else reject(Object.assign(new Error(data.error || 'No se pudieron subir las imágenes'), { data }));
        };
        xhr.onerror = () => reject(new Error('Error de conexión al subir las imágenes'));
        xhr.send(formData);
      }),
    [session, logout]
  );

  const value = useMemo(
    () => ({ user: session?.user, isLoggedIn: !!session?.token, login, logout, request, upload }),
    [session, login, logout, request, upload]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
