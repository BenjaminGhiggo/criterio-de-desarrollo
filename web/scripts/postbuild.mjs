// 404.html se sirve en cualquier URL inexistente. Si se hidratara, el router
// esperaría estar en /404 y fallaría; como es estática, se publica sin scripts.
import { readFileSync, writeFileSync } from "node:fs";

const ruta = new URL("../dist/client/404.html", import.meta.url);
const html = readFileSync(ruta, "utf-8")
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
  .replace(/<link rel="modulepreload"[^>]*>/g, "");
writeFileSync(ruta, html);
console.log("404.html sin scripts de hidratación");
