import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Encabezamiento,
  GraficoTrayectoria,
  InsigniaEvidencia,
  SelectorT,
} from "@/components/criterio";
import { brecha, dominio } from "@/domain/conocimiento";
import {
  DIMENSIONES,
  FAMILIAS,
  METODOS,
  ORDEN_EVIDENCIA,
  T_MAX,
  medicionEn,
  metodoPorId,
  type Dimension,
  type Metodo,
} from "@/lib/datos";
import { usePreferencias } from "@/lib/preferencias";

const URL_SITIO = "https://criterio.benjacode.com";

export const Route = createFileRoute("/comparar")({
  head: () => ({
    meta: [
      { title: "Comparar metodologías de aprendizaje — Criterio" },
      {
        name: "description",
        content:
          "Tabla y gráficos para comparar 19 metodologías de aprendizaje por evidencia, tiempo invertido, retención, comprensión, transferencia y criterio a 30 días.",
      },
      { property: "og:url", content: `${URL_SITIO}/comparar` },
    ],
    links: [{ rel: "canonical", href: `${URL_SITIO}/comparar` }],
  }),
  component: Comparar,
});

const PALETA = ["var(--primary)", "var(--t-antes)", "var(--t-cero)", "var(--destructive)"];

type Columna = {
  clave: string;
  nombre: string;
  valor: (m: Metodo) => number;
  formato?: (v: number) => string;
};

const COLUMNAS: Columna[] = [
  { clave: "evidencia", nombre: "Evidencia", valor: (m) => ORDEN_EVIDENCIA.indexOf(m.evidencia) },
  { clave: "minutos", nombre: "Minutos", valor: (m) => m.minutos, formato: (v) => String(v) },
  { clave: "retencion", nombre: "Retención", valor: (m) => medicionEn(m, T_MAX).retencion },
  { clave: "comprension", nombre: "Comprensión", valor: (m) => medicionEn(m, T_MAX).comprension },
  {
    clave: "transferencia",
    nombre: "Transferencia",
    valor: (m) => medicionEn(m, T_MAX).transferencia,
  },
  { clave: "criterio", nombre: "Criterio", valor: (m) => medicionEn(m, T_MAX).criterio },
  { clave: "dominio", nombre: "Dominio", valor: (m) => dominio(medicionEn(m, T_MAX)) },
  {
    clave: "brecha",
    nombre: "Brecha t=+7",
    valor: (m) => brecha(medicionEn(m, 7)),
    formato: (v) => `${v > 0 ? "+" : ""}${v.toFixed(0)}`,
  },
];

function Comparar() {
  const [orden, setOrden] = useState<{ clave: string; asc: boolean }>({
    clave: "dominio",
    asc: false,
  });
  const [familia, setFamilia] = useState("Todas");
  const [seleccion, setSeleccion] = useState<string[]>([
    "relectura",
    "espaciada",
    "intercalado",
    "premortem",
  ]);
  const [dimension, setDimension] = useState<Dimension>("criterio");
  const [t, setT] = useState(T_MAX);
  const { prefs } = usePreferencias();

  const filas = useMemo(() => {
    const col = COLUMNAS.find((c) => c.clave === orden.clave)!;
    return METODOS.filter((m) => familia === "Todas" || m.familia === familia).sort(
      (a, b) => (col.valor(a) - col.valor(b)) * (orden.asc ? 1 : -1),
    );
  }, [orden, familia]);

  const alternar = (id: string) =>
    setSeleccion((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length >= 4 ? [...s.slice(1), id] : [...s, id],
    );

  const series = seleccion.map((id, i) => {
    const m = metodoPorId(id)!;
    return { id, nombre: m.nombre, color: PALETA[i]!, puntos: m.trayectoria };
  });

  return (
    <main className="mx-auto max-w-[1560px] px-5 pb-20 pt-8 sm:px-8">
      <Encabezamiento ceja="Comparar" titulo="Todas las metodologías, medidas igual.">
        Mismo concepto, mismo horizonte de 30 días, mismo modelo. Ordena por la columna que más te
        importe; si te importa el porqué, ordena por criterio.
      </Encabezamiento>

      <section aria-labelledby="curvas" className="grid gap-6 xl:grid-cols-[.75fr_1.25fr]">
        <div className="rounded-2xl border bg-card p-5 shadow-card sm:p-6">
          <h2 id="curvas" className="font-display text-xl font-bold">
            Elige hasta 4
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {METODOS.map((m) => {
              const i = seleccion.indexOf(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={i >= 0}
                  onClick={() => alternar(m.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${i >= 0 ? "text-primary-foreground" : "bg-card text-muted-foreground hover:text-primary"}`}
                  style={i >= 0 ? { background: PALETA[i], borderColor: PALETA[i] } : undefined}
                >
                  {m.nombre.split(" (")[0]}
                </button>
              );
            })}
          </div>
          <ul className="mt-6 space-y-2">
            {series.map((s) => {
              const p = medicionEn(metodoPorId(s.id)!, t);
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border bg-background p-3 text-sm"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="h-1 w-5 rounded-full" style={{ background: s.color }} />
                    {s.nombre.split(" (")[0]}
                  </span>
                  <span className="font-mono">{p[dimension].toFixed(0)}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-card sm:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {DIMENSIONES.map((d) => (
              <button
                key={d.clave}
                type="button"
                aria-pressed={dimension === d.clave}
                onClick={() => setDimension(d.clave)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${dimension === d.clave ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground"}`}
                title={d.que}
              >
                {d.nombre}
              </button>
            ))}
          </div>
          <GraficoTrayectoria series={series} dimension={dimension} t={t} onT={setT} alto={300} />
          <div className="mt-4">
            <SelectorT t={t} onT={setT} />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="eficiencia"
        className="mt-6 rounded-2xl bg-panel p-5 text-panel-foreground shadow-card sm:p-7"
      >
        <h2 id="eficiencia" className="font-display text-xl font-bold">
          Dominio a 30 días frente al tiempo invertido
        </h2>
        <p className="mt-1 text-sm text-panel-foreground/65">
          Arriba a la izquierda: aprendes mucho con poco tiempo. Haz clic en un punto para agregarlo
          al gráfico.
        </p>
        <Dispersion seleccion={seleccion} onElegir={alternar} />
      </section>

      <section
        aria-labelledby="tabla"
        className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-card"
      >
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <h2 id="tabla" className="font-display text-xl font-bold">
            Tabla completa a t=+30
          </h2>
          <select
            aria-label="Filtrar por familia"
            value={familia}
            onChange={(e) => setFamilia(e.target.value)}
            className="h-10 rounded-full border bg-card px-4 text-sm font-semibold"
          >
            {["Todas", ...FAMILIAS].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Metodología</th>
                {COLUMNAS.map((c) => (
                  <th
                    key={c.clave}
                    className="px-3 py-3 text-right"
                    aria-sort={
                      orden.clave === c.clave ? (orden.asc ? "ascending" : "descending") : "none"
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOrden({
                          clave: c.clave,
                          asc: orden.clave === c.clave ? !orden.asc : false,
                        })
                      }
                      className="font-bold uppercase hover:text-primary"
                    >
                      {c.nombre}
                      {orden.clave === c.clave ? (orden.asc ? " ↑" : " ↓") : ""}
                    </button>
                  </th>
                ))}
                <th className="px-5 py-3 text-right">Tu nota</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((m) => (
                <tr key={m.id} className="border-t hover:bg-primary/5">
                  <td className="px-5 py-3">
                    <Link
                      to="/metodos/$id"
                      params={{ id: m.id }}
                      className="font-semibold hover:text-primary"
                    >
                      {m.nombre}
                    </Link>
                    <span className="block text-xs text-muted-foreground">{m.familia}</span>
                  </td>
                  {COLUMNAS.map((c) => (
                    <td key={c.clave} className="px-3 py-3 text-right font-mono">
                      {c.clave === "evidencia" ? (
                        <InsigniaEvidencia nivel={m.evidencia} />
                      ) : (
                        (c.formato ?? ((v: number) => v.toFixed(0)))(c.valor(m))
                      )}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right font-mono">
                    {prefs[m.id]?.nota ? `${prefs[m.id]!.nota}/5` : "—"}
                    {prefs[m.id]?.elegida ? " · elegida" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Dispersion({
  seleccion,
  onElegir,
}: {
  seleccion: string[];
  onElegir: (id: string) => void;
}) {
  const W = 900,
    H = 340,
    P = 44;
  const maxMin = Math.max(...METODOS.map((m) => m.minutos)) + 10;
  const maxDom = 60;
  const x = (v: number) => P + (v / maxMin) * (W - P * 2);
  const y = (v: number) => H - P - (v / maxDom) * (H - P * 2);
  return (
    <div className="mt-4 overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full min-w-[640px]"
        role="img"
        aria-label="Dispersión de dominio a 30 días frente a minutos invertidos"
      >
        {[0, 15, 30, 45, 60].map((v) => (
          <g key={v}>
            <line
              x1={P}
              x2={W - P}
              y1={y(v)}
              y2={y(v)}
              className="stroke-panel-foreground/15"
              strokeDasharray="4 7"
            />
            <text
              x={P - 8}
              y={y(v) + 4}
              textAnchor="end"
              className="fill-panel-foreground/50 font-mono text-[11px]"
            >
              {v}
            </text>
          </g>
        ))}
        {[0, 50, 100, 150].map((v) => (
          <text
            key={v}
            x={x(v)}
            y={H - 16}
            textAnchor="middle"
            className="fill-panel-foreground/50 font-mono text-[11px]"
          >
            {v} min
          </text>
        ))}
        {METODOS.map((m) => {
          const d = dominio(medicionEn(m, T_MAX));
          const activo = seleccion.includes(m.id);
          return (
            <g key={m.id} onClick={() => onElegir(m.id)} className="cursor-pointer">
              <circle
                cx={x(m.minutos)}
                cy={y(d)}
                r={activo ? 9 : 6}
                className={
                  activo
                    ? "fill-accent stroke-accent/30"
                    : "fill-panel-foreground/60 stroke-transparent"
                }
                strokeWidth="8"
              />
              <text
                x={x(m.minutos) + 10}
                y={y(d) - 8}
                className={`text-[11px] font-semibold ${activo ? "fill-accent" : "fill-panel-foreground/70"}`}
              >
                {m.nombre.split(" (")[0]!.split(":")[0]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
