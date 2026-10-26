import { createFileRoute } from "@tanstack/react-router";
import { PaginaNoEncontrada } from "@/components/criterio";

// Se prerenderiza como 404.html; Cloudflare Pages lo sirve para cualquier ruta inexistente.
export const Route = createFileRoute("/404")({
  head: () => ({
    meta: [{ title: "Página no encontrada — Criterio" }, { name: "robots", content: "noindex" }],
  }),
  component: PaginaNoEncontrada,
});
