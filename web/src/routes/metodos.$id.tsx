import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  GraficoTrayectoria,
  InsigniaEvidencia,
  Medidores,
  PlanEnElTiempo,
  SelectorT,
  Valoracion,
} from "@/components/criterio";
import { DEMOS } from "@/components/demos";
import { faseDe } from "@/domain/conocimiento";
import {
  COLOR_FASE,
  DATOS,
  DIMENSIONES,
  METODOS,
  faseInfo,
  medicionEn,
  metodoPorId,
  signoT,
  type Dimension,
} from "@/lib/datos";
import { usePreferencias } from "@/lib/preferencias";
import { leccionesQueUsan } from "@/lib/ruta";

const URL_SITIO = "https://criterio.benjacode.com";

export const Route = createFileRoute("/metodos/$id")({
  loader: ({ params }) => {
    const metodo = metodoPorId(params.id);
    if (!metodo) throw notFound();
    return { id: metodo.id };
  },
  head: ({ params }) => {
    const m = metodoPorId(params.id);
    if (!m) return { meta: [{ title: "Metodología no encontrada — Criterio" }] };
    const url = `${URL_SITIO}/metodos/${m.id}`;
    return {
      meta: [
        { title: `${m.nombre} — Criterio` },
        {
          name: "description",
          content: `${m.resumen} Ejemplo aplicado a Python: ${m.ejemplo}. Evidencia ${m.evidencia}. Cómo aplicarlo esta semana, cuándo no usarlo y su efecto medido en el tiempo.`,
        },
        { property: "og:title", content: `${m.nombre} — Criterio` },
        { property: "og:description", content: m.resumen },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `Aplicar ${m.nombre} para aprender Python, DDD y TDD`,
            description: m.idea,
            inLanguage: "es",
            totalTime: `PT${m.minutos}M`,
            step: m.esta_semana.map((texto, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              text: texto,
            })),
            citation: m.fuente,
            url,
          }),
        },
      ],
    };
  },
  component: PaginaMetodo,
});

const CONTROL = "relectura";

function PaginaMetodo() {
  const { id } = Route.useLoaderData();
  const metodo = metodoPorId(id)!;
  const control = metodoPorId(CONTROL)!;
  const [t, setT] = useState(7);
  const [dimension, setDimension] = useState<Dimension>("retencion");
  const { prefs, actualizar } = usePreferencias();
  const semana = prefs[id]?.semana ?? [];
  const demo = DEMOS[id];
  const Demo = demo?.componente;
  const indice = METODOS.findIndex((m) => m.id === id);
  const anterior = METODOS[(indice - 1 + METODOS.length) % METODOS.length]!;
  const siguiente = METODOS[(indice + 1) % METODOS.length]!;
  const fase = faseDe(t);
  const series = [
    {
      id: metodo.id,
      nombre: metodo.nombre,
      color: "var(--primary)",
      puntos: metodo.trayectoria,
      grosor: 4,
    },
    ...(metodo.id === CONTROL
      ? []
      : [
          {
            id: control.id,
            nombre: `${control.nombre} (control)`,
            color: "var(--muted-foreground)",
            puntos: control.trayectoria,
            grosor: 2,
          },
        ]),
  ];

  return (
    <main>
      <section className="relative mx-auto grid max-w-[1560px] gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.1fr_.9fr]">
        <span
          aria-hidden="true"
          className="aurora aurora-1"
          style={{
            width: "460px",
            height: "460px",
            left: "-10%",
            top: "-20%",
            background: "color-mix(in oklab, var(--primary) 18%, transparent)",
            opacity: 0.5,
          }}
        />
        <div className="animate-float relative z-10">
          <nav aria-label="Ruta" className="mb-6 text-sm text-muted-foreground">
            <Link to="/metodologias" className="hover:text-primary">
              Metodologías
            </Link>
            <span className="mx-2">/</span>
            <span>{metodo.familia}</span>
          </nav>
          <p className="text-xs font-bold uppercase text-primary">
            {metodo.familia} · ejemplo: {metodo.ejemplo}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
            {metodo.nombre}
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-muted-foreground">{metodo.resumen}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <InsigniaEvidencia nivel={metodo.evidencia} />
            <span className="rounded-full border px-3 py-1.5 text-xs font-bold">
              <span className="font-mono">{metodo.minutos}</span> min en total
            </span>
          </div>
          <p className="mt-6 max-w-2xl text-lg leading-8">{metodo.idea}</p>
          <dl className="mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-4">
              <dt className="text-xs font-bold uppercase text-muted-foreground">Para quién</dt>
              <dd className="mt-1">{metodo.para_quien}</dd>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <dt className="text-xs font-bold uppercase text-muted-foreground">Fuente</dt>
              <dd className="mt-1 text-sm">{metodo.fuente}</dd>
              <dd className="mt-1 text-xs text-muted-foreground">
                {DATOS.metodologias.evidencias[metodo.evidencia]}
              </dd>
            </div>
          </dl>
          <a
            href="#probar"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-6 font-display font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
          >
            Probar el ejemplo
          </a>
        </div>
        <aside
          aria-label="Dónde está tu conocimiento"
          className="relative z-10 self-start rounded-[2rem] bg-panel p-6 text-panel-foreground shadow-soft sm:p-8 lg:sticky lg:top-6"
        >
          <div className="live-scan" aria-hidden="true" />
          <p className="text-xs font-bold uppercase text-accent">Dónde está tu conocimiento</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p
              className="font-mono text-5xl font-bold tabular-nums"
              style={{ color: COLOR_FASE[fase] }}
            >
              t={signoT(t)}
            </p>
            <p className="text-right text-sm text-panel-foreground/65">
              {faseInfo(fase).nombre}
              <br />
              {t <= 0 ? "días antes del encuentro" : `${t} ${t === 1 ? "día" : "días"} después`}
            </p>
          </div>
          <p className="mt-3 text-sm text-panel-foreground/70">{faseInfo(fase).pregunta}</p>
          <div className="mt-5 rounded-2xl bg-panel-foreground/5 p-3 [&_button]:border-panel-foreground/20 [&_button]:bg-transparent [&_button]:text-panel-foreground">
            <SelectorT t={t} onT={setT} />
          </div>
          <div className="mt-6">
            <Medidores medicion={medicionEn(metodo, t)} inversa />
          </div>
        </aside>
      </section>

      <section aria-labelledby="plan-titulo" className="border-y bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-[1560px] px-5 sm:px-8">
          <p className="mb-3 text-xs font-bold uppercase text-primary">El plan en el tiempo</p>
          <h2
            id="plan-titulo"
            className="mb-8 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl"
          >
            Qué haces antes, durante y después. Mueve t y mira qué ya ocurrió.
          </h2>
          <PlanEnElTiempo plan={metodo.plan} t={t} />
          <div className="mt-8 rounded-2xl border bg-background p-5 shadow-card sm:p-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-display text-xl font-bold">
                Trayectoria frente al método de control
              </p>
              <div className="flex flex-wrap gap-2">
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
            </div>
            <GraficoTrayectoria series={series} dimension={dimension} t={t} onT={setT} />
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {series.map((s) => (
                <span key={s.id} className="flex items-center gap-2">
                  <span className="h-1 w-6 rounded-full" style={{ background: s.color }} />
                  {s.nombre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {leccionesQueUsan(metodo.id).length > 0 && (
        <section aria-labelledby="en-la-ruta" className="mx-auto max-w-[1560px] px-5 pt-16 sm:px-8">
          <p className="mb-3 text-xs font-bold uppercase text-primary">Se aplica en la ruta</p>
          <h2
            id="en-la-ruta"
            className="max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl"
          >
            Úsala programando, no solo leyendo
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {leccionesQueUsan(metodo.id).map((l) => (
              <Link
                key={l.id}
                to="/aprende/$id"
                params={{ id: l.id }}
                className="rounded-2xl border bg-card p-5 shadow-card transition-colors hover:border-primary/40"
              >
                <p className="font-mono text-xs font-bold text-primary">
                  Lección {l.orden} · {l.unidad}
                </p>
                <p className="mt-1 font-display text-lg font-bold">{l.titulo}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {l.metodologias.find((u) => u.metodologia === metodo.id)?.como}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section
        id="probar"
        aria-labelledby="probar-titulo"
        className="mx-auto max-w-[1560px] scroll-mt-6 px-5 py-16 sm:px-8 sm:py-20"
      >
        <p className="mb-3 text-xs font-bold uppercase text-primary">Pruébalo ahora</p>
        <h2
          id="probar-titulo"
          className="max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl"
        >
          {metodo.ejemplo}
        </h2>
        {demo && <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{demo.consigna}</p>}
        <div className="mt-8 rounded-2xl border bg-card p-5 shadow-card sm:p-8">
          {Demo ? <Demo /> : <p>Ejemplo en preparación.</p>}
        </div>
      </section>

      <section
        aria-labelledby="semana-titulo"
        className="mx-auto grid max-w-[1560px] gap-6 px-5 pb-20 sm:px-8 xl:grid-cols-[1.1fr_.9fr]"
      >
        <div className="space-y-6">
          <article className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
            <p className="text-xs font-bold uppercase text-primary">Aplícalo esta semana</p>
            <h2 id="semana-titulo" className="mt-2 font-display text-2xl font-bold">
              Con tu propio código de Python
            </h2>
            <ul className="mt-5 space-y-3">
              {metodo.esta_semana.map((paso, i) => (
                <li key={paso}>
                  <label className="flex cursor-pointer gap-3 rounded-2xl border p-4 has-[:checked]:border-success/40 has-[:checked]:bg-success/10">
                    <input
                      type="checkbox"
                      className="mt-1 size-5 accent-[var(--success)]"
                      checked={semana.includes(i)}
                      onChange={(e) =>
                        actualizar(id, {
                          semana: e.target.checked ? [...semana, i] : semana.filter((x) => x !== i),
                        })
                      }
                    />
                    <span className="leading-7">{paso}</span>
                  </label>
                </li>
              ))}
            </ul>
          </article>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-destructive/25 bg-destructive/5 p-6">
              <p className="text-xs font-bold uppercase text-destructive">Cuándo no usarla</p>
              <p className="mt-2 leading-7">{metodo.cuando_no}</p>
            </article>
            <article className="rounded-2xl border border-success/30 bg-success/5 p-6">
              <p className="text-xs font-bold uppercase text-success">Señal de que funciona</p>
              <p className="mt-2 leading-7">{metodo.senal}</p>
            </article>
          </div>
        </div>
        <Valoracion id={id} nombre={metodo.nombre.split(" (")[0]!} />
      </section>

      <nav
        aria-label="Otras metodologías"
        className="mx-auto grid max-w-[1560px] gap-4 px-5 pb-20 sm:grid-cols-2 sm:px-8"
      >
        <Link
          to="/metodos/$id"
          params={{ id: anterior.id }}
          className="rounded-2xl border bg-card p-5 hover:border-primary/40"
        >
          <span className="text-xs font-bold uppercase text-muted-foreground">Anterior</span>
          <span className="mt-1 block font-display text-lg font-bold">{anterior.nombre}</span>
        </Link>
        <Link
          to="/metodos/$id"
          params={{ id: siguiente.id }}
          className="rounded-2xl border bg-card p-5 text-right hover:border-primary/40"
        >
          <span className="text-xs font-bold uppercase text-muted-foreground">Siguiente</span>
          <span className="mt-1 block font-display text-lg font-bold">{siguiente.nombre}</span>
        </Link>
      </nav>
    </main>
  );
}
