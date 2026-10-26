import { createFileRoute } from "@tanstack/react-router";
import { Catalogo } from "@/components/catalogo";
import { METODOS } from "@/lib/datos";

const URL_SITIO = "https://criterio.benjacode.com";

export const Route = createFileRoute("/metodologias")({
  head: () => ({
    meta: [
      { title: "19 metodologías de aprendizaje aplicadas a Python, DDD y TDD — Criterio" },
      {
        name: "description",
        content:
          "Recuperación, repetición espaciada, fracaso productivo, PRIMM, Feynman, TDD, pre-mortem y más: cada una con evidencia, fuente, un ejemplo interactivo y su efecto medido en el tiempo.",
      },
      { property: "og:url", content: `${URL_SITIO}/metodologias` },
    ],
    links: [{ rel: "canonical", href: `${URL_SITIO}/metodologias` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Metodologías de aprendizaje",
          itemListElement: METODOS.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: m.nombre,
            url: `${URL_SITIO}/metodos/${m.id}`,
          })),
        }),
      },
    ],
  }),
  component: () => (
    <main className="pt-4">
      <Catalogo />
    </main>
  ),
});
