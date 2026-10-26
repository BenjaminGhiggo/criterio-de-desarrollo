import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Encabezamiento,
  GraficoTrayectoria,
  Medidores,
  PlanEnElTiempo,
  SelectorT,
} from "@/components/criterio";
import { BotonCopiar } from "@/components/demos/kit";
import { TarjetaMetodo } from "@/components/tarjeta-metodo";
import { combinarPlanes, dominio, faseDe, trayectoria, type PasoPlan } from "@/domain/conocimiento";
import {
  DIMENSIONES,
  METODOS,
  MODELO,
  T_MAX,
  T_MIN,
  actividad,
  medicionEn,
  metodoPorId,
  signoT,
  type Dimension,
} from "@/lib/datos";
import { usePreferencias } from "@/lib/preferencias";

const URL_SITIO = "https://criterio.benjacode.com";
const SUGERIDAS = ["espaciada", "feynman", "premortem"];

export const Route = createFileRoute("/mi-metodologia")({
  head: () => ({
    meta: [
      { title: "Mi metodología de aprendizaje — Criterio" },
      {
        name: "description",
        content:
          "Combina las metodologías de aprendizaje que elegiste en un solo plan para antes, durante y después de aprender, y mide su efecto en 30 días.",
      },
      { property: "og:url", content: `${URL_SITIO}/mi-metodologia` },
    ],
    links: [{ rel: "canonical", href: `${URL_SITIO}/mi-metodologia` }],
  }),
  component: MiMetodologia,
});

function aMarkdown(
  ids: string[],
  plan: Required<PasoPlan>[],
  notas: Record<string, { nota?: number; nota_texto?: string }>,
) {
  const final = trayectoria(MODELO, plan, T_MAX, T_MAX)[0]!;
  const fases = [
    ["t<0 · Antes del encuentro", (t: number) => t < 0],
    ["t=0 · El encuentro", (t: number) => t === 0],
    ["t>0 · Después", (t: number) => t > 0],
  ] as const;
  const pasos = fases
    .map(([titulo, en]) => {
      const lista = plan
        .filter((p) => en(p.t))
        .map((p) => `- t=${signoT(p.t)} · ${actividad(p.actividad).nombre}: ${p.que_haces}`);
      return `### ${titulo}\n${lista.length ? lista.join("\n") : "- (nada)"}`;
    })
    .join("\n\n");
  const metodos = ids.map((id) => {
    const m = metodoPorId(id)!;
    const n = notas[id];
    return `- **${m.nombre}** (evidencia ${m.evidencia})${n?.nota ? ` · mi nota ${n.nota}/5` : ""}${n?.nota_texto ? ` · ${n.nota_texto}` : ""}`;
  });
  const semana = [...new Set(ids.flatMap((id) => metodoPorId(id)!.esta_semana))].map(
    (s) => `- [ ] ${s}`,
  );
  return `# Mi metodología de aprendizaje

Generada en ${URL_SITIO}

## Metodologías elegidas
${metodos.join("\n")}

## Plan en el tiempo
${pasos}

## Esta semana
${semana.join("\n")}

## Lo que predice el modelo a t=+30
- Retención: ${final.retencion.toFixed(0)}
- Comprensión: ${final.comprension.toFixed(0)}
- Transferencia: ${final.transferencia.toFixed(0)}
- Criterio: ${final.criterio.toFixed(0)}
- Tiempo invertido: ${final.minutos} min
`;
}

function MiMetodologia() {
  const { prefs, actualizar, reiniciar } = usePreferencias();
  const [t, setT] = useState(T_MAX);
  const [dimension, setDimension] = useState<Dimension>("criterio");
  const elegidas = METODOS.filter((m) => prefs[m.id]?.elegida).map((m) => m.id);
  const valoradas = METODOS.filter((m) => prefs[m.id]?.nota).sort(
    (a, b) => (prefs[b.id]!.nota ?? 0) - (prefs[a.id]!.nota ?? 0),
  );

  const claveElegidas = elegidas.join("|");
  const plan = useMemo(() => {
    const ids = claveElegidas ? claveElegidas.split("|") : [];
    return ids.length
      ? (combinarPlanes(
          MODELO,
          ids.map((id) => metodoPorId(id)!.plan),
        ) as Required<PasoPlan>[])
      : [];
  }, [claveElegidas]);
  const puntos = useMemo(
    () => (plan.length ? trayectoria(MODELO, plan, T_MIN, T_MAX) : []),
    [plan],
  );

  if (!elegidas.length) {
    return (
      <main className="mx-auto max-w-[1560px] px-5 pb-20 pt-8 sm:px-8">
        <Encabezamiento ceja="Mi metodología" titulo="Todavía no elegiste ninguna metodología.">
          Entra a cada metodología, prueba su ejemplo y marca «La elijo». Aquí se combinan en un
          solo plan y se mide qué tan bien funcionan juntas.
        </Encabezamiento>
        <div className="rounded-2xl bg-panel p-6 text-panel-foreground shadow-card sm:p-8">
          <p className="text-xs font-bold uppercase text-accent">Para empezar</p>
          <h2 className="mt-2 font-display text-2xl font-bold">
            Una mezcla equilibrada: memoria, comprensión y criterio
          </h2>
          <p className="mt-2 max-w-2xl text-panel-foreground/70">
            Repetición espaciada para que dure, Feynman para entender y pre-mortem para desarrollar
            el porqué. Puedes cambiarla después.
          </p>
          <button
            type="button"
            onClick={() => SUGERIDAS.forEach((id) => actualizar(id, { elegida: true }))}
            className="mt-6 h-12 rounded-full bg-accent px-6 font-display font-semibold text-accent-foreground"
          >
            Usar esta mezcla
          </button>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {SUGERIDAS.map((id) => (
            <TarjetaMetodo key={id} metodo={metodoPorId(id)!} />
          ))}
        </div>
      </main>
    );
  }

  const mejorSola = elegidas
    .map((id) => metodoPorId(id)!)
    .sort((a, b) => dominio(medicionEn(b, T_MAX)) - dominio(medicionEn(a, T_MAX)))[0]!;
  const control = metodoPorId("relectura")!;
  const series = [
    { id: "mia", nombre: "Tu metodología", color: "var(--primary)", puntos, grosor: 4 },
    ...(elegidas.length > 1
      ? [
          {
            id: mejorSola.id,
            nombre: `${mejorSola.nombre.split(" (")[0]} sola`,
            color: "var(--t-antes)",
            puntos: mejorSola.trayectoria,
            grosor: 2.5,
          },
        ]
      : []),
    {
      id: control.id,
      nombre: "Releer (control)",
      color: "var(--muted-foreground)",
      puntos: control.trayectoria,
      grosor: 2,
    },
  ];
  const actual = puntos.find((p) => p.t === t)!;
  const final = puntos.at(-1)!;
  const md = aMarkdown(elegidas, plan, prefs);
  const descargar = () => {
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "mi-metodologia.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-[1560px] px-5 pb-20 pt-8 sm:px-8">
      <Encabezamiento
        ceja="Mi metodología"
        titulo={`${elegidas.length} ${elegidas.length === 1 ? "metodología" : "metodologías"}, un solo plan.`}
      >
        Un único encuentro en t=0 y todas las actividades de antes y después que elegiste. El modelo
        mide cómo queda tu conocimiento día a día.
      </Encabezamiento>

      <div className="mb-8 flex flex-wrap gap-2">
        {elegidas.map((id) => {
          const m = metodoPorId(id)!;
          return (
            <span
              key={id}
              className="inline-flex items-center gap-2 rounded-full border bg-card py-1.5 pl-4 pr-1.5 text-sm font-semibold"
            >
              <Link to="/metodos/$id" params={{ id }} className="hover:text-primary">
                {m.nombre.split(" (")[0]}
              </Link>
              {prefs[id]?.nota && (
                <span className="font-mono text-xs text-muted-foreground">{prefs[id]!.nota}/5</span>
              )}
              <button
                type="button"
                aria-label={`Quitar ${m.nombre}`}
                onClick={() => actualizar(id, { elegida: false })}
                className="grid size-7 place-items-center rounded-full bg-muted font-mono text-xs hover:bg-destructive/15"
              >
                x
              </button>
            </span>
          );
        })}
        <Link
          to="/"
          hash="metodologias"
          className="inline-flex items-center rounded-full border border-dashed px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          Agregar más
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-2xl border bg-card p-5 shadow-card sm:p-7">
          <div className="mb-4 flex flex-wrap gap-2">
            {DIMENSIONES.map((d) => (
              <button
                key={d.clave}
                type="button"
                aria-pressed={dimension === d.clave}
                onClick={() => setDimension(d.clave)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${dimension === d.clave ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground"}`}
              >
                {d.nombre}
              </button>
            ))}
          </div>
          <GraficoTrayectoria series={series} dimension={dimension} t={t} onT={setT} alto={300} />
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {series.map((s) => (
              <span key={s.id} className="flex items-center gap-2">
                <span className="h-1 w-6 rounded-full" style={{ background: s.color }} />
                {s.nombre}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <SelectorT t={t} onT={setT} />
          </div>
        </div>
        <aside className="rounded-2xl bg-panel p-6 text-panel-foreground shadow-card sm:p-7">
          <p className="text-xs font-bold uppercase text-accent">
            Tu conocimiento en t={signoT(t)} · {faseDe(t)}
          </p>
          <p className="mt-2 font-mono text-4xl font-bold">
            {dominio(actual).toFixed(0)}
            <span className="ml-2 text-base text-panel-foreground/60">de dominio</span>
          </p>
          <p className="mt-1 text-sm text-panel-foreground/60">
            A t=+30: {dominio(final).toFixed(0)} con {final.minutos} min. Releer:{" "}
            {dominio(medicionEn(control, T_MAX)).toFixed(0)} con {control.minutos} min.
          </p>
          <div className="mt-6">
            <Medidores medicion={actual} inversa />
          </div>
        </aside>
      </section>

      <section aria-labelledby="plan-mio" className="mt-10">
        <h2 id="plan-mio" className="mb-5 font-display text-3xl font-bold">
          Tu plan en el tiempo
        </h2>
        <PlanEnElTiempo plan={plan} t={t} />
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
          <p className="text-xs font-bold uppercase text-primary">Esta semana</p>
          <ul className="mt-4 space-y-2">
            {[...new Set(elegidas.flatMap((id) => metodoPorId(id)!.esta_semana))].map((s) => (
              <li key={s} className="rounded-2xl border p-3 leading-7">
                {s}
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
          <p className="text-xs font-bold uppercase text-primary">Lo que valoraste</p>
          {valoradas.length === 0 ? (
            <p className="mt-4 text-muted-foreground">
              Aún no valoraste ninguna. Después de probar un ejemplo, responde si te hizo aprender.
            </p>
          ) : (
            <ol className="mt-4 space-y-2">
              {valoradas.map((m) => (
                <li key={m.id} className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border p-3">
                  <span className="font-mono text-lg font-bold text-primary">
                    {prefs[m.id]!.nota}/5
                  </span>
                  <span>
                    <Link
                      to="/metodos/$id"
                      params={{ id: m.id }}
                      className="font-semibold hover:text-primary"
                    >
                      {m.nombre}
                    </Link>
                    {prefs[m.id]!.nota_texto && (
                      <span className="block text-sm text-muted-foreground">
                        {prefs[m.id]!.nota_texto}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={descargar}
              className="h-11 rounded-full bg-primary px-5 font-display text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Descargar en Markdown
            </button>
            <BotonCopiar texto={md} />
            <button
              type="button"
              onClick={() => {
                if (confirm("¿Borrar todas tus valoraciones y elecciones?")) reiniciar();
              }}
              className="h-11 rounded-full px-5 text-sm font-semibold text-muted-foreground underline"
            >
              Empezar de cero
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
