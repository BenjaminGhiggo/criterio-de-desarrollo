import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SignoFase } from "@/components/criterio";
import { Codigo, Opcion, Retro } from "@/components/demos/kit";
import { EditorPython } from "@/components/editor-python";
import { Visualizador } from "@/components/visualizador";
import { metodoPorId } from "@/lib/datos";
import { useProgreso } from "@/lib/progreso";
import { LECCIONES, cargarTraza, leccionPorId, type Pregunta, type Traza } from "@/lib/ruta";

const URL_SITIO = "https://criterio.benjacode.com";

export const Route = createFileRoute("/aprende/$id")({
  loader: async ({ params }) => {
    const leccion = leccionPorId(params.id);
    if (!leccion) throw notFound();
    return { id: leccion.id, traza: await cargarTraza(leccion.id) };
  },
  head: ({ params }) => {
    const l = leccionPorId(params.id);
    if (!l) return { meta: [{ title: "Lección no encontrada — Criterio" }] };
    const url = `${URL_SITIO}/aprende/${l.id}`;
    return {
      meta: [
        { title: `${l.orden}. ${l.titulo} — Aprende Python paso a paso · Criterio` },
        {
          name: "description",
          content: `${l.objetivo} Ejecución paso a paso de Python: qué se ejecuta primero y dónde vive cada variable en memoria.`,
        },
        { property: "og:title", content: `${l.titulo} — Aprende Python paso a paso` },
        { property: "og:description", content: l.objetivo },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LearningResource",
            name: l.titulo,
            description: l.objetivo,
            teaches: l.concepto,
            inLanguage: "es",
            learningResourceType: "Lección interactiva",
            programmingLanguage: "Python",
            position: l.orden,
            isPartOf: {
              "@type": "Course",
              name: "Aprende a programar desde Hola mundo",
              url: `${URL_SITIO}/aprende`,
            },
            url,
          }),
        },
      ],
    };
  },
  component: PaginaLeccion,
});

// Opciones como "['pan']", "6 5" o "carrito=None" se muestran como código.
const pareceCodigo = (o: string) =>
  /^[[('"\d-]/.test(o) || /^[a-z_]+[.(=]/.test(o) || /^[a-z]+_[a-z_\d]+$/.test(o);

function PreguntaInteractiva({
  p,
  elegida,
  onElegir,
  mostrar,
}: {
  p: Pregunta;
  elegida: number | null | undefined;
  onElegir: (i: number) => void;
  mostrar: boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-3 font-display text-lg font-bold leading-snug">{p.pregunta}</legend>
      <div className="grid gap-2">
        {p.opciones.map((o, i) => (
          <Opcion
            key={o}
            activa={elegida === i}
            estado={
              mostrar && elegida !== undefined && elegida !== null
                ? i === p.correcta
                  ? "bien"
                  : elegida === i
                    ? "mal"
                    : null
                : null
            }
            onClick={() => onElegir(i)}
          >
            <span className={pareceCodigo(o) ? "font-mono text-sm" : ""}>{o}</span>
          </Opcion>
        ))}
      </div>
      {mostrar && elegida !== undefined && elegida !== null && (
        <div className="mt-3">
          <Retro
            tipo={elegida === p.correcta ? "bien" : "mal"}
            titulo={elegida === p.correcta ? "Correcto" : "No era esa"}
          >
            {p.porque}
          </Retro>
        </div>
      )}
    </fieldset>
  );
}

function PaginaLeccion() {
  const { id, traza: trazaLeccion } = Route.useLoaderData();
  const leccion = leccionPorId(id)!;
  const { progreso, actualizar } = useProgreso();
  const p = progreso[id] ?? {};
  const [revelar, setRevelar] = useState(false);
  const [modo, setModo] = useState<"leccion" | "propia">("leccion");
  const [trazaPropia, setTrazaPropia] = useState<Traza | null>(null);
  const [version, setVersion] = useState(0);
  const repaso = p.repaso ?? leccion.repaso.map(() => null);
  const aciertos = repaso.filter((r, i) => r === leccion.repaso[i]!.correcta).length;
  const necesarios = Math.ceil(leccion.repaso.length * 0.8);
  const puedeDominar = p.prediccion !== undefined && aciertos >= necesarios;
  const indice = LECCIONES.findIndex((l) => l.id === id);
  const anterior = LECCIONES[indice - 1];
  const siguiente = LECCIONES[indice + 1];
  const traza = modo === "propia" && trazaPropia ? trazaPropia : trazaLeccion;

  return (
    <main>
      <section className="relative mx-auto max-w-[1560px] px-5 pb-10 pt-6 sm:px-8">
        <span
          aria-hidden="true"
          className="aurora aurora-1"
          style={{
            width: "460px",
            height: "460px",
            left: "-10%",
            top: "-30%",
            background: "color-mix(in oklab, var(--primary) 16%, transparent)",
            opacity: 0.5,
          }}
        />
        <nav aria-label="Ruta" className="relative mb-6 text-sm text-muted-foreground">
          <Link to="/aprende" className="hover:text-primary">
            Ruta
          </Link>
          <span className="mx-2">/</span>
          <span>{leccion.unidad}</span>
        </nav>
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div className="animate-float">
            <p className="text-xs font-bold uppercase text-primary">
              Lección {leccion.orden} de {LECCIONES.length} · {leccion.concepto}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
              {leccion.titulo}
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-muted-foreground">
              {leccion.objetivo}
            </p>
          </div>
          <ol className="flex flex-wrap gap-1.5" aria-label="Lecciones de la ruta">
            {LECCIONES.map((l) => (
              <li key={l.id}>
                <Link
                  to="/aprende/$id"
                  params={{ id: l.id }}
                  title={`${l.orden}. ${l.titulo}`}
                  className={`grid size-9 place-items-center rounded-full border font-mono text-xs font-bold transition-colors ${
                    l.id === id
                      ? "border-primary bg-primary text-primary-foreground"
                      : progreso[l.id]?.dominada
                        ? "border-success/40 bg-success/15"
                        : "bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {l.orden}
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {leccion.metodologias.map((u) => {
            const m = metodoPorId(u.metodologia);
            return (
              <Link
                key={u.metodologia}
                to="/metodos/$id"
                params={{ id: u.metodologia }}
                className="rounded-2xl border bg-card p-4 shadow-card transition-colors hover:border-primary/40"
              >
                <p className="text-[11px] font-bold uppercase text-primary">
                  Metodología · {m?.familia}
                </p>
                <p className="mt-1 font-display font-bold">{m?.nombre}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{u.como}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="antes" className="border-y bg-card py-12 sm:py-16">
        <div className="mx-auto grid max-w-[1560px] gap-8 px-5 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="flex items-center gap-3 text-xs font-bold uppercase text-muted-foreground">
              <SignoFase fase="t<0" className="text-sm" /> Antes de ejecutar
            </p>
            <h2 id="antes" className="mt-2 font-display text-3xl font-bold">
              Lee el código y comprométete con una predicción
            </h2>
            <p className="mt-3 text-muted-foreground">
              Mientras tanto, Python ya hizo su parte de t&lt;0: leyó y compiló el archivo completo.
              Ninguna variable existe todavía.
            </p>
            <div className="mt-5">
              <Codigo titulo="programa.py" codigo={leccion.codigo} />
            </div>
          </div>
          <div className="rounded-2xl border bg-background p-5 shadow-card sm:p-7">
            <PreguntaInteractiva
              p={leccion.prediccion}
              elegida={p.prediccion}
              onElegir={(i) => {
                actualizar(id, { prediccion: i });
                setRevelar(false);
              }}
              mostrar={revelar}
            />
            {p.prediccion !== undefined && !revelar && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  Predicción guardada. Ejecútalo paso a paso abajo y compruébalo.
                </p>
                <button
                  type="button"
                  onClick={() => setRevelar(true)}
                  className="h-10 rounded-full border bg-card px-4 text-sm font-semibold hover:border-primary/40"
                >
                  Ver si acerté
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        id="ejecucion"
        aria-labelledby="durante"
        className="mx-auto max-w-[1560px] scroll-mt-6 px-5 py-12 sm:px-8 sm:py-16"
      >
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="flex items-center gap-3 text-xs font-bold uppercase text-muted-foreground">
              <SignoFase fase="t=0" className="text-sm" />{" "}
              <SignoFase fase="t>0" className="text-sm" /> Ejecución paso a paso
            </p>
            <h2 id="durante" className="mt-2 font-display text-3xl font-bold">
              Qué se ejecuta primero y dónde vive cada variable
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Avanza con Siguiente paso o las flechas del teclado. Pasa el mouse por una variable
              para ver a qué objeto apunta.
            </p>
          </div>
          <div
            className="flex rounded-full bg-muted p-1"
            role="tablist"
            aria-label="Qué código ver"
          >
            {(
              [
                ["leccion", "Código de la lección"],
                ["propia", "Tu versión"],
              ] as const
            ).map(([clave, texto]) => (
              <button
                key={clave}
                type="button"
                role="tab"
                aria-selected={modo === clave}
                onClick={() => setModo(clave)}
                className={`h-10 rounded-full px-4 text-sm font-semibold ${modo === clave ? "bg-card text-primary shadow-card" : "text-muted-foreground"}`}
              >
                {texto}
              </button>
            ))}
          </div>
        </div>
        {modo === "propia" && (
          <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <EditorPython
              inicial={leccion.codigo}
              onTraza={(t) => {
                setTrazaPropia(t);
                setVersion((v) => v + 1);
              }}
            />
            <div className="rounded-2xl border bg-card p-5 shadow-card">
              <p className="text-xs font-bold uppercase text-primary">
                Reto (PRIMM: modificar y crear)
              </p>
              <p className="mt-2 leading-7">{leccion.reto}</p>
              {!trazaPropia && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Edita el código y ejecútalo: el paso a paso de abajo mostrará tu versión.
                </p>
              )}
            </div>
          </div>
        )}
        <Visualizador
          key={modo === "propia" && trazaPropia ? `propia-${version}` : "leccion"}
          traza={traza}
        />
      </section>

      <section className="mx-auto max-w-[1560px] px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-panel p-7 text-panel-foreground shadow-soft sm:p-10">
          <div className="live-scan" aria-hidden="true" />
          <p className="text-xs font-bold uppercase text-accent">Idea clave</p>
          <p className="relative mt-3 max-w-4xl font-display text-xl font-semibold leading-relaxed sm:text-2xl">
            {leccion.idea_clave}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="despues"
        className="mx-auto grid max-w-[1560px] gap-6 px-5 py-12 sm:px-8 sm:py-16 xl:grid-cols-[1.2fr_.8fr]"
      >
        <div className="rounded-2xl border bg-card p-5 shadow-card sm:p-7">
          <p className="flex items-center gap-3 text-xs font-bold uppercase text-muted-foreground">
            <SignoFase fase="t>0" className="text-sm" /> Después: repaso sin mirar
          </p>
          <h2 id="despues" className="mt-2 font-display text-3xl font-bold">
            Recupera de memoria
          </h2>
          <p className="mt-2 text-muted-foreground">
            Responde sin volver al paso a paso. Para dominar la lección necesitas {necesarios} de{" "}
            {leccion.repaso.length}.
          </p>
          <div className="mt-6 space-y-7">
            {leccion.repaso.map((q, k) => (
              <PreguntaInteractiva
                key={q.pregunta}
                p={q}
                elegida={repaso[k]}
                onElegir={(v) =>
                  actualizar(id, { repaso: repaso.map((r, j) => (j === k ? v : r)) })
                }
                mostrar
              />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5 shadow-card sm:p-7">
            <p className="text-xs font-bold uppercase text-primary">
              Explícalo con tus palabras (Feynman)
            </p>
            <label htmlFor="explica" className="mt-2 block font-display text-lg font-bold">
              {leccion.explica}
            </label>
            <textarea
              id="explica"
              value={p.explicacion ?? ""}
              onChange={(e) => actualizar(id, { explicacion: e.target.value })}
              rows={5}
              className="mt-3 w-full rounded-2xl border bg-background p-3 leading-7"
              placeholder="Sin jerga, como si se lo explicaras a alguien que empieza."
            />
          </div>
          <div className="rounded-2xl bg-panel p-6 text-panel-foreground shadow-card sm:p-7">
            <p className="text-xs font-bold uppercase text-accent">Dominio de la lección</p>
            <p className="mt-2 font-display text-2xl font-bold">
              {p.dominada ? "Dominada" : puedeDominar ? "Lista para marcar" : "Aún no"}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-panel-foreground/75">
              <li>
                {p.prediccion !== undefined ? "Hiciste tu predicción" : "Falta la predicción (t<0)"}
              </li>
              <li>
                Repaso: {aciertos} de {leccion.repaso.length} (se necesitan {necesarios})
              </li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!puedeDominar}
                onClick={() => actualizar(id, { dominada: !p.dominada })}
                className="h-11 rounded-full bg-accent px-5 font-display text-sm font-semibold text-accent-foreground disabled:opacity-40"
              >
                {p.dominada ? "Quitar marca" : "Marcar como dominada"}
              </button>
              {siguiente && (
                <Link
                  to="/aprende/$id"
                  params={{ id: siguiente.id }}
                  className="inline-flex h-11 items-center rounded-full border border-panel-foreground/25 px-5 font-display text-sm font-semibold hover:border-accent"
                >
                  Siguiente: {siguiente.titulo}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <nav
        aria-label="Otras lecciones"
        className="mx-auto grid max-w-[1560px] gap-4 px-5 pb-20 sm:grid-cols-2 sm:px-8"
      >
        {anterior ? (
          <Link
            to="/aprende/$id"
            params={{ id: anterior.id }}
            className="rounded-2xl border bg-card p-5 hover:border-primary/40"
          >
            <span className="text-xs font-bold uppercase text-muted-foreground">
              Anterior · {anterior.orden}
            </span>
            <span className="mt-1 block font-display text-lg font-bold">{anterior.titulo}</span>
          </Link>
        ) : (
          <span />
        )}
        {siguiente && (
          <Link
            to="/aprende/$id"
            params={{ id: siguiente.id }}
            className="rounded-2xl border bg-card p-5 text-right hover:border-primary/40"
          >
            <span className="text-xs font-bold uppercase text-muted-foreground">
              Siguiente · {siguiente.orden}
            </span>
            <span className="mt-1 block font-display text-lg font-bold">{siguiente.titulo}</span>
          </Link>
        )}
      </nav>
    </main>
  );
}
