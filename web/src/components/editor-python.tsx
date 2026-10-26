import { useState, type KeyboardEvent } from "react";
import { ejecutarEnNavegador } from "@/lib/pyodide";
import type { Traza } from "@/lib/ruta";

type Estado = "inactivo" | "cargando" | "error";

/** Editor de Python que ejecuta en el navegador con el mismo motor de las lecciones. */
export function EditorPython({
  inicial,
  onTraza,
}: {
  inicial: string;
  onTraza: (traza: Traza) => void;
}) {
  const [codigo, setCodigo] = useState(inicial);
  const [estado, setEstado] = useState<Estado>("inactivo");
  const [mensaje, setMensaje] = useState("");

  const ejecutar = async () => {
    setEstado("cargando");
    setMensaje("");
    try {
      const traza = await ejecutarEnNavegador(codigo);
      onTraza(traza);
      setEstado("inactivo");
    } catch (error) {
      setEstado("error");
      setMensaje(error instanceof Error ? error.message : String(error));
    }
  };

  const teclado = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart: a, selectionEnd: b } = el;
      const nuevo = `${codigo.slice(0, a)}    ${codigo.slice(b)}`;
      setCodigo(nuevo);
      requestAnimationFrame(() => el.setSelectionRange(a + 4, a + 4));
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void ejecutar();
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-panel text-panel-foreground shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-panel-foreground/10 px-4 py-3">
        <p className="font-mono text-xs text-panel-foreground/60">
          tu_version.py · Python real en tu navegador
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCodigo(inicial)}
            className="h-9 rounded-full border border-panel-foreground/20 px-4 text-xs font-semibold"
          >
            Restaurar
          </button>
          <button
            type="button"
            onClick={() => void ejecutar()}
            disabled={estado === "cargando"}
            className="h-9 rounded-full bg-accent px-4 text-xs font-bold text-accent-foreground disabled:opacity-60"
          >
            {estado === "cargando" ? "Ejecutando…" : "Ejecutar paso a paso"}
          </button>
        </div>
      </div>
      <textarea
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        onKeyDown={teclado}
        spellCheck={false}
        rows={Math.max(6, codigo.split("\n").length + 1)}
        aria-label="Tu código Python"
        className="codigo block w-full resize-y bg-transparent px-5 py-4 text-panel-foreground outline-none"
      />
      <p className="border-t border-panel-foreground/10 px-4 py-2.5 text-xs text-panel-foreground/60">
        {estado === "cargando"
          ? "Preparando Python en tu navegador (la primera vez descarga unos 10 MB)…"
          : estado === "error"
            ? `No se pudo ejecutar: ${mensaje}`
            : "Ctrl + Enter ejecuta. Máximo 400 pasos: un bucle infinito se corta solo. input() no está disponible."}
      </p>
    </div>
  );
}
