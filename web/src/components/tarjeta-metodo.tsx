import { Link } from "@tanstack/react-router";
import { InsigniaEvidencia, MiniPlan } from "@/components/criterio";
import { dominio } from "@/domain/conocimiento";
import { T_MAX, medicionEn, type Metodo } from "@/lib/datos";
import { usePreferencias } from "@/lib/preferencias";

export function TarjetaMetodo({ metodo }: { metodo: Metodo }) {
  const { prefs } = usePreferencias();
  const v = prefs[metodo.id];
  const final = medicionEn(metodo, T_MAX);
  return (
    <Link
      to="/metodos/$id"
      params={{ id: metodo.id }}
      className="group flex h-full flex-col rounded-2xl border bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase text-primary">{metodo.familia}</p>
        <InsigniaEvidencia nivel={metodo.evidencia} />
      </div>
      <h3 className="mt-3 font-display text-xl font-bold leading-tight group-hover:text-primary">
        {metodo.nombre}
      </h3>
      <p className="mt-2 flex-1 text-[15px] leading-6 text-muted-foreground">{metodo.resumen}</p>
      <div className="mt-5">
        <MiniPlan plan={metodo.plan} />
      </div>
      <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
        <span className="text-muted-foreground">
          Dominio a t=+30{" "}
          <strong className="font-mono text-foreground">{dominio(final).toFixed(0)}</strong>
        </span>
        <span className="text-muted-foreground">
          <strong className="font-mono text-foreground">{metodo.minutos}</strong> min
        </span>
      </div>
      {(v?.elegida || v?.nota) && (
        <p className="mt-3 flex gap-2 text-xs font-bold">
          {v.elegida && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-primary-foreground">
              Elegida
            </span>
          )}
          {v.nota && (
            <span className="rounded-full bg-accent/30 px-2.5 py-1">Tu nota {v.nota}/5</span>
          )}
        </p>
      )}
    </Link>
  );
}
