// Python real en el navegador. Se descarga solo cuando alguien pide ejecutar
// su propio código (~10 MB la primera vez; luego queda en la caché).
import type { Traza } from "@/lib/ruta";

const VERSION = "314.0.7";
const BASE = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;

type Pyodide = {
  runPython: (codigo: string) => unknown;
  globals: { get: (nombre: string) => (codigo: string) => string };
};

let cargando: Promise<Pyodide> | null = null;

export function cargarPython(): Promise<Pyodide> {
  if (!cargando) {
    cargando = (async () => {
      const modulo = (await import(/* @vite-ignore */ `${BASE}pyodide.mjs`)) as {
        loadPyodide: (opciones: { indexURL: string }) => Promise<Pyodide>;
      };
      const [py, motor] = await Promise.all([
        modulo.loadPyodide({ indexURL: BASE }),
        fetch("/motor.py").then((r) => r.text()),
      ]);
      py.runPython(motor);
      return py;
    })();
    cargando.catch(() => {
      cargando = null;
    });
  }
  return cargando;
}

export async function ejecutarEnNavegador(codigo: string): Promise<Traza> {
  const py = await cargarPython();
  return JSON.parse(py.globals.get("ejecutar_json")(codigo)) as Traza;
}
