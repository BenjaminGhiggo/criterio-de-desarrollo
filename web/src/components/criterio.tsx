import { Link } from "@tanstack/react-router";
import { useId, useState, type PointerEvent, type ReactNode } from "react";
import type { Fase, Medicion, PasoPlan } from "@/domain/conocimiento";
import { faseDe } from "@/domain/conocimiento";
import {
  COLOR_FASE,
  DIMENSIONES,
  T_MAX,
  T_MIN,
  actividad,
  signoT,
  type Dimension,
  type Evidencia,
} from "@/lib/datos";
import { usePreferencias } from "@/lib/preferencias";

// ── Marca y estructura ────────────────────────────────────────────────────

export function Marca({ inversa = false }: { inversa?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-3 font-display text-lg font-bold ${inversa ? "text-panel-foreground" : "text-foreground"}`}
    >
      <span
        aria-hidden="true"
        className="grid size-10 rotate-3 place-items-center rounded-[0.9rem] bg-primary text-primary-foreground shadow-glow"
      >
        <span className="-rotate-3 font-display text-xl italic leading-none">t</span>
      </span>
      CRITERIO
    </span>
  );
}

const NAVEGACION = [
  { a: "/aprende", texto: "Ruta" },
  { a: "/metodologias", texto: "Metodologías" },
  { a: "/comparar", texto: "Comparar" },
  { a: "/mi-metodologia", texto: "Mi metodología" },
  { a: "/fundamentos", texto: "Fundamentos" },
] as const;

export function Encabezado() {
  const [abierto, setAbierto] = useState(false);
  return (
    <header className="relative z-30 mx-auto flex h-[74px] max-w-[1560px] items-center justify-between px-5 sm:px-8">
      <Link to="/" aria-label="Criterio, ir al inicio">
        <Marca />
      </Link>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls="navegacion"
        className="rounded-full border bg-card px-4 py-2 font-display text-sm font-semibold md:hidden"
      >
        {abierto ? "Cerrar" : "Menú"}
      </button>
      <nav
        id="navegacion"
        aria-label="Navegación principal"
        className={`${abierto ? "absolute left-4 right-4 top-20 flex bg-card p-3 shadow-soft" : "hidden"} flex-col rounded-2xl md:static md:flex md:flex-row md:bg-transparent md:p-0 md:shadow-none`}
      >
        {NAVEGACION.map(({ a, texto }) => (
          <Link
            key={a}
            to={a}
            onClick={() => setAbierto(false)}
            activeProps={{ className: "text-primary bg-primary/5" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            className="rounded-full px-4 py-3 text-base font-semibold hover:bg-primary/5 hover:text-primary md:py-2"
          >
            {texto}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function Pie() {
  return (
    <footer className="mx-auto flex max-w-[1560px] flex-col gap-4 border-t px-5 py-9 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <Marca />
      <p className="max-w-xl">
        Python, Domain Driven Design y Test Driven Development. Las trayectorias las calcula un
        dominio en Python cubierto por pruebas.{" "}
        <a
          className="font-semibold text-primary underline-offset-4 hover:underline"
          href="https://github.com/BenjaminGhiggo/criterio-de-desarrollo"
        >
          Código fuente
        </a>
      </p>
    </footer>
  );
}

export function Encabezamiento({
  ceja,
  titulo,
  children,
  id,
}: {
  ceja: string;
  titulo: ReactNode;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-9 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div>
        <p className="mb-3 text-xs font-bold uppercase text-primary">{ceja}</p>
        <h2 id={id} className="max-w-4xl font-display text-4xl font-bold leading-tight sm:text-5xl">
          {titulo}
        </h2>
      </div>
      {children && (
        <div className="max-w-lg text-base leading-8 text-muted-foreground">{children}</div>
      )}
    </div>
  );
}

// ── Evidencia y fases ─────────────────────────────────────────────────────

const ESTILO_EVIDENCIA: Record<Evidencia, { caja: string; punto: string }> = {
  alta: { caja: "border-success/30 bg-success/10", punto: "bg-success" },
  moderada: { caja: "border-primary/25 bg-primary/10", punto: "bg-primary" },
  "práctica profesional": { caja: "border-warning/35 bg-warning/15", punto: "bg-warning" },
  baja: { caja: "border-destructive/30 bg-destructive/10", punto: "bg-destructive" },
};

export function InsigniaEvidencia({ nivel }: { nivel: Evidencia }) {
  const e = ESTILO_EVIDENCIA[nivel];
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold ${e.caja}`}
    >
      <span className={`size-2 rounded-full ${e.punto}`} />
      Evidencia {nivel}
    </span>
  );
}

export function SignoFase({ fase, className = "" }: { fase: Fase; className?: string }) {
  return (
    <span
      className={`font-mono text-xs font-bold ${className}`}
      style={{ color: COLOR_FASE[fase] }}
    >
      {fase}
    </span>
  );
}

// ── Plan en el tiempo ─────────────────────────────────────────────────────

const posicion = (t: number) => ((t - T_MIN) / (T_MAX - T_MIN)) * 100;

/** Línea de tiempo compacta: un punto por actividad. */
export function MiniPlan({ plan }: { plan: PasoPlan[] }) {
  return (
    <div className="relative h-6" aria-hidden="true">
      <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
      <div className="absolute top-1 h-4 w-px bg-cero" style={{ left: `${posicion(0)}%` }} />
      {plan.map((p, i) => (
        <span
          key={i}
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card"
          style={{ left: `${posicion(p.t)}%`, background: COLOR_FASE[faseDe(p.t)] }}
        />
      ))}
    </div>
  );
}

export function PlanEnElTiempo({ plan, t }: { plan: Required<PasoPlan>[]; t?: number }) {
  const grupos: { fase: Fase; titulo: string }[] = [
    { fase: "t<0", titulo: "Antes de encontrar el concepto" },
    { fase: "t=0", titulo: "El encuentro" },
    { fase: "t>0", titulo: "Después: consolidar" },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {grupos.map(({ fase, titulo }) => {
        const pasos = plan.filter((p) => faseDe(p.t) === fase).sort((a, b) => a.t - b.t);
        return (
          <div
            key={fase}
            className="rounded-2xl border bg-card p-5 shadow-card"
            style={{ borderTop: `3px solid ${COLOR_FASE[fase]}` }}
          >
            <p className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground">
              {titulo} <SignoFase fase={fase} />
            </p>
            {pasos.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                {fase === "t<0"
                  ? "Esta metodología no prepara nada antes: llegas en frío al concepto."
                  : "Nada en esta fase."}
              </p>
            ) : (
              <ol className="mt-4 space-y-4">
                {pasos.map((p, i) => {
                  const hecho = t === undefined || p.t <= t;
                  const a = actividad(p.actividad);
                  return (
                    <li
                      key={i}
                      className={`grid grid-cols-[52px_1fr] gap-3 transition-opacity ${hecho ? "" : "opacity-40"}`}
                    >
                      <span
                        className="font-mono text-sm font-bold"
                        style={{ color: COLOR_FASE[fase] }}
                      >
                        t={signoT(p.t)}
                      </span>
                      <div>
                        <p className="font-semibold leading-snug">{p.que_haces}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="font-bold uppercase">{a.nombre}</span> · {a.minutos} min
                          · {a.por_que}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Medidores y gráfico ───────────────────────────────────────────────────

export function Medidores({
  medicion,
  inversa = false,
}: {
  medicion: Medicion;
  inversa?: boolean;
}) {
  const brecha = medicion.confianza - medicion.retencion;
  const tenue = inversa ? "text-panel-foreground/60" : "text-muted-foreground";
  const pista = inversa ? "bg-panel-foreground/10" : "bg-muted";
  return (
    <div className="space-y-4">
      {DIMENSIONES.map((d) => {
        const v = medicion[d.clave];
        return (
          <div key={d.clave}>
            <div className="mb-1.5 flex justify-between text-sm">
              <span
                className={`font-semibold ${inversa ? "text-panel-foreground/80" : ""}`}
                title={d.que}
              >
                {d.nombre}
              </span>
              <span className="font-mono font-bold tabular-nums">{v.toFixed(0)}</span>
            </div>
            <div className={`h-2.5 overflow-hidden rounded-full ${pista}`}>
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${d.clave === "confianza" ? "bg-warning" : inversa ? "bg-accent" : "bg-primary"}`}
                style={{ width: `${v}%` }}
              />
            </div>
          </div>
        );
      })}
      <p
        className={`border-t pt-3 text-sm ${tenue} ${inversa ? "border-panel-foreground/15" : ""}`}
      >
        Brecha{" "}
        <strong className="font-mono">
          {brecha > 0 ? "+" : ""}
          {brecha.toFixed(0)}
        </strong>
        {medicion.fase === "t<0"
          ? " · aún no hay nada que recordar"
          : brecha > 15
            ? " · crees saber más de lo que recuerdas"
            : brecha < -15
              ? " · sabes más de lo que crees"
              : " · bien calibrado"}
        {" · "}
        <span className="font-mono">{medicion.minutos} min</span> invertidos
      </p>
    </div>
  );
}

export type Serie = {
  id: string;
  nombre: string;
  color: string;
  puntos: Medicion[];
  grosor?: number;
};

export function GraficoTrayectoria({
  series,
  dimension,
  t,
  onT,
  alto = 260,
  etiqueta,
}: {
  series: Serie[];
  dimension: Dimension;
  t?: number;
  onT?: (t: number) => void;
  alto?: number;
  etiqueta?: string;
}) {
  const W = 680,
    H = alto,
    PL = 34,
    PR = 14,
    PT = 14,
    PB = 30;
  const x = (v: number) => PL + ((v - T_MIN) / (T_MAX - T_MIN)) * (W - PL - PR);
  const y = (v: number) => PT + (1 - v / 100) * (H - PT - PB);
  const id = useId();
  const mover = (e: PointerEvent<SVGSVGElement>) => {
    if (!onT) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const nuevo = Math.round(T_MIN + ((px - PL) / (W - PL - PR)) * (T_MAX - T_MIN));
    onT(Math.min(T_MAX, Math.max(T_MIN, nuevo)));
  };
  const marcas = [-3, 0, 3, 7, 14, 21, 30];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full touch-pan-y select-none"
      role="img"
      aria-label={etiqueta ?? `Evolución de ${dimension} entre t=${T_MIN} y t=${T_MAX}`}
      onPointerMove={mover}
      onPointerDown={mover}
    >
      <defs>
        <linearGradient id={`${id}-antes`} x1="0" x2="1">
          <stop offset="0" stopColor="var(--t-antes)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--t-antes)" stopOpacity=".12" />
        </linearGradient>
      </defs>
      <rect x={PL} y={PT} width={x(0) - PL} height={H - PT - PB} fill={`url(#${id}-antes)`} />
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line
            x1={PL}
            x2={W - PR}
            y1={y(v)}
            y2={y(v)}
            className="stroke-border"
            strokeDasharray="4 7"
          />
          <text
            x={PL - 8}
            y={y(v) + 4}
            textAnchor="end"
            className="fill-muted-foreground font-mono text-[10px]"
          >
            {v}
          </text>
        </g>
      ))}
      <line x1={x(0)} x2={x(0)} y1={PT} y2={H - PB} stroke="var(--t-cero)" strokeWidth="2" />
      {marcas.map((m) => (
        <text
          key={m}
          x={x(m)}
          y={H - 10}
          textAnchor="middle"
          className="font-mono text-[10px]"
          fill={m === 0 ? "var(--t-cero)" : "var(--muted-foreground)"}
        >
          {signoT(m)}
        </text>
      ))}
      {series.map((s) => {
        const puntos = s.puntos.map((p) => `${x(p.t)},${y(p[dimension])}`).join(" ");
        return (
          <polyline
            key={`${s.id}-${dimension}`}
            points={puntos}
            fill="none"
            stroke={s.color}
            strokeWidth={s.grosor ?? 3}
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            className="chart-line"
          />
        );
      })}
      {t !== undefined && (
        <g>
          <line
            x1={x(t)}
            x2={x(t)}
            y1={PT}
            y2={H - PB}
            stroke={COLOR_FASE[faseDe(t)]}
            strokeDasharray="3 4"
            strokeWidth="1.5"
          />
          {series.map((s) => {
            const p = s.puntos.find((q) => q.t === t);
            return p ? (
              <circle
                key={s.id}
                cx={x(t)}
                cy={y(p[dimension])}
                r="5.5"
                fill="var(--card)"
                stroke={s.color}
                strokeWidth="3"
              />
            ) : null;
          })}
        </g>
      )}
    </svg>
  );
}

export function SelectorT({
  t,
  onT,
  etiqueta = "Instante t",
}: {
  t: number;
  onT: (t: number) => void;
  etiqueta?: string;
}) {
  const fase = faseDe(t);
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
      <button
        type="button"
        aria-label="Retroceder un instante"
        disabled={t <= T_MIN}
        onClick={() => onT(t - 1)}
        className="grid size-10 place-items-center rounded-full border bg-card font-mono font-bold disabled:opacity-40"
      >
        ‹
      </button>
      <input
        type="range"
        className="rango"
        min={T_MIN}
        max={T_MAX}
        value={t}
        onChange={(e) => onT(Number(e.target.value))}
        aria-label={etiqueta}
        aria-valuetext={`t igual a ${t}, fase ${fase}`}
        style={{ accentColor: COLOR_FASE[fase] }}
      />
      <button
        type="button"
        aria-label="Avanzar un instante"
        disabled={t >= T_MAX}
        onClick={() => onT(t + 1)}
        className="grid size-10 place-items-center rounded-full border bg-card font-mono font-bold disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}

// ── Valoración: tú decides qué metodología te sirve ──────────────────────

const ESCALA = ["Nada", "Poco", "Algo", "Bastante", "Mucho"];

export function Valoracion({ id, nombre }: { id: string; nombre: string }) {
  const { prefs, actualizar } = usePreferencias();
  const v = prefs[id] ?? {};
  return (
    <section
      aria-labelledby={`valorar-${id}`}
      className="rounded-2xl bg-panel p-6 text-panel-foreground shadow-card sm:p-8"
    >
      <p className="text-xs font-bold uppercase text-accent">Tu decisión</p>
      <h3 id={`valorar-${id}`} className="mt-2 font-display text-2xl font-bold">
        ¿{nombre} te hizo aprender?
      </h3>
      <p className="mt-2 text-sm text-panel-foreground/65">
        Responde después de probar el ejemplo. Se guarda solo en este navegador.
      </p>
      <div
        role="radiogroup"
        aria-label="Cuánto te hizo aprender"
        className="mt-5 grid grid-cols-5 gap-2"
      >
        {ESCALA.map((texto, i) => {
          const nota = i + 1;
          const activa = v.nota === nota;
          return (
            <button
              key={texto}
              type="button"
              role="radio"
              aria-checked={activa}
              onClick={() => actualizar(id, { nota, probada: true })}
              className={`rounded-2xl border px-1 py-3 text-center transition-colors ${activa ? "border-accent bg-accent text-accent-foreground" : "border-panel-foreground/15 hover:border-accent/60"}`}
            >
              <span className="block font-mono text-lg font-bold">{nota}</span>
              <span className="block text-[11px] font-semibold">{texto}</span>
            </button>
          );
        })}
      </div>
      <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-panel-foreground/15 bg-panel-foreground/5 p-4">
        <span>
          <span className="block font-semibold">La elijo para mi metodología</span>
          <span className="block text-sm text-panel-foreground/60">
            Se combinará con las demás que elijas.
          </span>
        </span>
        <input
          type="checkbox"
          checked={Boolean(v.elegida)}
          onChange={(e) => actualizar(id, { elegida: e.target.checked, probada: true })}
          className="size-6 accent-[var(--ds-accent)]"
        />
      </label>
      <label
        className="mt-4 block text-xs font-bold uppercase text-panel-foreground/55"
        htmlFor={`nota-${id}`}
      >
        Qué aprendiste (opcional)
      </label>
      <textarea
        id={`nota-${id}`}
        value={v.nota_texto ?? ""}
        onChange={(e) => actualizar(id, { nota_texto: e.target.value })}
        rows={2}
        className="mt-2 w-full rounded-2xl border border-panel-foreground/20 bg-panel-foreground/10 p-3 text-panel-foreground placeholder:text-panel-foreground/40"
        placeholder="Una frase para tu yo de t=+7"
      />
    </section>
  );
}

export function PaginaNoEncontrada() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-sm font-bold text-primary">t = ?</p>
        <h1 className="mt-2 font-display text-5xl font-bold text-foreground">
          Este instante no existe
        </h1>
        <p className="mt-3 text-muted-foreground">
          La página que buscas no está en ninguna fase del tiempo.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 font-display text-sm font-semibold text-primary-foreground"
          >
            Volver a las metodologías
          </Link>
        </div>
      </div>
    </main>
  );
}
