import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { COLOR_FASE, signoT } from "@/lib/datos";
import { faseDe } from "@/domain/conocimiento";
import type { Memoria, Objeto, Paso, Traza } from "@/lib/ruta";

// ── Utilidades ───────────────────────────────────────────────────────────

const indice = (m: Memoria) => new Map(m.objetos.map((o) => [o.ref, o]));

function contenido(o: Objeto | undefined) {
  if (!o) return "";
  return JSON.stringify([o.valor, o.elementos, o.pares, o.atributos]);
}

function nombreMarco(nombre: string) {
  if (nombre === "global") return "Marco global";
  if (nombre.startsWith("clase ")) return `Cuerpo de la ${nombre}`;
  return `Marco de ${nombre}()`;
}

function etiquetaFase(paso: Paso) {
  if (paso.tipo === "compilacion") return "Python lee y compila el archivo";
  if (paso.t === 0) return "Empieza la ejecución";
  if (paso.tipo === "call") return `Llamada: entra a ${paso.funcion}`;
  if (paso.tipo === "return") return `Retorno: sale de ${paso.funcion}`;
  if (paso.tipo === "exception") return "Excepción";
  if (paso.tipo === "fin") return "Fin del programa";
  return `Paso ${paso.t}`;
}

const COLOR_TIPO: Record<Paso["tipo"], string> = {
  compilacion: "var(--t-antes)",
  line: "var(--primary)",
  call: "var(--ds-accent)",
  return: "var(--t-cero)",
  exception: "var(--destructive)",
  fin: "var(--success)",
};

// ── Código con marcadores ───────────────────────────────────────────────

function CodigoConLineas({
  codigo,
  paso,
  errorLinea,
}: {
  codigo: string;
  paso: Paso;
  errorLinea?: number | null;
}) {
  const lineas = codigo.split("\n");
  return (
    <div className="overflow-hidden rounded-2xl bg-panel text-panel-foreground shadow-card">
      <div className="flex items-center justify-between border-b border-panel-foreground/10 px-4 py-2.5 font-mono text-[11px] text-panel-foreground/60">
        <span>programa.py</span>
        <span className="flex gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-primary/70" />
            recién ejecutada
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-accent" />
            siguiente
          </span>
        </span>
      </div>
      <pre className="codigo overflow-x-auto py-3">
        {lineas.map((l, i) => {
          const n = i + 1;
          const ejecutada = paso.ejecutada === n;
          const siguiente = paso.siguiente === n && paso.tipo !== "compilacion";
          const error = errorLinea === n;
          const fondo = error
            ? "bg-destructive/30"
            : siguiente
              ? "bg-accent/20"
              : ejecutada
                ? "bg-primary/25"
                : "";
          const borde = error
            ? "border-destructive"
            : siguiente
              ? "border-accent"
              : ejecutada
                ? "border-primary"
                : "border-transparent";
          return (
            <span
              key={i}
              className={`flex border-l-4 px-3 transition-colors duration-300 ${fondo} ${borde}`}
            >
              <span className="mr-4 inline-block w-5 shrink-0 select-none text-right text-panel-foreground/35">
                {n}
              </span>
              <span className="whitespace-pre">{l || " "}</span>
              {siguiente && (
                <span className="ml-auto pl-4 font-sans text-[10px] font-bold uppercase text-accent">
                  siguiente
                </span>
              )}
              {ejecutada && !siguiente && (
                <span className="ml-auto pl-4 font-sans text-[10px] font-bold uppercase text-panel-foreground/60">
                  recién
                </span>
              )}
            </span>
          );
        })}
      </pre>
    </div>
  );
}

// ── Memoria: pila de marcos y montón de objetos con flechas ─────────────

function CuerpoObjeto({ o, objetos }: { o: Objeto; objetos: Map<string, Objeto> }) {
  const destino = (ref: string) => objetos.get(ref)?.valor ?? "…";
  if (o.elementos) {
    return (
      <div className="mt-2 flex flex-wrap gap-1">
        {o.elementos.length === 0 && (
          <span className="font-mono text-xs text-muted-foreground">vacía</span>
        )}
        {o.elementos.map((ref, i) => (
          <span
            key={i}
            className="rounded-md border bg-background px-2 py-1 text-center"
            title={`[${i}] apunta a ${ref}`}
          >
            <span className="block font-mono text-[9px] text-muted-foreground">
              [{i}] {ref}
            </span>
            <span className="block font-mono text-xs font-bold">{destino(ref)}</span>
          </span>
        ))}
      </div>
    );
  }
  if (o.pares) {
    return (
      <div className="mt-2 space-y-1">
        {o.pares.map(([k, v]) => (
          <p
            key={k}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-md border bg-background px-2 py-1 font-mono text-xs"
          >
            <span className="font-bold">{destino(k)}</span>
            <span className="text-muted-foreground">→</span>
            <span>
              <b>{destino(v)}</b> <span className="text-[9px] text-muted-foreground">{v}</span>
            </span>
          </p>
        ))}
      </div>
    );
  }
  return (
    <>
      <p className="mt-1 break-all font-mono text-sm font-bold">
        {o.tipo === "clase" ? o.valor : o.tipo === "función" ? `def ${o.valor}` : o.valor}
      </p>
      {o.metodos && o.metodos.length > 0 && (
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          métodos: {o.metodos.join(", ")}
        </p>
      )}
      {o.atributos && o.atributos.length > 0 && (
        <div className="mt-2 space-y-1">
          {o.atributos.map(([nombre, ref]) => (
            <p
              key={nombre}
              className="flex items-center justify-between gap-2 rounded-md border bg-background px-2 py-1 font-mono text-xs"
            >
              <span>{nombre}</span>
              <span>
                <b>{destino(ref)}</b>{" "}
                <span className="text-[9px] text-muted-foreground">{ref}</span>
              </span>
            </p>
          ))}
        </div>
      )}
    </>
  );
}

function VistaMemoria({ memoria, anterior }: { memoria: Memoria; anterior: Memoria | null }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const [flechas, setFlechas] = useState<{ d: string; ref: string }[]>([]);
  const [resaltado, setResaltado] = useState<string | null>(null);
  const objetos = useMemo(() => indice(memoria), [memoria]);
  const previos = useMemo(
    () => (anterior ? indice(anterior) : new Map<string, Objeto>()),
    [anterior],
  );

  useLayoutEffect(() => {
    const c = contenedor.current;
    if (!c) return;
    const calcular = () => {
      if (c.clientWidth < 620) {
        setFlechas([]);
        return;
      }
      const base = c.getBoundingClientRect();
      const nuevas: { d: string; ref: string }[] = [];
      c.querySelectorAll<HTMLElement>("[data-desde]").forEach((el) => {
        const ref = el.dataset["desde"]!;
        const destino = c.querySelector<HTMLElement>(`[data-obj="${ref}"]`);
        if (!destino) return;
        const a = el.getBoundingClientRect();
        const b = destino.getBoundingClientRect();
        const x1 = a.left + a.width / 2 - base.left;
        const y1 = a.top + a.height / 2 - base.top;
        const x2 = b.left - base.left - 2;
        const y2 = b.top + 16 - base.top;
        const dx = Math.max(28, (x2 - x1) / 2);
        nuevas.push({ d: `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`, ref });
      });
      setFlechas(nuevas);
    };
    calcular();
    const observador = new ResizeObserver(calcular);
    observador.observe(c);
    return () => observador.disconnect();
  }, [memoria]);

  const marcosPrevios = anterior?.marcos ?? [];
  return (
    <div
      ref={contenedor}
      className="relative grid gap-6 md:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] md:gap-14"
    >
      <svg
        className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full md:block"
        aria-hidden="true"
      >
        <defs>
          <marker
            id="punta"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)" />
          </marker>
          <marker
            id="punta-resaltada"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ds-accent)" />
          </marker>
        </defs>
        {flechas.map((f, i) => (
          <path
            key={i}
            d={f.d}
            fill="none"
            stroke={resaltado === f.ref ? "var(--ds-accent)" : "var(--primary)"}
            strokeOpacity={resaltado && resaltado !== f.ref ? 0.25 : 0.85}
            strokeWidth={resaltado === f.ref ? 2.5 : 1.6}
            markerEnd={`url(#${resaltado === f.ref ? "punta-resaltada" : "punta"})`}
          />
        ))}
      </svg>
      <div>
        <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">
          Pila de marcos · dónde viven los nombres
        </p>
        {memoria.marcos.length === 0 && (
          <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
            Todavía no hay marcos: ninguna variable existe.
          </p>
        )}
        <div className="space-y-3">
          {memoria.marcos.map((marco, i) => {
            const activo = i === memoria.marcos.length - 1;
            const previo = marcosPrevios[i]?.nombre === marco.nombre ? marcosPrevios[i] : undefined;
            const refsPrevias = new Map(previo?.variables.map((v) => [v.nombre, v.ref]) ?? []);
            return (
              <div
                key={`${i}-${marco.nombre}`}
                className={`rounded-2xl border bg-card p-3 shadow-card ${activo ? "border-primary/50 ring-2 ring-primary/30" : "opacity-80"}`}
              >
                <p className="flex items-center justify-between text-xs font-bold">
                  <span>{nombreMarco(marco.nombre)}</span>
                  <span className="font-mono text-muted-foreground">
                    {activo ? "activo" : `en línea ${marco.linea}`}
                  </span>
                </p>
                {marco.variables.length === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">sin variables</p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {marco.variables.map((v) => {
                      const destino = objetos.get(v.ref);
                      const estado = !previo
                        ? ""
                        : !refsPrevias.has(v.nombre)
                          ? "nueva"
                          : refsPrevias.get(v.nombre) !== v.ref
                            ? "apunta a otro"
                            : "";
                      return (
                        <li
                          key={v.nombre}
                          onMouseEnter={() => setResaltado(v.ref)}
                          onMouseLeave={() => setResaltado(null)}
                          className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border px-2 py-1.5 transition-colors ${estado ? "border-accent bg-accent/10" : "bg-background"}`}
                        >
                          <span className="font-mono text-sm font-bold">{v.nombre}</span>
                          <span className="truncate text-right font-mono text-[11px] text-muted-foreground">
                            {estado && (
                              <span className="mr-1 font-sans font-bold text-accent-foreground">
                                {estado}
                              </span>
                            )}
                            → {v.ref}
                          </span>
                          <span
                            data-desde={v.ref}
                            className="size-2.5 rounded-full bg-primary"
                            title={`${v.nombre} apunta a ${destino?.valor ?? v.ref}`}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">
          Montón · dónde viven los objetos
        </p>
        {memoria.objetos.length === 0 && (
          <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
            Ningún objeto todavía.
          </p>
        )}
        <div className="space-y-2.5">
          {memoria.objetos.map((o) => {
            const previo = previos.get(o.ref);
            const nuevo = anterior !== null && !previo;
            const cambio = previo !== undefined && contenido(previo) !== contenido(o);
            return (
              <div
                key={o.ref}
                data-obj={o.ref}
                onMouseEnter={() => setResaltado(o.ref)}
                onMouseLeave={() => setResaltado(null)}
                className={`rounded-2xl border bg-card p-3 shadow-card transition-shadow ${resaltado === o.ref ? "ring-2 ring-accent" : nuevo ? "ring-2 ring-accent/50" : cambio ? "ring-2 ring-warning/70" : ""}`}
              >
                <p className="flex items-center justify-between gap-2 font-mono text-[11px] text-muted-foreground">
                  <span className="font-bold text-primary">{o.ref}</span>
                  <span>
                    {nuevo && (
                      <span className="mr-2 font-sans font-bold text-foreground">nuevo</span>
                    )}
                    {cambio && (
                      <span className="mr-2 font-sans font-bold text-foreground">cambió</span>
                    )}
                    {o.tipo}
                  </span>
                </p>
                <CuerpoObjeto o={o} objetos={objetos} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Visualizador completo ───────────────────────────────────────────────

export function Visualizador({ traza }: { traza: Traza }) {
  const [i, setI] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const pasos = traza.pasos;
  const paso = pasos[Math.min(i, pasos.length - 1)]!;
  const anterior = i > 0 ? pasos[i - 1]! : null;
  const fase = faseDe(paso.t);
  const ultimo = pasos.length - 1;

  useEffect(() => {
    if (!reproduciendo) return;
    if (i >= ultimo) {
      setReproduciendo(false);
      return;
    }
    const id = setTimeout(() => setI((x) => Math.min(ultimo, x + 1)), 1300);
    return () => clearTimeout(id);
  }, [reproduciendo, i, ultimo]);

  const ir = (n: number) => {
    setReproduciendo(false);
    setI(Math.max(0, Math.min(ultimo, n)));
  };
  const teclado = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    if (e.key === "ArrowRight") ir(i + 1);
    else if (e.key === "ArrowLeft") ir(i - 1);
    else return;
    e.preventDefault();
  };
  const salidaNueva = anterior ? paso.salida.slice(anterior.salida.length) : "";

  return (
    <div className="space-y-5" onKeyDown={teclado}>
      <div className="rounded-2xl border bg-card p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <p
              className="font-mono text-4xl font-bold tabular-nums"
              style={{ color: COLOR_FASE[fase] }}
            >
              t={signoT(paso.t)}
            </p>
            <div>
              <p className="text-xs font-bold uppercase" style={{ color: COLOR_FASE[fase] }}>
                {fase === "t<0" ? "Antes de ejecutar" : fase === "t=0" ? "Inicio" : "Ejecución"}
              </p>
              <p className="font-display font-bold">{etiquetaFase(paso)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => ir(0)}
              disabled={i === 0}
              className="h-10 rounded-full border bg-card px-4 text-sm font-semibold disabled:opacity-40"
            >
              Al inicio
            </button>
            <button
              type="button"
              onClick={() => ir(i - 1)}
              disabled={i === 0}
              aria-label="Paso anterior"
              className="h-10 rounded-full border bg-card px-4 text-sm font-semibold disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() =>
                i >= ultimo ? (setI(0), setReproduciendo(true)) : setReproduciendo(!reproduciendo)
              }
              className="h-10 rounded-full border bg-card px-4 text-sm font-semibold"
            >
              {reproduciendo ? "Pausar" : i >= ultimo ? "Repetir" : "Reproducir"}
            </button>
            <button
              type="button"
              onClick={() => ir(i + 1)}
              disabled={i >= ultimo}
              aria-label="Paso siguiente"
              className="h-10 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40"
            >
              Siguiente paso
            </button>
          </div>
        </div>
        <div className="mt-4 flex h-3 gap-0.5" role="group" aria-label="Pasos de la ejecución">
          {pasos.map((p, k) => (
            <button
              key={k}
              type="button"
              onClick={() => ir(k)}
              aria-label={`Ir a t=${p.t}`}
              className={`flex-1 rounded-sm transition-opacity ${k === i ? "opacity-100 ring-2 ring-foreground/40" : k < i ? "opacity-70" : "opacity-25"}`}
              style={{ background: COLOR_TIPO[p.tipo] }}
            />
          ))}
        </div>
        <input
          type="range"
          className="rango mt-3"
          min={0}
          max={ultimo}
          value={i}
          onChange={(e) => ir(Number(e.target.value))}
          aria-label="Instante de la ejecución"
          aria-valuetext={`t igual a ${paso.t}`}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-4">
          <CodigoConLineas
            codigo={traza.codigo}
            paso={paso}
            errorLinea={traza.error_compilacion?.linea ?? null}
          />
          {paso.orden.length > 0 && (
            <div className="rounded-2xl border bg-card p-4 shadow-card">
              <p className="text-xs font-bold uppercase text-primary">
                Qué se ejecuta primero en la línea {paso.siguiente}
              </p>
              <ol className="mt-3 space-y-1.5">
                {paso.orden.map((m, k) => (
                  <li
                    key={k}
                    className="aparecer grid grid-cols-[22px_1fr] gap-2 text-sm"
                    style={{ animationDelay: `${k * 60}ms` }}
                  >
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      {k + 1}
                    </span>
                    <span>
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] font-bold">
                        {m.fragmento}
                      </code>
                      {m.valor !== null && (
                        <span className="ml-2 font-mono text-[13px]">
                          → <b className="text-primary">{m.valor}</b>
                        </span>
                      )}
                      <span className="block text-xs text-muted-foreground">{m.nota}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div className="rounded-2xl bg-foreground p-4 font-mono text-sm text-background shadow-card">
            <p className="mb-1 text-[11px] uppercase text-background/50">Salida</p>
            {paso.salida ? (
              <pre className="whitespace-pre-wrap">
                {paso.salida.slice(0, paso.salida.length - salidaNueva.length)}
                <span className="rounded bg-accent/30">{salidaNueva}</span>
              </pre>
            ) : (
              <p className="text-background/40">(vacía)</p>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4" aria-live="polite">
            <p className="text-xs font-bold uppercase text-primary">Qué pasó</p>
            <ul className="mt-2 space-y-1.5">
              {paso.explicacion.map((e, k) => (
                <li
                  key={`${i}-${k}`}
                  className="aparecer leading-7"
                  style={{ animationDelay: `${k * 80}ms` }}
                >
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <VistaMemoria memoria={paso.memoria} anterior={anterior?.memoria ?? null} />
        </div>
      </div>
    </div>
  );
}
