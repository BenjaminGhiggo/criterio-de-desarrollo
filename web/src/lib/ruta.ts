// Ruta de lecciones generada por el dominio en Python (`criterio exportar`).
import crudo from "@/data/ruta.json";

export type Variable = { nombre: string; ref: string };
export type Marco = { nombre: string; linea: number; variables: Variable[] };
export type Objeto = {
  ref: string;
  tipo: string;
  valor: string;
  nombre?: string;
  elementos?: string[];
  pares?: [string, string][];
  atributos?: [string, string][];
  metodos?: string[];
};
export type Memoria = { marcos: Marco[]; objetos: Objeto[] };
export type Micro = { fragmento: string; valor: string | null; nota: string };
export type Paso = {
  t: number;
  tipo: "compilacion" | "line" | "call" | "return" | "exception" | "fin";
  funcion: string | null;
  ejecutada: number | null;
  siguiente: number | null;
  memoria: Memoria;
  salida: string;
  orden: Micro[];
  explicacion: string[];
};
export type Traza = {
  codigo: string;
  pasos: Paso[];
  salida: string;
  excepcion: string | null;
  error_compilacion: { linea: number; mensaje: string } | null;
  truncado: boolean;
};

export type Pregunta = {
  pregunta: string;
  opciones: string[];
  correcta: number;
  porque: string;
  sobre_salida: boolean;
};
export type Leccion = {
  id: string;
  orden: number;
  unidad: string;
  titulo: string;
  concepto: string;
  objetivo: string;
  codigo: string;
  idea_clave: string;
  metodologias: { metodologia: string; como: string }[];
  prediccion: Pregunta;
  repaso: Pregunta[];
  reto: string;
  explica: string;
  pasos: number;
  salida: string;
};

type Ruta = { python: string; unidades: string[]; lecciones: Leccion[] };

export const RUTA = crudo as unknown as Ruta;
export const LECCIONES = RUTA.lecciones;
export const UNIDADES = RUTA.unidades;
export const leccionPorId = (id: string) => LECCIONES.find((l) => l.id === id);
export const leccionesQueUsan = (metodo: string) =>
  LECCIONES.filter((l) => l.metodologias.some((u) => u.metodologia === metodo));

const trazas = import.meta.glob<{ default: Traza }>("../data/trazas/*.json");

export async function cargarTraza(id: string): Promise<Traza> {
  const cargar = trazas[`../data/trazas/${id}.json`];
  if (!cargar) throw new Error(`Sin traza para ${id}`);
  return (await cargar()).default;
}
