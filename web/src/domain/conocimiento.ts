// Port del modelo de src/criterio/metodologias/conocimiento.py.
//
// Solo se usa para la combinación de metodologías que elige cada persona en el
// navegador. Las trayectorias de cada metodología vienen ya calculadas por
// Python. conocimiento.test.ts verifica que este port y el original den los
// mismos números con los vectores exportados.

export type Fase = "t<0" | "t=0" | "t>0";

export type EfectoActividad = {
  nombre: string;
  fase: Fase;
  minutos: number;
  por_que: string;
  preparacion: number;
  estabilidad: number;
  dificultad: number;
  comprension: number;
  transferencia: number;
  criterio: number;
  confianza: number;
};

export type Modelo = {
  constantes: { estabilidad_inicial: number; confianza_inicial: number };
  actividades: Record<string, EfectoActividad>;
};

export type PasoPlan = { t: number; actividad: string; que_haces?: string };

export type Medicion = {
  t: number;
  fase: Fase;
  retencion: number;
  comprension: number;
  transferencia: number;
  criterio: number;
  confianza: number;
  minutos: number;
};

type Foto = {
  encontrado: boolean;
  preparacion: number;
  estabilidad: number;
  ultimoRepaso: number | null;
  comprension: number;
  transferencia: number;
  criterio: number;
  confianza: number;
  minutos: number;
};

export const faseDe = (t: number): Fase => (t < 0 ? "t<0" : t === 0 ? "t=0" : "t>0");

function sumar(valor: number, ganancia: number): number {
  if (ganancia >= 0) return valor + ganancia * (1 - valor / 100);
  return Math.max(0, valor + ganancia);
}

function efecto(modelo: Modelo, actividad: string): EfectoActividad {
  const e = modelo.actividades[actividad];
  if (!e) throw new Error(`Actividad desconocida: ${actividad}`);
  return e;
}

function retencion(foto: Foto, t: number): number {
  if (!foto.encontrado || foto.ultimoRepaso === null || t < foto.ultimoRepaso) return 0;
  return Math.exp(-(t - foto.ultimoRepaso) / (foto.estabilidad * (1 + foto.comprension / 100)));
}

function aplicar(modelo: Modelo, anterior: Foto, paso: PasoPlan): Foto {
  const e = efecto(modelo, paso.actividad);
  const foto: Foto = {
    ...anterior,
    minutos: anterior.minutos + e.minutos,
    confianza: sumar(anterior.confianza, e.confianza),
    criterio: sumar(anterior.criterio, e.criterio),
    transferencia: sumar(anterior.transferencia, e.transferencia),
  };
  if (e.fase === "t<0") {
    return { ...foto, preparacion: sumar(foto.preparacion * 100, e.preparacion * 100) / 100 };
  }
  if (e.fase === "t=0") {
    const p = foto.preparacion;
    return {
      ...foto,
      encontrado: true,
      ultimoRepaso: paso.t,
      estabilidad: modelo.constantes.estabilidad_inicial * (1 + p),
      comprension: sumar(foto.comprension, e.comprension + 20 * p),
      transferencia: sumar(foto.transferencia, 25 * p),
    };
  }
  const olvido = 1 - retencion(foto, paso.t);
  return {
    ...foto,
    ultimoRepaso: paso.t,
    estabilidad: foto.estabilidad * (e.estabilidad + e.dificultad * olvido),
    comprension: sumar(foto.comprension, e.comprension),
  };
}

const ordenar = (plan: PasoPlan[]) => [...plan].sort((a, b) => a.t - b.t);

export function medir(modelo: Modelo, plan: PasoPlan[], t: number): Medicion {
  const inicial: Foto = {
    encontrado: false,
    preparacion: 0,
    estabilidad: 0,
    ultimoRepaso: null,
    comprension: 0,
    transferencia: 0,
    criterio: 0,
    confianza: modelo.constantes.confianza_inicial,
    minutos: 0,
  };
  const foto = ordenar(plan)
    .filter((p) => p.t <= t)
    .reduce((f, p) => aplicar(modelo, f, p), inicial);
  return {
    t,
    fase: faseDe(t),
    retencion: 100 * retencion(foto, t),
    comprension: foto.comprension,
    transferencia: foto.transferencia,
    criterio: foto.criterio,
    confianza: foto.confianza,
    minutos: foto.minutos,
  };
}

export function trayectoria(
  modelo: Modelo,
  plan: PasoPlan[],
  desde: number,
  hasta: number,
): Medicion[] {
  const puntos: Medicion[] = [];
  for (let t = desde; t <= hasta; t++) puntos.push(medir(modelo, plan, t));
  return puntos;
}

/** Igual que combinar() en Python: un solo encuentro, sin duplicar (t, actividad). */
export function combinarPlanes(modelo: Modelo, planes: PasoPlan[][]): PasoPlan[] {
  const pasos = planes.flat();
  const encuentros = pasos.filter((p) => efecto(modelo, p.actividad).fase === "t=0");
  const encuentro = encuentros.find((p) => p.actividad === "ejemplo-resuelto") ?? encuentros[0];
  const vistos = new Set<string>();
  const plan: PasoPlan[] = [];
  for (const original of ordenar(pasos)) {
    const p = efecto(modelo, original.actividad).fase === "t=0" && encuentro ? encuentro : original;
    const clave = `${p.t}|${p.actividad}`;
    if (!vistos.has(clave)) {
      vistos.add(clave);
      plan.push(p);
    }
  }
  return plan;
}

export const dominio = (m: Medicion) =>
  (m.retencion + m.comprension + m.transferencia + m.criterio) / 4;
export const brecha = (m: Medicion) => m.confianza - m.retencion;
