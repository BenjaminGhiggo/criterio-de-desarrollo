// Progreso en la ruta: predicción, repaso, explicación y dominio de cada lección.
// Vive solo en el navegador de cada persona (localStorage).
import { useCallback, useSyncExternalStore } from "react";

export type ProgresoLeccion = {
  prediccion?: number;
  repaso?: (number | null)[];
  explicacion?: string;
  dominada?: boolean;
};
type Progreso = Record<string, ProgresoLeccion>;

const CLAVE = "criterio.ruta.v1";
const VACIO: Progreso = {};
const oyentes = new Set<() => void>();
let cache: Progreso | null = null;

function leer(): Progreso {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(CLAVE) ?? "{}") as Progreso;
  } catch {
    cache = {};
  }
  return cache;
}

function escribir(nuevo: Progreso) {
  cache = nuevo;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevo));
  } catch {
    /* sin almacenamiento: queda en memoria */
  }
  oyentes.forEach((o) => o());
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function useProgreso() {
  const progreso = useSyncExternalStore(suscribir, leer, () => VACIO);
  const actualizar = useCallback((id: string, cambio: Partial<ProgresoLeccion>) => {
    const actual = leer();
    escribir({ ...actual, [id]: { ...actual[id], ...cambio } });
  }, []);
  return { progreso, actualizar };
}
