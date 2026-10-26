import { Link, createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/motion";
import { metodoPorId } from "@/lib/datos";
import { useProgreso } from "@/lib/progreso";
import { LECCIONES, UNIDADES } from "@/lib/ruta";

const URL_SITIO = "https://criterio.benjacode.com";

export const Route = createFileRoute("/aprende/")({
  head: () => ({
    meta: [
      { title: "Aprende a programar en Python desde Hola mundo, paso a paso — Criterio" },
      {
        name: "description",
        content:
          '16 lecciones de Python desde print("Hola, mundo") hasta un agregado de DDD con TDD. En cada paso ves qué se ejecuta primero, dónde vive cada variable en memoria y por qué.',
      },
      { property: "og:url", content: `${URL_SITIO}/aprende` },
    ],
    links: [{ rel: "canonical", href: `${URL_SITIO}/aprende` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          name: "Aprende a programar desde Hola mundo",
          description:
            "Python paso a paso: orden de ejecución, marcos, objetos en memoria, funciones, mutabilidad, clases, pruebas y DDD.",
          inLanguage: "es",
          isAccessibleForFree: true,
          provider: { "@type": "Organization", name: "benjacode", url: "https://benjacode.com" },
          hasPart: LECCIONES.map((l) => ({
            "@type": "LearningResource",
            name: l.titulo,
            position: l.orden,
            url: `${URL_SITIO}/aprende/${l.id}`,
          })),
        }),
      },
    ],
  }),
  component: IndiceRuta,
});

const FASES = [
  {
    signo: "t<0",
    color: "var(--t-antes)",
    titulo: "Antes de ejecutar",
    texto:
      "Lees el código y te comprometes con una predicción. Python, mientras tanto, compila el archivo: ninguna variable existe aún.",
  },
  {
    signo: "t=0",
    color: "var(--t-cero)",
    titulo: "Empieza",
    texto:
      "Python crea el marco global y ejecuta la primera línea. Es el punto de referencia de todo lo demás.",
  },
  {
    signo: "t>0",
    color: "var(--t-despues)",
    titulo: "Paso a paso y después",
    texto:
      "Ves la pila de marcos, los objetos en memoria y el orden de cada expresión. Al terminar repasas sin mirar, lo explicas y lo modificas.",
  },
];

function IndiceRuta() {
  const { progreso } = useProgreso();
  const dominadas = LECCIONES.filter((l) => progreso[l.id]?.dominada).length;
  const siguiente = LECCIONES.find((l) => !progreso[l.id]?.dominada) ?? LECCIONES[0]!;
  return (
    <main>
      <section className="relative mx-auto grid max-w-[1560px] gap-10 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
        <span
          aria-hidden="true"
          className="aurora aurora-1"
          style={{
            width: "520px",
            height: "520px",
            left: "-10%",
            top: "-20%",
            background: "color-mix(in oklab, var(--primary) 20%, transparent)",
            opacity: 0.5,
          }}
        />
        <div className="animate-float relative">
          <p className="mb-4 text-xs font-bold uppercase text-primary">
            La ruta · {LECCIONES.length} lecciones
          </p>
          <h1 className="font-display text-5xl font-bold leading-[1.02] sm:text-7xl">
            Desde <span className="sheen-text">Hola mundo</span>, viendo la memoria.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Cada lección es código Python real que se ejecuta paso a paso: qué línea va primero, en
            qué orden se evalúa cada parte, en qué marco vive cada nombre y a qué objeto apunta.
            Empieza con una línea y termina con un agregado de DDD protegido por pruebas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/aprende/$id"
              params={{ id: siguiente.id }}
              className="inline-flex h-12 items-center rounded-full bg-primary px-6 font-display font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              {dominadas === 0 ? "Empezar: Hola mundo" : `Continuar: ${siguiente.titulo}`}
            </Link>
          </div>
        </div>
        <div className="relative rounded-2xl border bg-card p-6 shadow-card">
          <p className="text-xs font-bold uppercase text-muted-foreground">Tu avance</p>
          <p className="mt-2 font-mono text-5xl font-bold">
            {dominadas}
            <span className="text-2xl text-muted-foreground">/{LECCIONES.length}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            lecciones dominadas (predicción hecha y repaso al 80%)
          </p>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="metric-fill h-full rounded-full bg-primary"
              style={{ width: `${(dominadas / LECCIONES.length) * 100}%` }}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="como" className="border-y bg-card py-14">
        <div className="mx-auto max-w-[1560px] px-5 sm:px-8">
          <h2 id="como" className="mb-6 font-display text-3xl font-bold">
            Cómo funciona cada lección
          </h2>
          <Reveal className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
            {FASES.map((f) => (
              <article key={f.signo} className="bg-card p-6 sm:p-8">
                <p className="font-mono text-2xl font-bold" style={{ color: f.color }}>
                  {f.signo}
                </p>
                <h3 className="mt-3 font-display text-xl font-bold">{f.titulo}</h3>
                <p className="mt-2 leading-7 text-muted-foreground">{f.texto}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section
        aria-labelledby="unidades"
        className="mx-auto max-w-[1560px] px-5 py-14 sm:px-8 sm:py-20"
      >
        <h2 id="unidades" className="sr-only">
          Unidades
        </h2>
        <div className="space-y-12">
          {UNIDADES.map((unidad, u) => (
            <div key={unidad}>
              <p className="mb-4 flex items-baseline gap-3">
                <span className="font-mono text-sm font-bold text-primary">Unidad {u + 1}</span>
                <span className="font-display text-2xl font-bold">{unidad}</span>
              </p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {LECCIONES.filter((l) => l.unidad === unidad).map((l) => {
                  const estado = progreso[l.id];
                  return (
                    <Link
                      key={l.id}
                      to="/aprende/$id"
                      params={{ id: l.id }}
                      className="group flex flex-col rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:border-primary/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`grid size-10 place-items-center rounded-full font-mono text-sm font-bold ${estado?.dominada ? "bg-success/20" : "bg-primary/10 text-primary"}`}
                        >
                          {l.orden}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">
                          {estado?.dominada
                            ? "dominada"
                            : estado?.prediccion !== undefined
                              ? "en curso"
                              : `${l.pasos} pasos`}
                        </span>
                      </div>
                      <h3 className="mt-4 font-display text-lg font-bold leading-tight group-hover:text-primary">
                        {l.titulo}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{l.concepto}</p>
                      <code className="mt-4 line-clamp-2 rounded-md bg-muted px-2 py-1.5 font-mono text-[11px] text-muted-foreground">
                        {l.codigo.split("\n")[0]}
                      </code>
                      <p className="mt-4 flex flex-wrap gap-1.5">
                        {l.metodologias.map((u) => (
                          <span
                            key={u.metodologia}
                            className="rounded-full border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
                          >
                            {metodoPorId(u.metodologia)?.nombre.split(" (")[0]?.split(":")[0]}
                          </span>
                        ))}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
