// Genera public/sitemap.xml y public/llms.txt a partir de los datos del dominio.
// Se ejecuta antes de cada build (ver "prebuild" en package.json).
import { readFileSync, writeFileSync } from "node:fs";

const SITIO = "https://criterio.benjacode.com";
const datos = JSON.parse(
  readFileSync(new URL("../src/data/criterio.json", import.meta.url), "utf-8"),
);
const metodos = datos.metodologias.metodos;

const rutas = [
  "/",
  "/comparar",
  "/mi-metodologia",
  "/fundamentos",
  ...metodos.map((m) => `/metodos/${m.id}`),
];
writeFileSync(
  new URL("../public/sitemap.xml", import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rutas.map((r) => `  <url><loc>${SITIO}${r}</loc></url>`).join("\n")}\n</urlset>\n`,
);

const porFamilia = datos.metodologias.familias
  .map((f) => {
    const lista = metodos
      .filter((m) => m.familia === f)
      .map(
        (m) =>
          `- [${m.nombre}](${SITIO}/metodos/${m.id}): ${m.resumen} Evidencia ${m.evidencia}. Fuente: ${m.fuente}.`,
      );
    return `### ${f}\n${lista.join("\n")}`;
  })
  .join("\n\n");

writeFileSync(
  new URL("../public/llms.txt", import.meta.url),
  `# Criterio

> Sistema para aprender el porqué de las decisiones de desarrollo en Python, con Domain Driven Design y Test Driven Development. El protagonista es tu conocimiento de un concepto, medido en el tiempo: antes de encontrarlo (t<0), en el encuentro (t=0) y después (t>0). Compara ${metodos.length} metodologías de aprendizaje, cada una con un ejemplo interactivo, y elige las que te hacen aprender.

## Páginas
- [Metodologías](${SITIO}/): catálogo filtrable por familia y evidencia.
- [Comparar](${SITIO}/comparar): tabla y curvas de retención, comprensión, transferencia y criterio a 30 días.
- [Mi metodología](${SITIO}/mi-metodologia): combina las metodologías elegidas en un solo plan.
- [Fundamentos](${SITIO}/fundamentos): arquitectura DDD, pruebas que codifican la evidencia y supuestos del modelo.

## Metodologías
${porFamilia}

## Nota sobre el modelo
Las trayectorias vienen de un modelo ilustrativo en Python, calibrado para respetar hallazgos de la investigación (efecto de prueba, espaciado, ilusión de fluidez, fracaso productivo, intercalado). Sirve para comparar metodologías, no para predecir resultados individuales.

## Código
- https://github.com/BenjaminGhiggo/criterio-de-desarrollo
`,
);
console.log(`sitemap.xml (${rutas.length} rutas) y llms.txt generados`);
