import type { ComponentType } from "react";
import {
  DemoEjemplosResueltos,
  DemoFeynman,
  DemoFracasoProductivo,
  DemoPrimm,
} from "./comprension";
import { DemoAdr, DemoCasos, DemoCincoPorques, DemoPremortem } from "./criterio";
import { DemoEspaciada, DemoMaestria, DemoRecuperacion, DemoRelectura } from "./memoria";
import {
  DemoEjemplosConErrores,
  DemoIntercalado,
  DemoKata,
  DemoParsons,
  DemoTdd,
} from "./practica";
import { DemoEnsenar, DemoPareja } from "./social";

/** Cada metodología del dominio (por id) tiene su ejemplo aplicado. */
export const DEMOS: Record<string, { componente: ComponentType; consigna: string }> = {
  relectura: {
    componente: DemoRelectura,
    consigna: "Lee, relee, estima cuánto sabes y luego responde sin el texto.",
  },
  recuperacion: {
    componente: DemoRecuperacion,
    consigna: "Responde de memoria cinco porqués de DDD y TDD. Solo después mira la respuesta.",
  },
  espaciada: {
    componente: DemoEspaciada,
    consigna:
      "Repasa con cajas de Leitner y avanza los días: las que aciertas vuelven cada vez más tarde.",
  },
  "fracaso-productivo": {
    componente: DemoFracasoProductivo,
    consigna:
      "Intenta resolver el problema antes de ver la solución. Tus fallos preparan la explicación.",
  },
  "ejemplos-resueltos": {
    componente: DemoEjemplosResueltos,
    consigna: "Estudia un ciclo TDD completo y completa los siguientes con cada vez menos ayuda.",
  },
  primm: {
    componente: DemoPrimm,
    consigna: "Predice qué imprime el código, ejecútalo, investiga, modifícalo y crea tu versión.",
  },
  feynman: {
    componente: DemoFeynman,
    consigna: "Explica qué es un agregado sin jerga. El analizador marca dónde todavía hay huecos.",
  },
  "cinco-porques": {
    componente: DemoCincoPorques,
    consigna: "Encadena porqués hasta llegar a una fuerza del negocio.",
  },
  intercalado: {
    componente: DemoIntercalado,
    consigna: "Identifica el patrón de DDD en escenarios mezclados a propósito.",
  },
  "ejemplos-con-errores": {
    componente: DemoEjemplosConErrores,
    consigna: "Encuentra la línea con el error de diseño y explica por qué lo es.",
  },
  parsons: { componente: DemoParsons, consigna: "Ordena las líneas de un ciclo TDD. Sobran dos." },
  tdd: {
    componente: DemoTdd,
    consigna: "Predice si cada prueba pasa o falla en un ciclo rojo, verde, refactor.",
  },
  kata: {
    componente: DemoKata,
    consigna: "Repite la kata en tu editor y registra tiempo y errores de cada repetición.",
  },
  maestria: {
    componente: DemoMaestria,
    consigna: "Supera cada nivel con 4 de 5 para desbloquear el siguiente.",
  },
  premortem: {
    componente: DemoPremortem,
    consigna: "Anticipa el fracaso, decide y recorre las consecuencias de todos los caminos.",
  },
  casos: {
    componente: DemoCasos,
    consigna: "Acompaña a Ana en su proyecto y decide en cada capítulo.",
  },
  adr: {
    componente: DemoAdr,
    consigna: "Escribe tu decisión en formato ADR y descárgala en Markdown para tu repositorio.",
  },
  ensenar: {
    componente: DemoEnsenar,
    consigna: "Explica el agregado al pato de goma. Solo hace preguntas.",
  },
  pareja: {
    componente: DemoPareja,
    consigna: "Organiza una sesión en pareja con turnos y preguntas para quien navega.",
  },
};
