// Genera public/sitemap.xml y public/llms.txt a partir de los datos del dominio.
// Se ejecuta antes de cada build (ver "prebuild" en package.json).
import { readFileSync, writeFileSync } from "node:fs";

const SITIO = "https://criterio.benjacode.com";
const leer = (ruta) => JSON.parse(readFileSync(new URL(ruta, import.meta.url), "utf-8"));
const datos = leer("../src/data/criterio.json");
const { lecciones } = leer("../src/data/ruta.json");
const metodos = datos.metodologias.metodos;

const rutas = [
  "/",
  "/aprende",
  ...lecciones.map((l) => `/aprende/${l.id}`),
  "/metodologias",
  ...metodos.map((m) => `/metodos/${m.id}`),
  "/comparar",
  "/mi-metodologia",
  "/fundamentos",
];
const urls = rutas.map((r) => `  <url><loc>${SITIO}${r}</loc></url>`).join("\n");
writeFileSync(
  new URL("../public/sitemap.xml", import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

const listaLecciones = lecciones
  .map((l) => `- [${l.orden}. ${l.titulo}](${SITIO}/aprende/${l.id}): ${l.objetivo}`)
  .join("\n");
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

> Aprende a programar en Python desde Hola mundo viendo, paso a paso, qué se ejecuta primero y dónde vive cada variable en memoria (marcos en la pila, objetos en el montón). ${lecciones.length} lecciones hasta un agregado de Domain Driven Design con Test Driven Development, cada una trabajada con metodologías de aprendizaje medidas en el tiempo: antes (t<0), en (t=0) y después (t>0).

## Ruta de lecciones
${listaLecciones}

## Páginas
- [Ruta](${SITIO}/aprende): las lecciones por unidad, con tu avance.
- [Metodologías](${SITIO}/metodologias): catálogo filtrable por familia y evidencia.
- [Comparar](${SITIO}/comparar): curvas de retención, comprensión, transferencia y criterio a 30 días.
- [Mi metodología](${SITIO}/mi-metodologia): combina las metodologías elegidas en un solo plan.
- [Fundamentos](${SITIO}/fundamentos): arquitectura DDD, pruebas que codifican la evidencia y supuestos del modelo.

## Metodologías
${porFamilia}

## Cómo funciona el paso a paso
Un motor en Python ejecuta el código real con sys.settrace y registra en cada paso la pila de marcos, los objetos con su dirección, la salida y el orden de evaluación de la línea siguiente. El mismo motor corre en el navegador con Pyodide para ejecutar el código que escribas.

## Nota sobre el modelo de aprendizaje
Las trayectorias de las metodologías vienen de un modelo ilustrativo en Python, calibrado para respetar hallazgos de la investigación. Sirve para comparar metodologías, no para predecir resultados individuales.

## Código
- https://github.com/BenjaminGhiggo/criterio-de-desarrollo
`,
);
console.log(`sitemap.xml (${rutas.length} rutas) y llms.txt generados`);
