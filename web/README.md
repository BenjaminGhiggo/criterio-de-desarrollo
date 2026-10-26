# Criterio · web

App construida sobre [aurora-ui](https://github.com/BenjaminGhiggo/aurora-ui) (TanStack Start, React 19, Tailwind 4 y su sistema visual). Se prerenderiza completa a HTML estático y se publica en Cloudflare Pages.

```bash
npm ci
npm test          # paridad del modelo TypeScript con el dominio en Python
npm run typecheck
npm run build     # genera sitemap/llms.txt y prerenderiza en dist/client
```

Los datos (`src/data/criterio.json`) los genera el dominio en Python con `criterio exportar` desde la raíz del repositorio. No se editan a mano.

| Ruta | Contenido |
|---|---|
| `/` | Hero con el protagonista en vivo, el marco t<0 / t=0 / t>0, las 19 metodologías filtrables y la trampa de la sensación de aprender |
| `/metodos/$id` | Idea, evidencia y fuente, plan en el tiempo, trayectoria frente al control, ejemplo interactivo, cómo aplicarla esta semana y tu valoración |
| `/comparar` | Curvas superpuestas, dispersión dominio/tiempo y tabla ordenable |
| `/mi-metodologia` | La combinación de las que elegiste, calculada con `src/domain/conocimiento.ts`, exportable a Markdown |
| `/fundamentos` | Arquitectura DDD, pruebas que codifican la evidencia, supuestos del modelo y propuestas A/B/C |
