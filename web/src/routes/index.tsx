import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MiniTraza } from "@/components/mini-traza";
import { Reveal } from "@/components/motion";
import { TarjetaMetodo } from "@/components/tarjeta-metodo";
import {
  Encabezamiento,
  GraficoTrayectoria,
  Marca,
  Medidores,
  SelectorT,
  SignoFase,
} from "@/components/criterio";
import { dominio, faseDe, type Fase } from "@/domain/conocimiento";
import {
  COLOR_FASE,
  DIMENSIONES,
  FAMILIAS,
  METODOS,
  MODELO,
  ORDEN_EVIDENCIA,
  T_MAX,
  T_MIN,
  faseInfo,
  medicionEn,
  metodoPorId,
  signoT,
  type Dimension,
  type Evidencia,
  type Metodo,
} from "@/lib/datos";
import { LECCIONES, UNIDADES, type Traza } from "@/lib/ruta";
import trazaReasignacion from "@/data/trazas/reasignacion.json";

const TRAZA_HERO = trazaReasignacion as unknown as Traza;

const URL_SITIO = "https://criterio.benjacode.com";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Criterio — 19 metodologías para aprender el porqué del desarrollo en Python" },
      {
        name: "description",
        content:
          "Compara y prueba 19 metodologías de aprendizaje (recuperación, repetición espaciada, fracaso productivo, TDD, pre-mortem y más) aplicadas a Python, DDD y TDD. Cada una medida en el tiempo: t<0, t=0 y t>0.",
      },
      { property: "og:url", content: `${URL_SITIO}/` },
    ],
    links: [{ rel: "canonical", href: `${URL_SITIO}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebSite", name: "Criterio", url: `${URL_SITIO}/`, inLanguage: "es" },
            {
              "@type": "Course",
              name: "Criterio de desarrollo: metodologías de aprendizaje",
              description:
                "Metodologías de aprendizaje aplicadas a Python, Domain Driven Design y Test Driven Development, medidas en el tiempo.",
              inLanguage: "es",
              isAccessibleForFree: true,
              provider: {
                "@type": "Organization",
                name: "benjacode",
                url: "https://benjacode.com",
              },
            },
            {
              "@type": "ItemList",
              name: "Metodologías de aprendizaje",
              itemListElement: METODOS.map((m, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: m.nombre,
                url: `${URL_SITIO}/metodos/${m.id}`,
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: Inicio,
});

// ── Hero: el protagonista en vivo ────────────────────────────────────────

function Hero() {
  return (
    <section
      id="inicio"
      className="relative mx-auto grid max-w-[1560px] items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:pb-28"
    >
      <span
        aria-hidden="true"
        className="aurora aurora-1"
        style={{
          width: "520px",
          height: "520px",
          left: "-8%",
          top: "-12%",
          background: "color-mix(in oklab, var(--primary) 22%, transparent)",
          opacity: 0.55,
        }}
      />
      <span
        aria-hidden="true"
        className="aurora aurora-2"
        style={{
          width: "440px",
          height: "440px",
          right: "-4%",
          bottom: "-14%",
          background: "color-mix(in oklab, var(--accent) 20%, transparent)",
          opacity: 0.5,
        }}
      />
      <div className="animate-float relative z-10">
        <p className="mb-5 text-xs font-bold uppercase text-primary">
          Python desde cero · Domain Driven Design · Test Driven Development
        </p>
        <h1 className="max-w-4xl font-display text-5xl font-bold leading-[1.02] sm:text-7xl lg:text-[5.2rem]">
          Programa desde Hola mundo. <span className="sheen-text">Mira qué pasa en memoria.</span>
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
          Siempre nos preguntamos por qué hacerlo de una forma y no de otra. La respuesta empieza
          por entender qué hace Python en cada instante: qué se ejecuta primero, en qué marco vive
          cada variable y a qué objeto apunta. {LECCIONES.length} lecciones, de una línea a un
          agregado con pruebas, cada una trabajada con metodologías de aprendizaje que tú eliges.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            to="/aprende/$id"
            params={{ id: "hola-mundo" }}
            className="inline-flex h-12 items-center rounded-full bg-primary px-6 font-display font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
          >
            Empezar: Hola mundo
          </Link>
          <Link
            to="/aprende"
            className="inline-flex h-12 items-center rounded-full border bg-card px-6 font-display font-semibold hover:border-primary/40 hover:text-primary"
          >
            Ver la ruta completa
          </Link>
        </div>
        <dl className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t pt-6">
          {[
            [String(LECCIONES.length), "lecciones de código"],
            [String(METODOS.length), "metodologías"],
            ["3", "fases del tiempo"],
          ].map(([valor, texto]) => (
            <div key={texto}>
              <dt className="sr-only">{texto}</dt>
              <dd className="font-mono text-3xl font-bold">{valor}</dd>
              <dd className="text-sm text-muted-foreground">{texto}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="relative mx-auto w-full max-w-2xl py-6">
        <div className="absolute inset-6 rotate-3 rounded-[3rem] bg-primary/10" />
        <div className="relative">
          <MiniTraza traza={TRAZA_HERO} />
        </div>
      </div>
    </section>
  );
}

// ── La ruta ──────────────────────────────────────────────────────────────

function Ruta() {
  return (
    <section
      aria-labelledby="ruta-titulo"
      className="mx-auto max-w-[1560px] px-5 py-20 sm:px-8 sm:py-24"
    >
      <Encabezamiento
        id="ruta-titulo"
        ceja="La ruta"
        titulo="De una línea a un agregado, sin saltarse lo que pasa en memoria."
      >
        Cada lección: predices antes de ejecutar (t&lt;0), ejecutas paso a paso viendo la pila y el
        montón (t≥0), y después repasas sin mirar y lo explicas. Las metodologías no se leen: se
        usan en cada lección.
      </Encabezamiento>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {UNIDADES.map((unidad, u) => (
          <div
            key={unidad}
            className="animate-float rounded-2xl border bg-card p-6 shadow-card"
            style={{ animationDelay: `${u * 60}ms` }}
          >
            <p className="font-mono text-xs font-bold text-primary">Unidad {u + 1}</p>
            <h3 className="mt-1 font-display text-xl font-bold">{unidad}</h3>
            <ol className="mt-4 space-y-2">
              {LECCIONES.filter((l) => l.unidad === unidad).map((l) => (
                <li key={l.id}>
                  <Link
                    to="/aprende/$id"
                    params={{ id: l.id }}
                    className="grid grid-cols-[32px_1fr] items-center gap-3 rounded-2xl px-2 py-2 hover:bg-primary/5"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                      {l.orden}
                    </span>
                    <span>
                      <span className="block font-semibold leading-tight">{l.titulo}</span>
                      <span className="block text-xs text-muted-foreground">{l.concepto}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Metodologías: adelanto ──────────────────────────────────────────────

function Adelanto() {
  const destacadas = [...METODOS]
    .sort((a, b) => ORDEN_EVIDENCIA.indexOf(a.evidencia) - ORDEN_EVIDENCIA.indexOf(b.evidencia))
    .slice(0, 6);
  return (
    <section
      aria-labelledby="adelanto-titulo"
      className="mx-auto max-w-[1560px] px-5 py-20 sm:px-8 sm:py-24"
    >
      <Encabezamiento
        id="adelanto-titulo"
        ceja={`${METODOS.length} metodologías`}
        titulo="Cómo aprendes también se elige."
      >
        Cada lección usa dos o tres metodologías. Aquí están todas, con su evidencia, un ejemplo
        para probar y una valoración tuya. Empieza por las de evidencia alta.
      </Encabezamiento>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {destacadas.map((m) => (
          <TarjetaMetodo key={m.id} metodo={m} />
        ))}
      </div>
      <Link
        to="/metodologias"
        className="mt-8 inline-flex h-12 items-center rounded-full border bg-card px-6 font-display font-semibold hover:border-primary/40 hover:text-primary"
      >
        Ver las {METODOS.length} metodologías
      </Link>
    </section>
  );
}

// ── El marco temporal ────────────────────────────────────────────────────

const MARCO: Record<Fase, { titulo: string; texto: string }> = {
  "t<0": {
    titulo: "Antes de que te expliquen",
    texto:
      "Predecir, intentar y fallar, preguntarte para qué existe algo. Casi nadie hace nada aquí, y es donde más rinde el poco tiempo invertido.",
  },
  "t=0": {
    titulo: "El encuentro",
    texto:
      "La explicación, el ejemplo resuelto, la documentación. Es lo que solemos llamar aprender, pero solo es el punto de referencia.",
  },
  "t>0": {
    titulo: "Después",
    texto:
      "Recuperar, espaciar, aplicar, enseñar, reflexionar. Aquí se decide si lo aprendido se queda, se transfiere y se vuelve criterio.",
  },
};

function Marco() {
  return (
    <section aria-labelledby="marco-titulo" className="border-y bg-card py-20 sm:py-24">
      <div className="mx-auto max-w-[1560px] px-5 sm:px-8">
        <Encabezamiento
          id="marco-titulo"
          ceja="El protagonista es tu conocimiento"
          titulo="Todo aprendizaje tiene un antes, un instante y un después."
        >
          Medimos tu conocimiento de un concepto en cada instante t. El encuentro con el concepto es
          t=0; lo que haces antes y después es lo que distingue a una metodología de otra.
        </Encabezamiento>
        <Reveal className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
          {(["t<0", "t=0", "t>0"] as Fase[]).map((fase) => {
            const actividades = Object.values(MODELO.actividades).filter((a) => a.fase === fase);
            return (
              <article key={fase} className="bg-card p-7 sm:p-9">
                <p className="font-mono text-3xl font-bold" style={{ color: COLOR_FASE[fase] }}>
                  {fase}
                </p>
                <h3 className="mt-4 font-display text-2xl font-bold">{MARCO[fase].titulo}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{MARCO[fase].texto}</p>
                <p className="mt-5 text-xs font-bold uppercase text-muted-foreground">
                  {faseInfo(fase).pregunta}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {actividades.map((a) => (
                    <li
                      key={a.nombre}
                      title={a.por_que}
                      className="rounded-full border px-3 py-1 text-xs font-semibold"
                      style={{
                        borderColor: `color-mix(in oklab, ${COLOR_FASE[fase]} 40%, transparent)`,
                      }}
                    >
                      {a.nombre}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

// ── Las metodologías ─────────────────────────────────────────────────────

// ── La trampa de la sensación ────────────────────────────────────────────

const TRAMPA = [
  { id: "relectura", color: "var(--destructive)" },
  { id: "recuperacion", color: "var(--t-antes)" },
  { id: "espaciada", color: "var(--primary)" },
];

function Trampa() {
  const [dimension, setDimension] = useState<Dimension>("retencion");
  const [t, setT] = useState(7);
  const series = TRAMPA.map(({ id, color }) => {
    const m = metodoPorId(id)!;
    return { id, nombre: m.nombre, color, puntos: m.trayectoria };
  });
  return (
    <section aria-labelledby="trampa-titulo" className="border-y bg-card py-20 sm:py-24">
      <div className="mx-auto grid max-w-[1560px] gap-10 px-5 sm:px-8 xl:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="mb-3 text-xs font-bold uppercase text-primary">Por qué medir</p>
          <h2
            id="trampa-titulo"
            className="font-display text-4xl font-bold leading-tight sm:text-5xl"
          >
            Sentir que aprendes no es aprender.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Releer da la confianza más alta y la retención más baja. Recuperar de memoria se siente
            peor y se queda más. Espaciar esas recuperaciones las hace durar meses. Cambia de
            dimensión y recorre el tiempo.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {DIMENSIONES.map((d) => (
              <button
                key={d.clave}
                type="button"
                aria-pressed={dimension === d.clave}
                onClick={() => setDimension(d.clave)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${dimension === d.clave ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground"}`}
              >
                {d.nombre}
              </button>
            ))}
          </div>
          <ul className="mt-6 space-y-3">
            {series.map((s) => {
              const m = metodoPorId(s.id)!;
              const p = medicionEn(m, t);
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border bg-background p-3"
                >
                  <span className="flex items-center gap-3 font-semibold">
                    <span className="h-1 w-6 rounded-full" style={{ background: s.color }} />
                    {s.nombre}
                  </span>
                  <span className="font-mono text-sm">
                    conf. {p.confianza.toFixed(0)} · ret. {p.retencion.toFixed(0)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-2xl border bg-background p-5 shadow-card sm:p-7">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-xl font-bold">
              {DIMENSIONES.find((d) => d.clave === dimension)!.nombre} en el tiempo
            </p>
            <SignoFase fase={faseDe(t)} className="text-sm" />
          </div>
          <GraficoTrayectoria series={series} dimension={dimension} t={t} onT={setT} />
          <div className="mt-4">
            <SelectorT t={t} onT={setT} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Modelo ilustrativo calibrado con hallazgos de la investigación (Roediger y Karpicke,
            2006; Cepeda et al., 2006; Dunlosky et al., 2013). Sirve para comparar, no para predecir
            tu nota.
          </p>
        </div>
      </div>
    </section>
  );
}

function Llamado() {
  return (
    <section className="mx-auto max-w-[1560px] px-5 py-20 sm:px-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-panel p-8 text-panel-foreground shadow-soft sm:p-12">
        <div className="live-scan" aria-hidden="true" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase text-accent">Cómo usar esta página</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
              Programa. Observa. Valora. Elige.
            </h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                "Empieza la ruta en Hola mundo y avanza lección por lección.",
                "En cada lección predices, ejecutas paso a paso y repasas sin mirar.",
                "Valora las metodologías que usaste: ¿te hicieron aprender?",
                "Tu metodología es la combinación: un plan para t<0, t=0 y t>0.",
              ].map((paso, i) => (
                <li key={paso} className="flex gap-3">
                  <span className="font-mono text-accent">0{i + 1}</span>
                  <span className="text-panel-foreground/80">{paso}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              to="/comparar"
              className="inline-flex h-12 items-center rounded-full border border-panel-foreground/25 px-6 font-display font-semibold hover:border-accent"
            >
              Comparar todas
            </Link>
            <Link
              to="/mi-metodologia"
              className="inline-flex h-12 items-center rounded-full bg-accent px-6 font-display font-semibold text-accent-foreground"
            >
              Ver mi metodología
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Inicio() {
  return (
    <main>
      <Hero />
      <Ruta />
      <Marco />
      <Adelanto />
      <Trampa />
      <Llamado />
    </main>
  );
}
