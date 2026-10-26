import { useEffect, useMemo, useState } from "react";
import { DATOS, signoT } from "@/lib/datos";
import { guardarLocal, leerLocal } from "@/lib/preferencias";
import { Accion, BotonCopiar, Codigo, Nota, Opcion, Pasos, Pregunta, Retro, mezclar } from "./kit";

// ── Cinco porqués ────────────────────────────────────────────────────────

const CADENA = [
  {
    pregunta: "Usamos un Repositorio para los pedidos. ¿Por qué?",
    opciones: [
      {
        texto: "Porque es una buena práctica.",
        bien: false,
        nota: "¿Buena según quién y para qué? Eso es costumbre, todavía no es una razón.",
      },
      { texto: "Para que el dominio no dependa de la base de datos.", bien: true, nota: "" },
      {
        texto: "Porque el framework lo genera solo.",
        bien: false,
        nota: "Eso explica cómo apareció, no por qué conviene.",
      },
    ],
  },
  {
    pregunta: "¿Por qué importa que el dominio no dependa de la base de datos?",
    opciones: [
      {
        texto: "Porque SQL es lento.",
        bien: false,
        nota: "La velocidad de SQL no cambia con un repositorio. Busca qué ganas tú.",
      },
      {
        texto: "Porque lo dice el libro de Evans.",
        bien: false,
        nota: "Un argumento de autoridad no te ayuda a decidir cuando el libro no está.",
      },
      {
        texto: "Para probar las reglas del pedido sin levantar una base de datos.",
        bien: true,
        nota: "",
      },
    ],
  },
  {
    pregunta: "¿Por qué importa probar las reglas sin base de datos?",
    opciones: [
      {
        texto: "Porque las pruebas rápidas corren en cada cambio y detectan errores en minutos.",
        bien: true,
        nota: "",
      },
      {
        texto: "Para subir la cobertura.",
        bien: false,
        nota: "La cobertura es una métrica, no un fin. ¿Qué te da?",
      },
      {
        texto: "Porque las bases de datos se caen.",
        bien: false,
        nota: "Cierto, pero no es lo que el repositorio resuelve.",
      },
    ],
  },
  {
    pregunta: "¿Por qué importa detectar errores en minutos?",
    opciones: [
      {
        texto: "Porque las pruebas lentas aburren.",
        bien: false,
        nota: "Es real, pero el negocio no paga por tu aburrimiento. Sigue.",
      },
      {
        texto:
          "Porque un error de facturación en producción cuesta dinero y la confianza del cliente.",
        bien: true,
        nota: "",
      },
      {
        texto: "Para terminar antes el viernes.",
        bien: false,
        nota: "Cerca. ¿Y por qué al negocio le importa?",
      },
    ],
  },
];

export function DemoCincoPorques() {
  const [nivel, setNivel] = useState(0);
  const [cadena, setCadena] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const actual = CADENA[nivel];
  return (
    <div className="space-y-5">
      <ol className="space-y-2">
        <li className="rounded-2xl bg-panel p-4 font-semibold text-panel-foreground">
          Decisión: usamos un Repositorio para los pedidos
        </li>
        {cadena.map((c, i) => (
          <li
            key={c}
            className="aparecer ml-4 border-l-2 border-primary pl-4"
            style={{ marginLeft: `${(i + 1) * 12}px` }}
          >
            <span className="font-mono text-xs font-bold text-primary">porque {i + 1}</span>
            <p className="font-semibold">{c}</p>
          </li>
        ))}
      </ol>
      {actual ? (
        <>
          <Pregunta>{actual.pregunta}</Pregunta>
          <div className="grid gap-2">
            {mezclar(actual.opciones, nivel + 3).map((o) => (
              <Opcion
                key={o.texto}
                onClick={() => {
                  if (o.bien) {
                    setCadena([...cadena, o.texto]);
                    setNivel(nivel + 1);
                    setError(null);
                  } else setError(o.nota);
                }}
              >
                {o.texto}
              </Opcion>
            ))}
          </div>
          {error && (
            <Retro tipo="mal" titulo="Esa respuesta no sostiene la cadena">
              {error}
            </Retro>
          )}
        </>
      ) : (
        <>
          <Retro tipo="bien" titulo="Llegaste a una fuerza del negocio: dinero y confianza">
            Ahora puedes defender el Repositorio ante quien proponga usar el ORM directo, y también
            saber cuándo no hace falta: si no hay reglas que probar, la cadena se rompe en el
            segundo porqué.
          </Retro>
          <Accion
            secundaria
            onClick={() => {
              setNivel(0);
              setCadena([]);
            }}
          >
            Empezar otra cadena
          </Accion>
        </>
      )}
    </div>
  );
}

// ── Pre-mortem y post-mortem (usa las lecciones del dominio) ─────────────

export function DemoPremortem() {
  const [id, setId] = useState(DATOS.lecciones[0]!.id);
  const leccion = DATOS.lecciones.find((l) => l.id === id)!;
  const [paso, setPaso] = useState(0);
  const [riesgos, setRiesgos] = useState<string[]>([]);
  const [camino, setCamino] = useState<string | null>(null);
  const [t, setT] = useState(1);
  const posibles = useMemo(() => {
    const todas = leccion.caminos.flatMap((c) =>
      c.trayectoria
        .at(-1)!
        .consecuencias.filter((q) => q.impacto < 0)
        .map((q) => q.descripcion),
    );
    return mezclar([...new Set(todas)], leccion.id.length);
  }, [leccion]);
  const elegido = leccion.caminos.find((c) => c.clave === camino);
  const negativosElegido = elegido
    ? elegido.trayectoria
        .at(-1)!
        .consecuencias.filter((q) => q.impacto < 0)
        .map((q) => q.descripcion)
    : [];
  const anticipados = negativosElegido.filter((n) => riesgos.includes(n)).length;
  const reiniciar = (nuevo: string) => {
    setId(nuevo);
    setPaso(0);
    setRiesgos([]);
    setCamino(null);
    setT(1);
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {DATOS.lecciones.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => reiniciar(l.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${l.id === id ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
          >
            {l.titulo}
          </button>
        ))}
      </div>
      <Pasos
        actual={paso}
        pasos={[
          { t: "t=-1", nombre: "Pre-mortem" },
          { t: "t=0", nombre: "Decidir" },
          { t: "t>0", nombre: "Post-mortem" },
        ]}
      />
      <div className="rounded-2xl border bg-card p-5">
        <p className="text-xs font-bold uppercase text-primary">{leccion.concepto}</p>
        <p className="mt-1 font-display text-xl font-bold">{leccion.pregunta}</p>
        <p className="mt-2 text-muted-foreground">{leccion.contexto}</p>
      </div>
      {paso === 0 && (
        <>
          <Pregunta>
            Imagina que es t=+5 y la decisión fue un desastre. ¿Qué pudo haber pasado?
          </Pregunta>
          <div className="grid gap-2 sm:grid-cols-2">
            {posibles.map((p) => (
              <Opcion
                key={p}
                activa={riesgos.includes(p)}
                onClick={() =>
                  setRiesgos(riesgos.includes(p) ? riesgos.filter((r) => r !== p) : [...riesgos, p])
                }
              >
                {p}
              </Opcion>
            ))}
          </div>
          <Accion disabled={riesgos.length === 0} onClick={() => setPaso(1)}>
            Guardar mi pre-mortem ({riesgos.length})
          </Accion>
        </>
      )}
      {paso === 1 && (
        <>
          <Pregunta>Con esos riesgos en mente, decide en t=0:</Pregunta>
          <div className="grid gap-3 md:grid-cols-3">
            {leccion.caminos.map((c) => (
              <Opcion key={c.clave} activa={camino === c.clave} onClick={() => setCamino(c.clave)}>
                <span className="block font-semibold">{c.titulo}</span>
                <code className="mt-2 block whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                  {c.codigo.split("\n").slice(0, 3).join("\n")}
                </code>
              </Opcion>
            ))}
          </div>
          <Accion disabled={!camino} onClick={() => setPaso(2)}>
            Decidir y avanzar en el tiempo
          </Accion>
        </>
      )}
      {paso === 2 && elegido && (
        <>
          <div className="flex items-center gap-4">
            <span className="font-mono text-2xl font-bold text-despues">t={signoT(t)}</span>
            <input
              type="range"
              className="rango"
              min={1}
              max={leccion.t_final}
              value={t}
              onChange={(e) => setT(Number(e.target.value))}
              aria-label="Instante t después de decidir"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {leccion.caminos.map((c) => {
              const p = c.trayectoria.find((x) => x.t === t)!;
              return (
                <div
                  key={c.clave}
                  className={`rounded-2xl border p-4 ${c.clave === camino ? "border-primary bg-primary/5" : "bg-card opacity-80"}`}
                >
                  <p className="text-xs font-bold uppercase text-muted-foreground">
                    {c.clave === camino ? "Tu camino" : "Lo que no elegiste"}
                  </p>
                  <p className="font-display font-bold">{c.titulo}</p>
                  <p className="mt-1 font-mono text-sm">
                    balance {p.balance > 0 ? "+" : ""}
                    {p.balance} · {p.estado}
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {p.consecuencias.map((q) => (
                      <li key={q.descripcion}>
                        <span
                          className={`mr-1 font-mono font-bold ${q.impacto > 0 ? "text-success" : q.impacto < 0 ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {q.impacto > 0 ? "+1" : q.impacto < 0 ? "−1" : "0"}
                        </span>
                        t={signoT(q.t)} {q.descripcion}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          {t === leccion.t_final && (
            <Retro
              tipo="info"
              titulo={`Tu pre-mortem anticipó ${anticipados} de ${negativosElegido.length} problemas de tu camino`}
            >
              {leccion.explicacion}
            </Retro>
          )}
          {t < leccion.t_final && (
            <Nota>Avanza hasta t=+{leccion.t_final} para cerrar el post-mortem.</Nota>
          )}
        </>
      )}
    </div>
  );
}

// ── Casos con protagonista ───────────────────────────────────────────────

type Capitulo = {
  t: string;
  texto: string;
  opciones?: { texto: string; va: string }[];
  balance?: number;
};

const HISTORIA: Record<string, Capitulo> = {
  inicio: {
    t: "t=-1",
    texto:
      "Ana entra a un equipo que mantiene la facturación de una cadena de farmacias. No hay pruebas y cada viernes se despliega con miedo. Le piden descuentos por campaña para el lunes. Tiene tres días.",
    opciones: [
      { texto: "Agrega el descuento directo en la función facturar(), con un if.", va: "a" },
      {
        texto:
          "Escribe primero pruebas de caracterización de la facturación actual y luego el descuento con TDD.",
        va: "b",
      },
    ],
  },
  a: {
    t: "t=+3",
    texto:
      "El lunes funciona. El miércoles un cliente reclama: el descuento se aplicó dos veces en compras con receta. Nadie sabía que existía ese camino en el código.",
    opciones: [
      { texto: "Agrega otro if para las compras con receta.", va: "a1" },
      {
        texto:
          "Extrae un Value Object Descuento con sus pruebas y caracteriza el flujo de recetas.",
        va: "a2",
      },
    ],
  },
  b: {
    t: "t=+3",
    texto:
      "Entrega el martes, un día tarde. Las pruebas de caracterización revelaron el caso de compras con receta antes de tocar nada. Ahora el negocio pide un segundo tipo de descuento.",
    opciones: [
      { texto: "Agrega una prueba roja y la regla mínima que la pasa.", va: "b1" },
      { texto: "Reescribe todo con un motor de reglas genérico para el futuro.", va: "b2" },
    ],
  },
  a1: {
    t: "t=+8",
    balance: -2,
    texto:
      "Tercer incidente del mes. El equipo propone congelar cambios. Ana aprendió a parchar, no a diseñar: cada if nuevo choca con uno viejo que nadie ve.",
  },
  a2: {
    t: "t=+8",
    balance: 0,
    texto:
      "Tarde, pero el Value Object frena los siguientes errores. Ana aprendió que el costo de no probar se paga después, con intereses.",
  },
  b1: {
    t: "t=+8",
    balance: 2,
    texto:
      "La segunda regla tomó una hora. El equipo adopta las pruebas de caracterización y los viernes dejan de dar miedo.",
  },
  b2: {
    t: "t=+8",
    balance: -1,
    texto:
      "El motor genérico tarda tres semanas y nadie más lo entiende. Sobrediseño: resolvió problemas que nadie tenía todavía.",
  },
};

export function DemoCasos() {
  const [ruta, setRuta] = useState<string[]>(["inicio"]);
  const [reflexion, setReflexion] = useState("");
  const actual = HISTORIA[ruta.at(-1)!]!;
  const final = !actual.opciones;
  return (
    <div className="space-y-4">
      {ruta.map((id, i) => {
        const c = HISTORIA[id]!;
        return (
          <article
            key={id}
            className={`aparecer rounded-2xl p-5 ${i === ruta.length - 1 ? "bg-panel text-panel-foreground shadow-card" : "border bg-card text-muted-foreground"}`}
          >
            <p
              className={`font-mono text-xs font-bold ${i === ruta.length - 1 ? "text-accent" : ""}`}
            >
              Capítulo {i + 1} · {c.t}
            </p>
            <p className="mt-2 leading-7">{c.texto}</p>
          </article>
        );
      })}
      {actual.opciones && (
        <>
          <Pregunta>¿Qué hace Ana?</Pregunta>
          <div className="grid gap-2">
            {actual.opciones.map((o) => (
              <Opcion key={o.va} onClick={() => setRuta([...ruta, o.va])}>
                {o.texto}
              </Opcion>
            ))}
          </div>
        </>
      )}
      {final && (
        <>
          <Retro
            tipo={(actual.balance ?? 0) > 0 ? "bien" : (actual.balance ?? 0) < 0 ? "mal" : "info"}
            titulo={`Final con balance ${(actual.balance ?? 0) > 0 ? "+" : ""}${actual.balance}`}
          >
            Hay cuatro finales. Los otros tres son el contrafactual: lo que habría pasado con otras
            decisiones.
          </Retro>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["a1", "a2", "b1", "b2"] as const)
              .filter((k) => k !== ruta.at(-1))
              .map((k) => (
                <p key={k} className="rounded-2xl border bg-card p-3 text-sm">
                  <span className="font-mono font-bold">
                    balance {HISTORIA[k]!.balance! > 0 ? "+" : ""}
                    {HISTORIA[k]!.balance}
                  </span>{" "}
                  · {HISTORIA[k]!.texto}
                </p>
              ))}
          </div>
          <label
            className="block text-xs font-bold uppercase text-muted-foreground"
            htmlFor="reflexion-caso"
          >
            t=+12 · ¿Qué harías distinto que Ana?
          </label>
          <textarea
            id="reflexion-caso"
            value={reflexion}
            onChange={(e) => setReflexion(e.target.value)}
            rows={3}
            className="w-full rounded-2xl border bg-card p-3"
          />
          <Accion secundaria onClick={() => setRuta(["inicio"])}>
            Vivir otra historia
          </Accion>
        </>
      )}
    </div>
  );
}

// ── Diario de decisiones (ADR) ───────────────────────────────────────────

type Adr = {
  titulo: string;
  contexto: string;
  fuerzas: string;
  alternativas: string;
  decision: string;
  consecuencias: string;
};

const EJEMPLO_ADR: Adr = {
  titulo: "Repositorio como puerto para Pedidos",
  contexto:
    "Las reglas del pedido (límite de crédito, no confirmar vacío) se prueban hoy con una base levantada; cada prueba tarda 2 s.",
  fuerzas:
    "Probar reglas rápido; poder leer pedidos de una API externa el próximo trimestre; el equipo conoce bien el ORM.",
  alternativas: "Usar el modelo del ORM como entidad de dominio.",
  decision:
    "Declarar RepositorioDePedidos como Protocol en el dominio, con adaptador en memoria para pruebas y otro para PostgreSQL.",
  consecuencias:
    "Una interfaz y un adaptador más que mantener. Pruebas de dominio en milisegundos. La API externa será otro adaptador.",
};

function aMarkdown(a: Adr, fecha: string) {
  return `# ${a.titulo}

Fecha: ${fecha}
Estado: aceptada

## Contexto (t<0)
${a.contexto}

## Fuerzas
${a.fuerzas}

## Alternativas consideradas
${a.alternativas}

## Decisión (t=0)
${a.decision}

## Consecuencias esperadas (t>0)
${a.consecuencias}

## Revisiones
- t=+7: ¿qué pasó realmente?
- t=+21: ¿la volverías a tomar?
`;
}

export function DemoAdr() {
  const [adr, setAdr] = useState<Adr>(EJEMPLO_ADR);
  const [hoy, setHoy] = useState<Date | null>(null);
  useEffect(() => {
    setAdr(leerLocal("adr", EJEMPLO_ADR));
    setHoy(new Date());
  }, []);
  const cambiar = (campo: keyof Adr, valor: string) => {
    const nuevo = { ...adr, [campo]: valor };
    setAdr(nuevo);
    guardarLocal("adr", nuevo);
  };
  const fecha = (dias: number) =>
    hoy ? new Date(hoy.getTime() + dias * 86400000).toISOString().slice(0, 10) : "";
  const md = aMarkdown(adr, fecha(0));
  const descargar = () => {
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      adr.titulo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "decision"
    }.md`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const campos: { clave: keyof Adr; etiqueta: string; t: string }[] = [
    { clave: "titulo", etiqueta: "Título", t: "" },
    { clave: "contexto", etiqueta: "Contexto", t: "t<0" },
    { clave: "fuerzas", etiqueta: "Fuerzas", t: "t<0" },
    { clave: "alternativas", etiqueta: "Alternativas descartadas", t: "t<0" },
    { clave: "decision", etiqueta: "Decisión", t: "t=0" },
    { clave: "consecuencias", etiqueta: "Consecuencias esperadas", t: "t>0" },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        {campos.map((c) => (
          <label key={c.clave} className="block">
            <span className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
              {c.etiqueta}
              <span className="font-mono">{c.t}</span>
            </span>
            {c.clave === "titulo" ? (
              <input
                value={adr[c.clave]}
                onChange={(e) => cambiar(c.clave, e.target.value)}
                className="mt-1 h-11 w-full rounded-2xl border bg-card px-3"
              />
            ) : (
              <textarea
                value={adr[c.clave]}
                onChange={(e) => cambiar(c.clave, e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-2xl border bg-card p-3 text-sm"
              />
            )}
          </label>
        ))}
      </div>
      <div className="space-y-3">
        <Codigo titulo="docs/decisiones/0001.md" codigo={md} />
        <div className="flex flex-wrap gap-3">
          <Accion onClick={descargar}>Descargar .md</Accion>
          <BotonCopiar texto={md} />
        </div>
        {hoy && (
          <Nota>
            Revisa este ADR el {fecha(7)} (t=+7) y el {fecha(21)} (t=+21). Sin la revisión, el
            diario es burocracia; con ella, es criterio.
          </Nota>
        )}
      </div>
    </div>
  );
}
