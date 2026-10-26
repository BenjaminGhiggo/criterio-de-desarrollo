/// <reference types="node" />
// Paridad con Python: los vectores los genera `criterio exportar`.
// npm test  ->  node --experimental-strip-types --test

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  combinarPlanes,
  medir,
  type Medicion,
  type Modelo,
  type PasoPlan,
} from "./conocimiento.ts";

type Vector = { ids: string[]; plan: PasoPlan[]; mediciones: Medicion[] };
type Metodo = { id: string; plan: PasoPlan[]; trayectoria: Medicion[] };

const datos = JSON.parse(
  readFileSync(new URL("../data/criterio.json", import.meta.url), "utf-8"),
) as {
  metodologias: Modelo & { metodos: Metodo[]; vectores: Vector[] };
};
const modelo = datos.metodologias;
const planDe = (id: string) => modelo.metodos.find((m) => m.id === id)!.plan;
const CAMPOS = ["retencion", "comprension", "transferencia", "criterio", "confianza"] as const;

for (const vector of modelo.vectores) {
  test(`combinar ${vector.ids.join(" + ")} da el mismo plan que Python`, () => {
    const plan = combinarPlanes(modelo, vector.ids.map(planDe));
    assert.deepEqual(
      plan.map((p) => [p.t, p.actividad]),
      vector.plan.map((p) => [p.t, p.actividad]),
    );
  });

  test(`medir ${vector.ids.join(" + ")} da las mismas mediciones que Python`, () => {
    for (const esperado of vector.mediciones) {
      const obtenido = medir(modelo, vector.plan, esperado.t);
      assert.equal(obtenido.fase, esperado.fase);
      assert.equal(obtenido.minutos, esperado.minutos);
      for (const campo of CAMPOS) {
        assert.ok(
          Math.abs(obtenido[campo] - esperado[campo]) < 1e-9,
          `${campo} en t=${esperado.t}`,
        );
      }
    }
  });
}

test("cada trayectoria exportada coincide con el port", () => {
  for (const metodo of modelo.metodos) {
    for (const esperado of metodo.trayectoria) {
      const obtenido = medir(modelo, metodo.plan, esperado.t);
      for (const campo of CAMPOS) {
        assert.ok(
          Math.abs(obtenido[campo] - esperado[campo]) < 0.01,
          `${metodo.id} ${campo} en t=${esperado.t}`,
        );
      }
    }
  }
});
