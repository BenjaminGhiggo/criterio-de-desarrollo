// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Sitio 100% estático: cada ruta se prerenderiza a HTML y se publica en
  // Cloudflare Pages. No hace falta un servidor SSR en producción.
  nitro: false,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
    // Sin subcarpetas: /comparar se escribe como comparar.html y Cloudflare Pages
    // lo sirve en /comparar sin redirigir a /comparar/.
    prerender: { enabled: true, crawlLinks: true, failOnError: true, autoSubfolderIndex: false },
    // /404 se escribe como 404.html: Pages lo usa (con estado 404) para rutas inexistentes.
    pages: [{ path: "/404" }],
  },
});
