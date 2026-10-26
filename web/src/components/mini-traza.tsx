import { useEffect, useRef, useState } from "react";
import { Marca } from "@/components/criterio";
import { faseDe } from "@/domain/conocimiento";
import { COLOR_FASE, signoT } from "@/lib/datos";
import type { Traza } from "@/lib/ruta";

/** Una traza real reproduciéndose sola: el código, la memoria y lo que pasó. */
export function MiniTraza({ traza }: { traza: Traza }) {
  const [i, setI] = useState(traza.pasos.length - 1);
  const pausado = useRef(false);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setI(0);
    const id = setInterval(() => {
      if (!pausado.current) setI((x) => (x + 1) % traza.pasos.length);
    }, 2200);
    return () => clearInterval(id);
  }, [traza]);
  const paso = traza.pasos[i]!;
  const objetos = new Map(paso.memoria.objetos.map((o) => [o.ref, o]));
  const fase = faseDe(paso.t);
  return (
    <div
      className="relative overflow-hidden rounded-[2rem] bg-panel p-6 text-panel-foreground shadow-soft sm:p-8"
      onMouseEnter={() => (pausado.current = true)}
      onMouseLeave={() => (pausado.current = false)}
    >
      <div className="live-scan" aria-hidden="true" />
      <div className="flex items-center justify-between gap-3">
        <Marca inversa />
        <span className="flex items-center gap-2 rounded-full border border-panel-foreground/20 px-3 py-2 font-mono text-xs">
          <span className="live-dot size-2 rounded-full bg-accent" />
          PYTHON EN VIVO
        </span>
      </div>
      <div className="mt-6 flex items-baseline justify-between">
        <p
          className="font-mono text-4xl font-bold tabular-nums"
          style={{ color: COLOR_FASE[fase] }}
        >
          t = {signoT(paso.t)}
        </p>
        <p className="text-sm text-panel-foreground/60">
          {fase === "t<0"
            ? "compilando"
            : fase === "t=0"
              ? "empieza"
              : paso.tipo === "fin"
                ? "terminó"
                : "ejecutando"}
        </p>
      </div>
      <pre className="codigo mt-4 rounded-2xl bg-panel-foreground/5 py-2">
        {traza.codigo.split("\n").map((l, k) => {
          const n = k + 1;
          const sig = paso.siguiente === n && paso.tipo !== "compilacion";
          const ej = paso.ejecutada === n;
          return (
            <span
              key={k}
              className={`flex border-l-4 px-3 transition-colors duration-500 ${sig ? "border-accent bg-accent/15" : ej ? "border-primary bg-primary/20" : "border-transparent"}`}
            >
              <span className="mr-3 w-4 text-right text-panel-foreground/35">{n}</span>
              {l}
            </span>
          );
        })}
      </pre>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-panel-foreground/15 p-3">
          <p className="text-[11px] font-bold uppercase text-panel-foreground/55">Marco global</p>
          <ul className="mt-2 space-y-1 font-mono text-sm">
            {(paso.memoria.marcos[0]?.variables ?? []).map((v) => (
              <li key={v.nombre} className="flex justify-between gap-2">
                <b>{v.nombre}</b>
                <span className="text-accent">→ {v.ref}</span>
              </li>
            ))}
            {!paso.memoria.marcos[0]?.variables.length && (
              <li className="text-panel-foreground/40">vacío</li>
            )}
          </ul>
        </div>
        <div className="rounded-2xl border border-panel-foreground/15 p-3">
          <p className="text-[11px] font-bold uppercase text-panel-foreground/55">Montón</p>
          <ul className="mt-2 space-y-1 font-mono text-sm">
            {paso.memoria.objetos.map((o) => (
              <li key={o.ref} className="flex justify-between gap-2">
                <span className="text-accent">{o.ref}</span>
                <b>{objetos.get(o.ref)?.valor}</b>
              </li>
            ))}
            {!paso.memoria.objetos.length && <li className="text-panel-foreground/40">vacío</li>}
          </ul>
        </div>
      </div>
      <p key={i} className="aparecer mt-4 min-h-14 text-sm leading-6 text-panel-foreground/80">
        {paso.explicacion[0]}
      </p>
    </div>
  );
}
