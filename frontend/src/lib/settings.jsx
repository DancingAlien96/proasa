import { createContext, useContext } from 'react';
import { useApi } from './api.js';

// Valores por defecto mientras carga la API (o si no responde)
const DEFAULTS = {
  phone: '3627 7208',
  whatsapp: '50236277208',
  email: 'info@proasa.com.gt',
  address: '8va. Avenida Calzada Dos Hector Zona 2 Chiquimula Guatemala',
};

const SettingsContext = createContext(DEFAULTS);

export function SettingsProvider({ children }) {
  const { data } = useApi('/settings');
  return (
    <SettingsContext.Provider value={{ ...DEFAULTS, ...data }}>{children}</SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
