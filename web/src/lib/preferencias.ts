// Lo que cada persona decide sobre las metodologías: si la probó, cuánto le
// enseñó y si la elige. Vive solo en su navegador (localStorage).
import { useCallback, useSyncExternalStore } from "react";

export type Valoracion = {
  nota?: number;
  elegida?: boolean;
  probada?: boolean;
  nota_texto?: string;
  semana?: number[];
};
type Preferencias = Record<string, Valoracion>;

const CLAVE = "criterio.preferencias.v1";
const VACIO: Preferencias = {};
const oyentes = new Set<() => void>();
let cache: Preferencias | null = null;

function leer(): Preferencias {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(CLAVE) ?? "{}") as Preferencias;
  } catch {
    cache = {};
  }
  return cache;
}

function escribir(nuevas: Preferencias) {
  cache = nuevas;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevas));
  } catch {
    /* sin almacenamiento: queda en memoria */
  }
  oyentes.forEach((o) => o());
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function usePreferencias() {
  const prefs = useSyncExternalStore(suscribir, leer, () => VACIO);
  const actualizar = useCallback((id: string, cambio: Partial<Valoracion>) => {
    const actuales = leer();
    escribir({ ...actuales, [id]: { ...actuales[id], ...cambio } });
  }, []);
  const reiniciar = useCallback(() => escribir({}), []);
  return { prefs, actualizar, reiniciar };
}

/** Estado local de una demo que sobrevive a recargas (kata, ADR...). */
export function guardarLocal<T>(clave: string, valor: T) {
  try {
    localStorage.setItem(`criterio.${clave}`, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento */
  }
}

export function leerLocal<T>(clave: string, defecto: T): T {
  try {
    const crudo = localStorage.getItem(`criterio.${clave}`);
    return crudo ? (JSON.parse(crudo) as T) : defecto;
  } catch {
    return defecto;
  }
}
