// Datos generados por el dominio en Python (`criterio exportar`). No editar a mano:
// web/src/data/criterio.json se regenera y una prueba en Python verifica que esté al día.
import crudo from "@/data/criterio.json";
import type { Fase, Medicion, Modelo, PasoPlan } from "@/domain/conocimiento";

export type Evidencia = "alta" | "moderada" | "práctica profesional" | "baja";

export type Metodo = {
  id: string;
  nombre: string;
  familia: string;
  resumen: string;
  idea: string;
  evidencia: Evidencia;
  fuente: string;
  para_quien: string;
  plan: Required<PasoPlan>[];
  esta_semana: string[];
  cuando_no: string;
  senal: string;
  ejemplo: string;
  minutos: number;
  trayectoria: Medicion[];
};

export type FaseInfo = { signo: Fase; nombre: string; pregunta: string };

export type PasoLeccion = {
  t: number;
  fase: Fase;
  estado: string;
  balance: number;
  fuerzas: string[];
  opciones: string[];
  elegida: string | null;
  justificacion: string[];
  consecuencias: { t: number; descripcion: string; impacto: number }[];
};

export type Leccion = {
  id: string;
  titulo: string;
  concepto: string;
  pregunta: string;
  contexto: string;
  fuerzas: { nombre: string; descripcion: string }[];
  recomendada: string;
  justificacion: string[];
  explicacion: string;
  t_inicial: number;
  t_final: number;
  caminos: {
    clave: string;
    titulo: string;
    codigo: string;
    recomendada: boolean;
    trayectoria: PasoLeccion[];
  }[];
};

export type PuntoSimulacion = {
  t: number;
  fase: Fase;
  publicado: boolean;
  costo: number;
  deuda: number;
  cobertura: number;
  riesgo: string;
  pruebas_primero: number;
};

type Datos = {
  fases: FaseInfo[];
  metodologias: Modelo & {
    evidencias: Record<Evidencia, string>;
    familias: string[];
    metodos: Metodo[];
  };
  lecciones: Leccion[];
  simulacion: Record<string, { descripcion: string; trayectoria: PuntoSimulacion[] }>;
};

export const DATOS = crudo as unknown as Datos;
export const MODELO: Modelo = DATOS.metodologias;
export const METODOS = DATOS.metodologias.metodos;
export const FAMILIAS = DATOS.metodologias.familias;
export const FASES = DATOS.fases;

export const metodoPorId = (id: string) => METODOS.find((m) => m.id === id);
export const faseInfo = (signo: Fase) => FASES.find((f) => f.signo === signo)!;
export const medicionEn = (m: Metodo, t: number) =>
  m.trayectoria.find((p) => p.t === t) ?? m.trayectoria.at(-1)!;
export const actividad = (id: string) => MODELO.actividades[id]!;

export const T_MIN = -3;
export const T_MAX = 30;

export const DIMENSIONES = [
  { clave: "retencion", nombre: "Retención", que: "Cuánto recuerdas si te preguntan hoy" },
  { clave: "comprension", nombre: "Comprensión", que: "Qué tan bien entiendes cómo funciona" },
  { clave: "transferencia", nombre: "Transferencia", que: "Si puedes usarlo en un problema nuevo" },
  {
    clave: "criterio",
    nombre: "Criterio",
    que: "Si puedes explicar por qué así y no de otra forma",
  },
  {
    clave: "confianza",
    nombre: "Confianza",
    que: "Lo que sientes que sabes (no siempre es lo que sabes)",
  },
] as const;
export type Dimension = (typeof DIMENSIONES)[number]["clave"];

export const COLOR_FASE: Record<Fase, string> = {
  "t<0": "var(--t-antes)",
  "t=0": "var(--t-cero)",
  "t>0": "var(--t-despues)",
};
export const signoT = (t: number) => (t > 0 ? `+${t}` : `${t}`);

export const ORDEN_EVIDENCIA: Evidencia[] = ["alta", "moderada", "práctica profesional", "baja"];
