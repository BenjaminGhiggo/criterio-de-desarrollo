import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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

const RECORRIDO = ["relectura", "espaciada", "fracaso-productivo", "premortem"];

function PanelEnVivo() {
  const [indice, setIndice] = useState(0);
  const [t, setT] = useState(T_MAX);
  const pausado = useRef(false);
  const metodo = metodoPorId(RECORRIDO[indice]!)!;

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setT(T_MIN);
    const id = setInterval(() => {
      if (pausado.current) return;
      setT((actual) => {
        if (actual < T_MAX) return actual + 1;
        setIndice((i) => (i + 1) % RECORRIDO.length);
        return T_MIN;
      });
    }, 260);
    return () => clearInterval(id);
  }, []);

  const medicion = medicionEn(metodo, t);
  const fase = faseDe(t);
  return (
    <div
      className="relative overflow-hidden rounded-[2rem] bg-panel p-6 text-panel-foreground shadow-soft transition-transform duration-500 hover:rotate-0 sm:p-8"
      onMouseEnter={() => (pausado.current = true)}
      onMouseLeave={() => (pausado.current = false)}
      onFocus={() => (pausado.current = true)}
      onBlur={() => (pausado.current = false)}
    >
      <div className="live-scan" aria-hidden="true" />
      <div className="flex items-center justify-between gap-3">
        <Marca inversa />
        <span className="flex items-center gap-2 rounded-full border border-panel-foreground/20 px-3 py-2 font-mono text-xs">
          <span className="live-dot size-2 rounded-full bg-accent" />
          PROTAGONISTA EN VIVO
        </span>
      </div>
      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Metodología del panel">
        {RECORRIDO.map((id, i) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={i === indice}
            onClick={() => {
              setIndice(i);
              setT(T_MIN);
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${i === indice ? "border-accent bg-accent text-accent-foreground" : "border-panel-foreground/20 text-panel-foreground/70 hover:border-accent/60"}`}
          >
            {metodoPorId(id)!.nombre.split(" (")[0]}
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-panel-foreground/55">
            Tu conocimiento de «{metodo.ejemplo}»
          </p>
          <p
            className="mt-1 font-mono text-4xl font-bold tabular-nums"
            style={{ color: COLOR_FASE[fase] }}
          >
            t = {signoT(t)}
          </p>
        </div>
        <p className="max-w-[12rem] text-right text-sm text-panel-foreground/65">
          {faseInfo(fase).nombre}:{" "}
          {fase === "t<0" ? "preparación" : fase === "t=0" ? "encuentro" : "consolidación"}
        </p>
      </div>
      <div className="relative mt-5 h-1.5 rounded-full bg-panel-foreground/10">
        <div className="eje-gradiente absolute inset-0 rounded-full opacity-60" />
        <span
          className="marcador-vivo absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-panel bg-accent text-accent transition-[left] duration-200"
          style={{ left: `${((t - T_MIN) / (T_MAX - T_MIN)) * 100}%` }}
        />
      </div>
      <div className="mt-7">
        <Medidores medicion={medicion} inversa />
      </div>
    </div>
  );
}

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
          Python · Domain Driven Design · Test Driven Development
        </p>
        <h1 className="max-w-4xl font-display text-5xl font-bold leading-[1.02] sm:text-7xl lg:text-[5.2rem]">
          No aprendas más. <span className="sheen-text">Aprende cómo aprendes.</span>
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
          Siempre nos preguntamos por qué hacerlo de una forma y no de otra. Aquí la respuesta
          empieza antes: en cómo aprendes. 19 metodologías, cada una con un ejemplo de Python que
          puedes probar ahora, medidas en el tiempo. Tú eliges las que de verdad te hacen aprender.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href="#metodologias"
            className="inline-flex h-12 items-center rounded-full bg-primary px-6 font-display font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
          >
            Explorar las 19 metodologías
          </a>
          <Link
            to="/mi-metodologia"
            className="inline-flex h-12 items-center rounded-full border bg-card px-6 font-display font-semibold hover:border-primary/40 hover:text-primary"
          >
            Armar mi metodología
          </Link>
        </div>
        <dl className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t pt-6">
          {[
            [String(METODOS.length), "metodologías"],
            [String(METODOS.filter((m) => m.evidencia === "alta").length), "con evidencia alta"],
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
          <PanelEnVivo />
        </div>
      </div>
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

type Orden = "evidencia" | "dominio" | "minutos";

function Metodologias() {
  const [familia, setFamilia] = useState<string>("Todas");
  const [evidencia, setEvidencia] = useState<Evidencia | "todas">("todas");
  const [orden, setOrden] = useState<Orden>("evidencia");
  const visibles = useMemo(() => {
    const lista = METODOS.filter(
      (m) =>
        (familia === "Todas" || m.familia === familia) &&
        (evidencia === "todas" || m.evidencia === evidencia),
    );
    const clave = (m: Metodo) =>
      orden === "evidencia"
        ? ORDEN_EVIDENCIA.indexOf(m.evidencia) * 1000 - dominio(medicionEn(m, T_MAX))
        : orden === "dominio"
          ? -dominio(medicionEn(m, T_MAX))
          : m.minutos;
    return [...lista].sort((a, b) => clave(a) - clave(b));
  }, [familia, evidencia, orden]);
  return (
    <section
      id="metodologias"
      aria-labelledby="metodos-titulo"
      className="mx-auto max-w-[1560px] scroll-mt-6 px-5 py-20 sm:px-8 sm:py-24"
    >
      <Encabezamiento
        id="metodos-titulo"
        ceja={`${METODOS.length} propuestas`}
        titulo="Metodologías para elegir, no para creer."
      >
        Cada tarjeta muestra su plan en el tiempo (turquesa antes, ámbar el encuentro, violeta
        después), su evidencia y cuánto desarrolla tu conocimiento en 30 días según el modelo.
        Entra, prueba el ejemplo y valóralo.
      </Encabezamiento>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por familia">
          {["Todas", ...FAMILIAS].map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={familia === f}
              onClick={() => setFamilia(f)}
              className={`h-10 rounded-full px-4 text-sm font-semibold transition-colors ${familia === f ? "bg-primary text-primary-foreground shadow-glow" : "border bg-card text-muted-foreground hover:text-primary"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Filtrar por evidencia"
            value={evidencia}
            onChange={(e) => setEvidencia(e.target.value as Evidencia | "todas")}
            className="h-10 rounded-full border bg-card px-4 text-sm font-semibold"
          >
            <option value="todas">Toda evidencia</option>
            {ORDEN_EVIDENCIA.map((e) => (
              <option key={e} value={e}>
                Evidencia {e}
              </option>
            ))}
          </select>
          <select
            aria-label="Ordenar"
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            className="h-10 rounded-full border bg-card px-4 text-sm font-semibold"
          >
            <option value="evidencia">Ordenar por evidencia</option>
            <option value="dominio">Ordenar por dominio a t=+30</option>
            <option value="minutos">Ordenar por menos tiempo</option>
          </select>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {visibles.map((m, i) => (
          <div
            key={m.id}
            className="animate-float"
            style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
          >
            <TarjetaMetodo metodo={m} />
          </div>
        ))}
      </div>
    </section>
  );
}

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
              Prueba. Valora. Elige. Combina.
            </h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                "Entra a una metodología y haz su ejemplo de Python.",
                "Responde con honestidad si te hizo aprender.",
                "Marca las que eliges y compara sus trayectorias.",
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
      <Marco />
      <Metodologias />
      <Trampa />
      <Llamado />
    </main>
  );
}
