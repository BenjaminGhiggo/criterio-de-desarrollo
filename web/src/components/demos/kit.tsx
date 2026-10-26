import { useState, type ReactNode } from "react";

/** Resalta palabras clave y cadenas de Python sin dependencias. Suficiente para fragmentos cortos. */
function resaltar(linea: string): ReactNode[] {
  const comentario = linea.indexOf("#");
  const codigo = comentario >= 0 ? linea.slice(0, comentario) : linea;
  const partes: ReactNode[] = [];
  let ultimo = 0;
  for (const m of codigo.matchAll(
    /("[^"]*"|'[^']*')|\b(def|class|return|if|else|elif|raise|import|from|for|in|not|and|or|assert|None|True|False|self|with|lambda|pass)\b/g,
  )) {
    const i = m.index ?? 0;
    partes.push(codigo.slice(ultimo, i));
    partes.push(
      <span key={i} className={m[1] ? "st" : "kw"}>
        {m[0]}
      </span>,
    );
    ultimo = i + m[0].length;
  }
  partes.push(codigo.slice(ultimo));
  if (comentario >= 0)
    partes.push(
      <span key="c" className="co">
        {linea.slice(comentario)}
      </span>,
    );
  return partes;
}

export function Codigo({
  codigo,
  marcada,
  onLinea,
  estado,
  titulo,
}: {
  codigo: string;
  marcada?: number | null;
  onLinea?: (i: number) => void;
  estado?: (i: number) => "bien" | "mal" | null;
  titulo?: string;
}) {
  const lineas = codigo.split("\n");
  return (
    <div className="overflow-hidden rounded-2xl bg-panel text-panel-foreground shadow-card">
      {titulo && (
        <p className="border-b border-panel-foreground/10 px-5 py-2.5 font-mono text-xs text-panel-foreground/60">
          {titulo}
        </p>
      )}
      <pre className="codigo overflow-x-auto p-4 sm:p-5">
        {lineas.map((l, i) => {
          const e = estado?.(i);
          const fondo =
            e === "bien"
              ? "bg-success/25"
              : e === "mal"
                ? "bg-destructive/30"
                : marcada === i
                  ? "bg-accent/20"
                  : "";
          const contenido = (
            <>
              <span className="mr-4 inline-block w-5 select-none text-right text-panel-foreground/30">
                {i + 1}
              </span>
              {resaltar(l)}
            </>
          );
          return onLinea ? (
            <button
              key={i}
              type="button"
              onClick={() => onLinea(i)}
              className={`block w-full rounded px-1 text-left hover:bg-panel-foreground/10 ${fondo}`}
            >
              {contenido}
              {"\n"}
            </button>
          ) : (
            <span key={i} className={`block rounded px-1 ${fondo}`}>
              {contenido}
              {"\n"}
            </span>
          );
        })}
      </pre>
    </div>
  );
}

export function Opcion({
  activa,
  onClick,
  children,
  estado,
  disabled,
}: {
  activa?: boolean;
  onClick: () => void;
  children: ReactNode;
  estado?: "bien" | "mal" | null;
  disabled?: boolean;
}) {
  const borde =
    estado === "bien"
      ? "border-success bg-success/10"
      : estado === "mal"
        ? "border-destructive bg-destructive/10"
        : activa
          ? "border-primary bg-primary/5"
          : "bg-card hover:border-primary/40";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={activa}
      className={`w-full rounded-2xl border p-4 text-left text-[15px] leading-6 transition-colors disabled:cursor-default ${borde}`}
    >
      {children}
    </button>
  );
}

export function Accion({
  children,
  onClick,
  disabled,
  secundaria,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  secundaria?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-11 items-center justify-center rounded-full px-5 font-display text-sm font-semibold transition-all disabled:cursor-default disabled:opacity-40 ${
        secundaria
          ? "border bg-card hover:border-primary/40 hover:text-primary"
          : "bg-primary text-primary-foreground shadow-glow hover:-translate-y-0.5"
      }`}
    >
      {children}
    </button>
  );
}

export function Retro({
  tipo,
  titulo,
  children,
}: {
  tipo: "bien" | "mal" | "info";
  titulo: string;
  children?: ReactNode;
}) {
  const estilo =
    tipo === "bien"
      ? "border-success/40 bg-success/10"
      : tipo === "mal"
        ? "border-destructive/40 bg-destructive/10"
        : "border-primary/25 bg-primary/5";
  return (
    <div role="status" className={`aparecer rounded-2xl border p-4 ${estilo}`}>
      <p className="font-display font-bold">{titulo}</p>
      {children && <div className="mt-1 text-[15px] leading-7 text-foreground/80">{children}</div>}
    </div>
  );
}

/** Indicador de pasos con su instante en el tiempo. */
export function Pasos({
  pasos,
  actual,
}: {
  pasos: { t: string; nombre: string }[];
  actual: number;
}) {
  return (
    <ol className="mb-6 flex flex-wrap gap-2" aria-label="Pasos de la demo">
      {pasos.map((p, i) => (
        <li
          key={p.nombre}
          aria-current={i === actual ? "step" : undefined}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            i === actual
              ? "border-primary bg-primary text-primary-foreground"
              : i < actual
                ? "border-primary/30 bg-primary/10 text-primary"
                : "text-muted-foreground"
          }`}
        >
          <span className="font-mono">{p.t}</span>
          {p.nombre}
        </li>
      ))}
    </ol>
  );
}

export function Pregunta({ children }: { children: ReactNode }) {
  return <p className="mb-4 font-display text-xl font-bold leading-snug">{children}</p>;
}

export function Nota({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-6 text-muted-foreground">{children}</p>;
}

/** Preguntas de opción múltiple con explicación. Usada por varias demos. */
export type PreguntaMultiple = {
  pregunta: string;
  opciones: string[];
  correcta: number;
  porque: string;
};

export function mezclar<T>(lista: T[], semilla = 7): T[] {
  // Mezcla determinista: igual en el servidor y en el navegador (sin desajustes al hidratar).
  const copia = [...lista];
  let s = semilla;
  for (let i = copia.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [copia[i], copia[j]] = [copia[j]!, copia[i]!];
  }
  return copia;
}

/** Copia al portapapeles con respaldo para navegadores que niegan el permiso. */
export function BotonCopiar({ texto }: { texto: string }) {
  const [estado, setEstado] = useState<"" | "ok" | "error">("");
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("ok");
    } catch {
      const area = document.createElement("textarea");
      area.value = texto;
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      setEstado(ok ? "ok" : "error");
    }
    setTimeout(() => setEstado(""), 2000);
  };
  return (
    <Accion secundaria onClick={copiar}>
      {estado === "ok" ? "Copiado" : estado === "error" ? "No se pudo copiar" : "Copiar"}
    </Accion>
  );
}
