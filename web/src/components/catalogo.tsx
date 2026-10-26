import { useMemo, useState } from "react";
import { Encabezamiento } from "@/components/criterio";
import { TarjetaMetodo } from "@/components/tarjeta-metodo";
import { dominio } from "@/domain/conocimiento";
import {
  FAMILIAS,
  METODOS,
  ORDEN_EVIDENCIA,
  T_MAX,
  medicionEn,
  type Evidencia,
  type Metodo,
} from "@/lib/datos";

type Orden = "evidencia" | "dominio" | "minutos";

export function Catalogo() {
  const [familia, setFamilia] = useState<string>("Todas");
  const [evidencia, setEvidencia] = useState<Evidencia | "todas">("todas");
  const [orden, setOrden] = useState<Orden>("evidencia");
  const visibles = useMemo(() => {
    const lista = METODOS.filter(
      (m) =>
        (familia === "Todas" || m.familia === familia) &&
        (evidencia === "todas" || m.evidencia === evidencia),
    );
    const clave = (m: Metodo) =>
      orden === "evidencia"
        ? ORDEN_EVIDENCIA.indexOf(m.evidencia) * 1000 - dominio(medicionEn(m, T_MAX))
        : orden === "dominio"
          ? -dominio(medicionEn(m, T_MAX))
          : m.minutos;
    return [...lista].sort((a, b) => clave(a) - clave(b));
  }, [familia, evidencia, orden]);
  return (
    <section
      id="metodologias"
      aria-labelledby="metodos-titulo"
      className="mx-auto max-w-[1560px] scroll-mt-6 px-5 py-20 sm:px-8 sm:py-24"
    >
      <Encabezamiento
        id="metodos-titulo"
        ceja={`${METODOS.length} propuestas`}
        titulo="Metodologías para elegir, no para creer."
      >
        Cada tarjeta muestra su plan en el tiempo (turquesa antes, ámbar el encuentro, violeta
        después), su evidencia y cuánto desarrolla tu conocimiento en 30 días según el modelo.
        Entra, prueba el ejemplo y valóralo.
      </Encabezamiento>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por familia">
          {["Todas", ...FAMILIAS].map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={familia === f}
              onClick={() => setFamilia(f)}
              className={`h-10 rounded-full px-4 text-sm font-semibold transition-colors ${familia === f ? "bg-primary text-primary-foreground shadow-glow" : "border bg-card text-muted-foreground hover:text-primary"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Filtrar por evidencia"
            value={evidencia}
            onChange={(e) => setEvidencia(e.target.value as Evidencia | "todas")}
            className="h-10 rounded-full border bg-card px-4 text-sm font-semibold"
          >
            <option value="todas">Toda evidencia</option>
            {ORDEN_EVIDENCIA.map((e) => (
              <option key={e} value={e}>
                Evidencia {e}
              </option>
            ))}
          </select>
          <select
            aria-label="Ordenar"
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            className="h-10 rounded-full border bg-card px-4 text-sm font-semibold"
          >
            <option value="evidencia">Ordenar por evidencia</option>
            <option value="dominio">Ordenar por dominio a t=+30</option>
            <option value="minutos">Ordenar por menos tiempo</option>
          </select>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {visibles.map((m, i) => (
          <div
            key={m.id}
            className="animate-float"
            style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
          >
            <TarjetaMetodo metodo={m} />
          </div>
        ))}
      </div>
    </section>
  );
}
