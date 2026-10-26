import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Encabezamiento, SignoFase } from "@/components/criterio";
import { Codigo } from "@/components/demos/kit";
import { Reveal } from "@/components/motion";
import type { Fase } from "@/domain/conocimiento";
import { COLOR_FASE, DATOS, MODELO, signoT } from "@/lib/datos";

const URL_SITIO = "https://criterio.benjacode.com";

export const Route = createFileRoute("/fundamentos")({
  head: () => ({
    meta: [
      { title: "Fundamentos: DDD, TDD y el protagonista medido en el tiempo — Criterio" },
      {
        name: "description",
        content:
          "Cómo está construido Criterio: contextos delimitados de DDD en Python, pruebas que codifican la evidencia sobre aprendizaje, el modelo del conocimiento y sus supuestos.",
      },
      { property: "og:url", content: `${URL_SITIO}/fundamentos` },
    ],
    links: [{ rel: "canonical", href: `${URL_SITIO}/fundamentos` }],
  }),
  component: Fundamentos,
});

const CONTEXTOS = [
  {
    nombre: "tiempo",
    tipo: "Núcleo compartido",
    texto:
      "Instante, Fase, LineaDeTiempo y Protagonista. Todos hablan el mismo idioma sobre t<0, t=0 y t>0.",
  },
  {
    nombre: "metodologias",
    tipo: "Contexto principal",
    texto:
      "El conocimiento como protagonista. 19 metodologías como planes en el tiempo y combinar() para tu mezcla.",
  },
  {
    nombre: "decisiones",
    tipo: "Propuesta A",
    texto:
      "Una decisión técnica: fuerzas y opciones en t<0, elección justificada en t=0, consecuencias en t>0.",
  },
  {
    nombre: "aprendiz",
    tipo: "Propuesta B",
    texto:
      "Quien aprende: diagnóstico, compromiso y práctica. Acertar sin saber por qué suma poco.",
  },
  {
    nombre: "codigo",
    tipo: "Propuesta C",
    texto: "Un módulo: pruebas primero, publicación y costo de cambio que crece con la deuda.",
  },
  {
    nombre: "catalogo",
    tipo: "Cliente de A",
    texto: "Siete lecciones de Python y DDD que se viven por cada camino posible.",
  },
  {
    nombre: "web",
    tipo: "Presentación",
    texto: "Exporta las trayectorias a JSON. Esta app no recalcula: muestra.",
  },
];

const PROTAGONISTA = `class Protagonista(ABC, Generic[S]):
    """No guarda su estado: guarda lo que le pasó."""

    def estado_en(self, t: Instante) -> S:
        return reduce(self._aplicar, self._linea.hasta(t), self._estado_inicial())

    def donde_esta(self, t) -> Ubicacion[S]:
        return Ubicacion(instante=t, fase=t.fase, estado=self.estado_en(t))`;

const PRUEBAS = `def test_efecto_de_prueba_recuperar_retiene_mas_que_releer():
    # Roediger y Karpicke (2006)
    assert medir("recuperacion", 7).retencion > medir("relectura", 7).retencion

def test_ilusion_de_fluidez_releer_da_la_mayor_confianza_sin_respaldo():
    brechas = {m.id: m.vivir().medir(7).brecha for m in METODOLOGIAS}
    assert max(brechas, key=brechas.get) == "relectura"

def test_espaciar_vence_a_concentrar_a_largo_plazo():
    # Cepeda et al. (2006)
    assert medir("espaciada", 30).retencion > medir("recuperacion", 30).retencion`;

const ESTRATEGIAS = [
  { clave: "tdd", nombre: "TDD", color: "var(--t-antes)" },
  { clave: "pruebas-despues", nombre: "Pruebas después", color: "var(--t-cero)" },
  { clave: "sin-pruebas", nombre: "Sin pruebas", color: "var(--destructive)" },
];

function CostoDeCambio() {
  const [t, setT] = useState(8);
  const W = 640,
    H = 240,
    P = 36;
  const trays = ESTRATEGIAS.map((e) => DATOS.simulacion[e.clave]!.trayectoria);
  const tMin = trays[0]![0]!.t,
    tMax = trays[0]!.at(-1)!.t;
  const yMax = Math.ceil(
    Math.max(
      ...trays
        .flat()
        .filter((p) => p.publicado)
        .map((p) => p.costo),
    ),
  );
  const x = (v: number) => P + ((v - tMin) / (tMax - tMin)) * (W - P * 2);
  const y = (v: number) => H - P - (v / yMax) * (H - P * 2);
  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Costo de cambio de un módulo según la estrategia de pruebas"
      >
        <rect x={P} y={P} width={x(0) - P} height={H - P * 2} fill="var(--t-antes)" opacity=".08" />
        <line x1={x(0)} x2={x(0)} y1={P} y2={H - P} stroke="var(--t-cero)" strokeWidth="2" />
        {Array.from({ length: yMax + 1 }, (_, v) => (
          <text
            key={v}
            x={P - 8}
            y={y(v) + 4}
            textAnchor="end"
            className="fill-muted-foreground font-mono text-[10px]"
          >
            {v}
          </text>
        ))}
        {Array.from({ length: tMax - tMin + 1 }, (_, i) => tMin + i).map((v) => (
          <text
            key={v}
            x={x(v)}
            y={H - 12}
            textAnchor="middle"
            className="font-mono text-[10px]"
            fill={v === 0 ? "var(--t-cero)" : "var(--muted-foreground)"}
          >
            {signoT(v)}
          </text>
        ))}
        {ESTRATEGIAS.map((e, i) => (
          <polyline
            key={e.clave}
            points={trays[i]!.filter((p) => p.publicado)
              .map((p) => `${x(p.t)},${y(p.costo)}`)
              .join(" ")}
            fill="none"
            stroke={e.color}
            strokeWidth="3"
            strokeLinejoin="round"
            pathLength={1}
            className="chart-line"
          />
        ))}
        <line x1={x(t)} x2={x(t)} y1={P} y2={H - P} stroke="var(--primary)" strokeDasharray="3 4" />
      </svg>
      <input
        type="range"
        className="rango"
        min={tMin}
        max={tMax}
        value={t}
        onChange={(e) => setT(Number(e.target.value))}
        aria-label="Instante de la simulación"
      />
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {ESTRATEGIAS.map((e, i) => {
          const p = trays[i]!.find((q) => q.t === t)!;
          return (
            <div
              key={e.clave}
              className="rounded-2xl border bg-background p-3 text-sm"
              style={{ borderTop: `3px solid ${e.color}` }}
            >
              <p className="font-display font-bold">{e.nombre}</p>
              <p className="font-mono">
                {p.publicado
                  ? `costo ${p.costo.toFixed(2)} · deuda ${p.deuda} · riesgo ${p.riesgo}`
                  : `diseñando · ${p.pruebas_primero} pruebas primero`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Fundamentos() {
  const actividades = Object.entries(MODELO.actividades);
  return (
    <main className="mx-auto max-w-[1560px] px-5 pb-20 pt-8 sm:px-8">
      <Encabezamiento ceja="Fundamentos" titulo="Construido con el mismo criterio que enseña.">
        Domain Driven Design para que el código hable el idioma del aprendizaje. Test Driven
        Development para que la evidencia sea una prueba que falla si alguien la contradice.
      </Encabezamiento>

      <section
        aria-labelledby="contextos"
        className="rounded-2xl bg-panel p-6 text-panel-foreground shadow-card sm:p-8"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="contextos" className="font-display text-2xl font-bold">
            Contextos delimitados en src/criterio/
          </h2>
          <span className="flex items-center gap-2 text-xs text-panel-foreground/65">
            <span className="live-dot size-2 rounded-full bg-success" />
            pruebas en Python y TypeScript
          </span>
        </div>
        <Reveal className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CONTEXTOS.map((c, i) => (
            <article
              key={c.nombre}
              className={`rounded-2xl border border-panel-foreground/15 p-4 transition-colors hover:border-accent/60 ${i === 0 ? "bg-accent/10 xl:row-span-2" : "bg-panel-foreground/5"}`}
            >
              <p className="font-mono text-sm font-bold text-accent">{c.nombre}/</p>
              <p className="mt-1 text-xs font-bold uppercase text-panel-foreground/55">{c.tipo}</p>
              <p className="mt-2 text-sm leading-6 text-panel-foreground/80">{c.texto}</p>
            </article>
          ))}
        </Reveal>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
          <p className="text-xs font-bold uppercase text-primary">El protagonista</p>
          <h2 className="mt-2 font-display text-2xl font-bold">
            El estado en cualquier t es la proyección de los hechos hasta t
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Event sourcing: nadie guarda «cómo estabas». Se guarda lo que te pasó, y cualquier
            instante del pasado o del futuro planificado se puede consultar sin copias
            desincronizadas.
          </p>
          <div className="mt-5">
            <Codigo titulo="tiempo/protagonista.py" codigo={PROTAGONISTA} />
          </div>
        </article>
        <article className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
          <p className="text-xs font-bold uppercase text-primary">TDD con evidencia</p>
          <h2 className="mt-2 font-display text-2xl font-bold">
            Cada hallazgo de la investigación es una prueba
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Los parámetros del modelo pueden cambiar; las comparaciones que la ciencia sostiene, no.
            Si un cambio contradice el efecto de prueba o el espaciado, CI falla.
          </p>
          <div className="mt-5">
            <Codigo titulo="tests/test_metodologias.py" codigo={PRUEBAS} />
          </div>
        </article>
      </section>

      <section
        aria-labelledby="supuestos"
        className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-card"
      >
        <div className="border-b p-6 sm:p-8">
          <p className="text-xs font-bold uppercase text-primary">
            Supuestos del modelo, a la vista
          </p>
          <h2 id="supuestos" className="mt-2 font-display text-2xl font-bold">
            Qué le hace cada actividad a tu conocimiento
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            Retención: curva del olvido exponencial; cada actividad multiplica la estabilidad (más
            si ya olvidaste un poco: dificultad deseable), y lo que se comprende se olvida más
            lento. Las demás dimensiones van de 0 a 100 con rendimientos decrecientes. Es un modelo
            ilustrativo para comparar, no una medición.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Actividad</th>
                <th className="px-3 py-3">Fase</th>
                <th className="px-3 py-3 text-right">Min</th>
                <th className="px-3 py-3 text-right">Estab. ×</th>
                <th className="px-3 py-3 text-right">Comp.</th>
                <th className="px-3 py-3 text-right">Transf.</th>
                <th className="px-3 py-3 text-right">Crit.</th>
                <th className="px-3 py-3 text-right">Conf.</th>
                <th className="px-5 py-3">Por qué</th>
              </tr>
            </thead>
            <tbody>
              {actividades.map(([id, a]) => (
                <tr key={id} className="border-t align-top">
                  <td className="px-5 py-3 font-semibold">{a.nombre}</td>
                  <td className="px-3 py-3">
                    <SignoFase fase={a.fase as Fase} />
                  </td>
                  <td className="px-3 py-3 text-right font-mono">{a.minutos}</td>
                  <td className="px-3 py-3 text-right font-mono">
                    {a.fase === "t>0"
                      ? `${a.estabilidad}${a.dificultad ? ` +${a.dificultad}·olvido` : ""}`
                      : a.fase === "t<0"
                        ? `prep +${a.preparacion}`
                        : "—"}
                  </td>
                  {(["comprension", "transferencia", "criterio", "confianza"] as const).map((k) => (
                    <td key={k} className="px-3 py-3 text-right font-mono">
                      {a[k] ? (a[k] > 0 ? `+${a[k]}` : a[k]) : "·"}
                    </td>
                  ))}
                  <td
                    className="px-5 py-3 text-muted-foreground"
                    style={{ borderLeft: `3px solid ${COLOR_FASE[a.fase as Fase]}` }}
                  >
                    {a.por_que}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <article className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
          <p className="text-xs font-bold uppercase text-primary">Las tres primeras propuestas</p>
          <h2 className="mt-2 font-display text-2xl font-bold">Otros protagonistas posibles</h2>
          <ol className="mt-5 space-y-4">
            <li>
              <p className="font-display font-bold">A · La Decisión</p>
              <p className="text-muted-foreground">
                Sin dos opciones no hay decisión; toda elección cita las fuerzas que la justifican.
                Alimenta la demo de pre-mortem.
              </p>
            </li>
            <li>
              <p className="font-display font-bold">B · El Aprendiz</p>
              <p className="text-muted-foreground">
                Acertar y justificar suma 10; acertar sin saber por qué, 2; equivocarse razonando,
                4. Inspira la valoración de cada metodología.
              </p>
            </li>
            <li>
              <p className="font-display font-bold">C · El Módulo de código</p>
              <p className="text-muted-foreground">
                Refactorizar sin cobertura está prohibido por el dominio. Su simulación muestra el
                costo de cambio a la derecha.
              </p>
            </li>
          </ol>
          <div className="mt-6">
            <Codigo
              titulo="terminal"
              codigo={`pip install -e ".[dev]"\npytest\ncriterio metodos\ncriterio metodo espaciada --t 7\ncriterio combinar espaciada feynman premortem\ncriterio exportar`}
            />
          </div>
        </article>
        <article className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
          <p className="text-xs font-bold uppercase text-primary">Propuesta C en simulación</p>
          <h2 className="mt-2 font-display text-2xl font-bold">El costo de cambiar un módulo</h2>
          <p className="mt-2 text-muted-foreground">
            1.0 es tocar código limpio y probado. Mueve t.
          </p>
          <div className="mt-5">
            <CostoDeCambio />
          </div>
        </article>
      </section>
    </main>
  );
}
