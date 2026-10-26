"use strict";

// El sitio solo presenta: las trayectorias de lecciones y simulación vienen
// calculadas por el dominio en Python (criterio exportar -> data.json).

const COLOR = { "t<0": "var(--antes)", "t=0": "var(--origen)", "t>0": "var(--despues)" };
const faseDe = (t) => (t < 0 ? "t<0" : t === 0 ? "t=0" : "t>0");
const signoT = (t) => (t > 0 ? `+${t}` : `${t}`);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const $ = (sel, root = document) => root.querySelector(sel);
const impMarca = (v) => (v > 0 ? '<span class="imp p">+1</span>' : v < 0 ? '<span class="imp n">−1</span>' : '<span class="imp z">0</span>');
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

let DATOS = null;
let FASES = {};

fetch("data.json")
  .then((r) => r.json())
  .then((datos) => {
    DATOS = datos;
    FASES = Object.fromEntries(datos.fases.map((f) => [f.signo, f]));
    pintarFases();
    iniciarHero();
    iniciarLab();
    iniciarSim();
    iniciarQuiz();
  })
  .catch(() => {
    $("#lab-cuerpo").innerHTML = "<p>No se pudieron cargar las lecciones. Recarga la página.</p>";
  });

function pintarFases() {
  $("#fases-def").innerHTML = DATOS.fases
    .map((f) => `<div style="--c:${COLOR[f.signo]}"><dt>${esc(f.signo)} · ${esc(f.nombre)}</dt><dd>${esc(f.pregunta)}</dd></div>`)
    .join("");
}

// --- Hero: eje del tiempo arrastrable --------------------------------------

function iniciarHero() {
  const eje = $("#eje-hero");
  const marcador = $(".eje-marcador", eje);
  const valor = $(".eje-valor", eje);
  const MIN = -5, MAX = 5;
  let t = -3;
  let tocado = false;

  $(".eje-ticks", eje).innerHTML = Array.from({ length: MAX - MIN + 1 }, (_, i) => {
    const v = MIN + i;
    return `<span style="left:${(i / (MAX - MIN)) * 100}%">${v}</span>`;
  }).join("");

  const pintar = () => {
    const fase = FASES[faseDe(t)];
    const c = COLOR[fase.signo];
    marcador.style.left = `${((t - MIN) / (MAX - MIN)) * 100}%`;
    for (const el of [eje, $(".fase-hero")]) el.style.setProperty("--c", c);
    valor.textContent = `t = ${t}`;
    $("#hero-signo").textContent = fase.signo.replace("<", " < ").replace(">", " > ").replace("=", " = ");
    $("#hero-nombre").textContent = fase.nombre;
    $("#hero-pregunta").textContent = fase.pregunta;
    eje.setAttribute("aria-valuenow", t);
    eje.setAttribute("aria-valuetext", `t igual a ${t}, fase ${fase.nombre}`);
  };

  const desdePuntero = (e) => {
    const r = eje.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - r.left, 0), r.width);
    t = Math.round(MIN + (x / r.width) * (MAX - MIN));
    pintar();
  };

  eje.addEventListener("pointerdown", (e) => {
    tocado = true;
    eje.setPointerCapture(e.pointerId);
    eje.classList.add("arrastrando");
    desdePuntero(e);
  });
  eje.addEventListener("pointermove", (e) => eje.hasPointerCapture(e.pointerId) && desdePuntero(e));
  eje.addEventListener("pointerup", () => eje.classList.remove("arrastrando"));
  eje.addEventListener("keydown", (e) => {
    const delta = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
    if (e.key === "Home") t = MIN;
    else if (e.key === "End") t = MAX;
    else if (delta) t = Math.min(MAX, Math.max(MIN, t + delta));
    else return;
    e.preventDefault();
    tocado = true;
    pintar();
  });

  pintar();
  // Movimiento ambiental: el tiempo avanza solo hasta que alguien lo toma.
  if (!reduceMotion) {
    const ciclo = [-3, -1, 0, 2, 4];
    let i = 0;
    const id = setInterval(() => {
      if (tocado) return clearInterval(id);
      i = (i + 1) % ciclo.length;
      t = ciclo[i];
      pintar();
    }, 2600);
  }
}

// --- Laboratorio -----------------------------------------------------------

const lab = { leccion: null, camino: null, t: 0 };

function iniciarLab() {
  const tabs = $("#lab-lecciones");
  tabs.innerHTML = DATOS.lecciones
    .map((l, i) => `<button class="tab" role="tab" id="tab-${l.id}" aria-selected="${i === 0}" data-id="${l.id}"><small>${esc(l.concepto)}</small>${esc(l.titulo)}</button>`)
    .join("");
  tabs.addEventListener("click", (e) => {
    const b = e.target.closest(".tab");
    if (b) elegirLeccion(b.dataset.id);
  });
  tabs.addEventListener("keydown", (e) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const ids = DATOS.lecciones.map((l) => l.id);
    const i = ids.indexOf(lab.leccion.id) + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1);
    const id = ids[(i + ids.length) % ids.length];
    elegirLeccion(id);
    $(`#tab-${id}`).focus();
    e.preventDefault();
  });
  elegirLeccion(DATOS.lecciones[0].id);
}

function elegirLeccion(id) {
  lab.leccion = DATOS.lecciones.find((l) => l.id === id);
  lab.camino = lab.leccion.caminos[0].clave;
  lab.t = lab.leccion.t_inicial;
  for (const b of document.querySelectorAll(".tab")) b.setAttribute("aria-selected", String(b.dataset.id === id));
  $("#lab-cuerpo").setAttribute("aria-labelledby", `tab-${id}`);
  pintarLab(true);
}

function pintarLab(estructura = false) {
  const L = lab.leccion;
  const cuerpo = $("#lab-cuerpo");
  const final = lab.t === L.t_final;

  if (estructura) {
    const ticks = [];
    for (let t = L.t_inicial; t <= L.t_final; t++) ticks.push(`<span class="${t === 0 ? "cero" : ""}">${t}</span>`);
    cuerpo.innerHTML = `
      <p class="lab-concepto">${esc(L.concepto)}</p>
      <h3>${esc(L.titulo)}</h3>
      <p class="lab-pregunta">${esc(L.pregunta)}</p>
      <p class="lab-contexto">${esc(L.contexto)}</p>
      <div class="caminos" role="group" aria-label="Camino elegido en t=0">
        <span class="caminos-etiqueta">Camino que se elige en t=0</span>
        <span class="caminos-chips"></span>
      </div>
      <div class="reloj">
        <button type="button" data-acc="atras" aria-label="Retroceder un instante">‹</button>
        <div class="rango">
          <input type="range" min="${L.t_inicial}" max="${L.t_final}" step="1" aria-label="Instante t">
          <div class="rango-ticks" aria-hidden="true">${ticks.join("")}</div>
        </div>
        <button type="button" data-acc="adelante" aria-label="Avanzar un instante">›</button>
      </div>
      <div class="ubicacion" aria-live="polite"></div>
      <div class="columnas"></div>
      <div class="balance"></div>
      <div class="revelacion-slot"></div>`;
    $(".caminos-chips", cuerpo).addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      lab.camino = b.dataset.clave;
      pintarLab();
    });
    $("input[type=range]", cuerpo).addEventListener("input", (e) => {
      lab.t = Number(e.target.value);
      pintarLab();
    });
    cuerpo.querySelector("[data-acc=atras]").addEventListener("click", () => mover(-1));
    cuerpo.querySelector("[data-acc=adelante]").addEventListener("click", () => mover(1));
  }

  const camino = L.caminos.find((c) => c.clave === lab.camino);
  const paso = camino.trayectoria.find((p) => p.t === lab.t);
  const fase = FASES[paso.fase];
  const c = COLOR[paso.fase];
  cuerpo.style.setProperty("--c", c);

  const revelar = final;
  $(".caminos-chips", cuerpo).innerHTML = L.caminos
    .map((k) => `<button type="button" class="chip" data-clave="${k.clave}" aria-pressed="${k.clave === lab.camino}">${esc(k.titulo)}${revelar && k.recomendada ? '<span class="rec">recomendado</span>' : ""}</button>`)
    .join(" ");

  const rango = $("input[type=range]", cuerpo);
  rango.value = lab.t;
  rango.setAttribute("aria-valuetext", `t igual a ${lab.t}, ${fase.nombre}`);
  cuerpo.querySelector("[data-acc=atras]").disabled = lab.t <= L.t_inicial;
  cuerpo.querySelector("[data-acc=adelante]").disabled = lab.t >= L.t_final;

  $(".ubicacion", cuerpo).innerHTML = `
    <span class="ubic-t">t = ${signoT(lab.t)}</span>
    <span class="ubic-fase">${esc(fase.nombre)}</span>
    <span class="estado" data-e="${esc(paso.estado)}">${esc(paso.estado)}${paso.elegida ? ` · balance ${signoT(paso.balance)}` : ""}</span>
    <span class="ubic-preg">${esc(fase.pregunta)}</span>`;

  // Antes: las fuerzas aparecen a medida que se descubren.
  const fuerzas = L.fuerzas
    .map((f) => (paso.fuerzas.includes(f.nombre)
      ? `<li><b>${esc(f.nombre)}</b>${esc(f.descripcion)}</li>`
      : '<li class="oculta"><b>· · ·</b>por descubrir</li>'))
    .join("");
  const opciones = paso.opciones.length
    ? `<h4 style="margin-top:18px">Alternativas</h4><ul>${L.caminos.map((k) => `<li>${esc(k.titulo)}</li>`).join("")}</ul>`
    : "";

  let decision;
  if (paso.elegida) {
    const cita = paso.justificacion.map((j) => `<b>${esc(j)}</b>`).join(", ");
    decision = `<ul><li><b>Se eligió</b>${esc(camino.titulo)}</li></ul><pre><code>${esc(camino.codigo)}</code></pre><p class="porque">Porque: ${cita}</p>`;
  } else {
    decision = '<p class="vacio">Todavía no se decide. Sin fuerzas y sin alternativas, cualquier elección sería costumbre.</p>';
  }

  const consecuencias = paso.consecuencias.length
    ? `<ul>${paso.consecuencias.map((q) => `<li><b>t = ${signoT(q.t)}</b>${impMarca(q.impacto)} ${esc(q.descripcion)}</li>`).join("")}</ul>`
    : `<p class="vacio">${paso.elegida ? "Aún no hay consecuencias observadas." : "No hay consecuencias de algo que no se decidió."}</p>`;

  const clase = (signo) => (paso.fase === signo ? "col activa" : faseOrden(signo) > faseOrden(paso.fase) ? "col futuro" : "col");
  $(".columnas", cuerpo).innerHTML = `
    <div class="${clase("t<0")}" style="--c:var(--antes)"><h4>t &lt; 0 · Fuerzas</h4><ul>${fuerzas}</ul>${opciones}</div>
    <div class="${clase("t=0")}" style="--c:var(--origen)"><h4>t = 0 · Decisión</h4>${decision}</div>
    <div class="${clase("t>0")}" style="--c:var(--despues)"><h4>t &gt; 0 · Consecuencias</h4>${consecuencias}</div>`;

  $(".balance", cuerpo).innerHTML = `<h4>Balance de consecuencias por camino</h4>${graficoBalance(L)}`;

  $(".revelacion-slot", cuerpo).innerHTML = revelar
    ? `<div class="revelacion"><p class="titulo">Por qué ${esc(L.caminos.find((k) => k.recomendada).titulo.toLowerCase())}</p><p>${esc(L.explicacion)}</p></div>`
    : "";
}

const faseOrden = (s) => ({ "t<0": 0, "t=0": 1, "t>0": 2 })[s];

function mover(delta) {
  const L = lab.leccion;
  lab.t = Math.min(L.t_final, Math.max(L.t_inicial, lab.t + delta));
  pintarLab();
}

const PALETA = ["var(--antes)", "var(--origen)", "var(--despues)"];

function graficoBalance(L) {
  const W = 640, H = 150, P = 28;
  const ts = [];
  for (let t = 0; t <= L.t_final; t++) ts.push(t);
  const todos = L.caminos.flatMap((k) => k.trayectoria.filter((p) => p.t >= 0).map((p) => p.balance));
  const lo = Math.min(-1, ...todos), hi = Math.max(1, ...todos);
  const x = (t) => P + (t / L.t_final) * (W - 2 * P);
  const y = (v) => P / 2 + ((hi - v) / (hi - lo)) * (H - P * 1.5);
  const lineas = L.caminos.map((k, i) => {
    const pts = k.trayectoria.filter((p) => p.t >= 0 && p.t <= Math.max(lab.t, 0)).map((p) => `${x(p.t)},${y(p.balance)}`).join(" ");
    const sel = k.clave === lab.camino;
    return `<polyline points="${pts}" fill="none" stroke="${PALETA[i % 3]}" stroke-width="${sel ? 3.5 : 1.5}" stroke-opacity="${sel ? 1 : 0.5}" stroke-linejoin="round" stroke-linecap="round"/>`;
  }).join("");
  const ejeX = ts.map((t) => `<text x="${x(t)}" y="${H - 4}" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="JetBrains Mono">${t}</text>`).join("");
  const cursor = lab.t >= 0 ? `<line x1="${x(lab.t)}" x2="${x(lab.t)}" y1="6" y2="${H - 18}" stroke="var(--c)" stroke-dasharray="3 4"/>` : "";
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Balance acumulado de cada camino desde t=0 hasta t=${L.t_final}">
    <line x1="${P}" x2="${W - P}" y1="${y(0)}" y2="${y(0)}" stroke="var(--line)"/>
    <text x="4" y="${y(0) + 4}" font-size="11" fill="var(--muted)" font-family="JetBrains Mono">0</text>
    ${cursor}${lineas}${ejeX}</svg>`;
  const leyenda = L.caminos.map((k, i) => `<span style="--lc:${PALETA[i % 3]}" class="${k.clave === lab.camino ? "sel" : ""}">${esc(k.titulo)}</span>`).join("");
  const nota = lab.t < 0 ? '<p class="vacio" style="font-size:13px;color:var(--muted)">El balance empieza a existir en t = 0.</p>' : "";
  return svg + `<div class="leyenda">${leyenda}</div>` + nota;
}

// --- Simulación del costo de cambio ---------------------------------------

const ESTR = [
  { clave: "tdd", nombre: "TDD", color: "var(--antes)" },
  { clave: "pruebas-despues", nombre: "Pruebas después", color: "var(--origen)" },
  { clave: "sin-pruebas", nombre: "Sin pruebas", color: "var(--neg)" },
];

function iniciarSim() {
  const sim = $("#sim");
  const trays = ESTR.map((e) => DATOS.simulacion[e.clave].trayectoria);
  const tMin = trays[0][0].t, tMax = trays[0].at(-1).t;
  let tSel = tMax;
  const W = 760, H = 300, PL = 40, PR = 16, PT = 16, PB = 34;
  const yMax = Math.ceil(Math.max(...trays.flat().filter((p) => p.publicado).map((p) => p.costo)));
  const x = (t) => PL + ((t - tMin) / (tMax - tMin)) * (W - PL - PR);
  const y = (v) => PT + (1 - v / yMax) * (H - PT - PB);

  const pintar = () => {
    const fase = faseDe(tSel);
    sim.style.setProperty("--c", COLOR[fase]);
    const grid = Array.from({ length: yMax + 1 }, (_, v) => `<line x1="${PL}" x2="${W - PR}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-opacity=".6"/><text x="${PL - 10}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--muted)" font-family="JetBrains Mono">${v}</text>`).join("");
    const ejeX = [];
    for (let t = tMin; t <= tMax; t++) ejeX.push(`<text x="${x(t)}" y="${H - 10}" text-anchor="middle" font-size="11" fill="${t === 0 ? "var(--origen)" : "var(--muted)"}" font-family="JetBrains Mono">${t}</text>`);
    const lineas = ESTR.map((e, i) => {
      const pts = trays[i].filter((p) => p.publicado).map((p) => `${x(p.t)},${y(p.costo)}`).join(" ");
      const punto = trays[i].find((p) => p.t === tSel);
      const marca = punto.publicado ? `<circle cx="${x(tSel)}" cy="${y(punto.costo)}" r="5" fill="var(--panel)" stroke="${e.color}" stroke-width="2.5"/>` : "";
      return `<polyline points="${pts}" fill="none" stroke="${e.color}" stroke-width="2.5" stroke-linejoin="round"/>${marca}`;
    }).join("");
    const antes = `<rect x="${PL}" y="${PT}" width="${x(0) - PL}" height="${H - PT - PB}" fill="var(--antes)" fill-opacity=".06"/>
      <text x="${(PL + x(0)) / 2}" y="${PT + 18}" text-anchor="middle" font-size="12" fill="var(--antes)" font-family="JetBrains Mono">diseño</text>
      <line x1="${x(0)}" x2="${x(0)}" y1="${PT}" y2="${H - PB}" stroke="var(--origen)" stroke-width="1.5"/>
      <text x="${x(0) + 6}" y="${PT + 18}" font-size="12" fill="var(--origen)" font-family="JetBrains Mono">publicación</text>`;
    const cursor = `<line x1="${x(tSel)}" x2="${x(tSel)}" y1="${PT}" y2="${H - PB}" stroke="var(--c)" stroke-dasharray="3 4"/>`;
    sim.innerHTML = `
      <p class="sim-t">t = ${signoT(tSel)} · ${esc(FASES[fase].nombre)}</p>
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Costo de cambio por estrategia en el tiempo">${antes}${grid}${cursor}${lineas}${ejeX.join("")}<rect class="captura" x="${PL}" y="0" width="${W - PL - PR}" height="${H}" fill="transparent"/></svg>
      <input type="range" min="${tMin}" max="${tMax}" value="${tSel}" aria-label="Instante t de la simulación" style="width:100%;accent-color:var(--c)">
      <div class="sim-tabla">${ESTR.map((e, i) => fichaSim(e, trays[i].find((p) => p.t === tSel), DATOS.simulacion[e.clave].descripcion)).join("")}</div>`;
    $("input", sim).addEventListener("input", (ev) => { tSel = Number(ev.target.value); pintar(); $("input", sim).focus(); });
    const svg = $("svg", sim);
    svg.addEventListener("pointermove", (ev) => {
      const r = svg.getBoundingClientRect();
      const px = ((ev.clientX - r.left) / r.width) * W;
      const t = Math.round(tMin + ((px - PL) / (W - PL - PR)) * (tMax - tMin));
      const nuevo = Math.min(tMax, Math.max(tMin, t));
      if (nuevo !== tSel) { tSel = nuevo; pintar(); }
    });
  };
  pintar();
}

function fichaSim(e, p, descripcion) {
  const filas = p.publicado
    ? `<dt>costo</dt><dd>${p.costo.toFixed(2)}</dd><dt>deuda</dt><dd>${p.deuda}</dd><dt>cobertura</dt><dd>${Math.round(p.cobertura * 100)}%</dd><dt>riesgo</dt><dd class="riesgo-${p.riesgo}">${p.riesgo}</dd>`
    : `<dt>estado</dt><dd>sin publicar</dd><dt>pruebas antes</dt><dd>${p.pruebas_primero}</dd>`;
  return `<div style="--lc:${e.color}"><h4>${esc(e.nombre)}</h4><p>${esc(descripcion)}</p><dl>${filas}</dl></div>`;
}

// --- Quiz: Propuesta B aplicada a quien visita ----------------------------

const CLAVE_QUIZ = "criterio.aprendiz.v1";
const quizInicial = () => ({ diagnostico: null, meta: null, criterio: 0, racha: 0, consciente: false, resueltas: [], historial: [], ultimo: null });
let Q = quizInicial();

function cargarQuiz() {
  try { Q = { ...quizInicial(), ...JSON.parse(localStorage.getItem(CLAVE_QUIZ) || "{}") }; } catch { Q = quizInicial(); }
}
function guardarQuiz() {
  try { localStorage.setItem(CLAVE_QUIZ, JSON.stringify(Q)); } catch { /* sin almacenamiento */ }
}

function etapaActual() {
  const R = DATOS.aprendiz;
  if (Q.criterio >= R.umbral_maestria && Q.racha >= R.racha_maestria) return "COMPETENCIA_INCONSCIENTE";
  if (Q.criterio >= R.umbral_competencia) return "COMPETENCIA_CONSCIENTE";
  if (Q.consciente) return "INCOMPETENCIA_CONSCIENTE";
  return "INCOMPETENCIA_INCONSCIENTE";
}

function iniciarQuiz() {
  cargarQuiz();
  pintarQuiz();
}

function pintarQuiz() {
  const raiz = $("#quiz");
  const t = Q.meta === null ? (Q.diagnostico === null ? -1 : 0) : Q.resueltas.length;
  const fase = faseDe(t);
  raiz.style.setProperty("--c", COLOR[fase]);
  const nombreEtapa = etapaActual().toLowerCase().replaceAll("_", " ");
  raiz.innerHTML = `
    <aside class="tablero" aria-live="polite">
      <p class="t">t = ${signoT(t)}</p>
      <p class="etapa">${esc(nombreEtapa.charAt(0).toUpperCase() + nombreEtapa.slice(1))}</p>
      <p class="etapa-desc">${esc(DATOS.aprendiz.etapas[etapaActual()])}</p>
      <div class="medidor" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Q.criterio}" aria-label="Criterio"><span style="width:${Q.criterio}%"></span></div>
      <dl><dt>criterio</dt><dd>${Q.criterio} / 100</dd><dt>racha justificada</dt><dd>${Q.racha}</dd><dt>lecciones</dt><dd>${Q.resueltas.length} / ${DATOS.lecciones.length}</dd></dl>
      ${graficoCriterio()}
      <button class="reiniciar" type="button">Volver a t &lt; 0</button>
    </aside>
    <div class="paso">${pasoQuiz()}</div>`;
  $(".reiniciar", raiz).addEventListener("click", () => { Q = quizInicial(); guardarQuiz(); pintarQuiz(); });
  enlazarPaso(raiz);
}

function graficoCriterio() {
  if (Q.historial.length < 2) return "";
  const W = 260, H = 70;
  const ts = Q.historial.map((h) => h.t);
  const tMin = Math.min(...ts), tMax = Math.max(...ts);
  const x = (t) => 6 + ((t - tMin) / Math.max(1, tMax - tMin)) * (W - 12);
  const y = (v) => 6 + (1 - v / 100) * (H - 12);
  const pts = Q.historial.map((h) => `${x(h.t)},${y(h.criterio)}`).join(" ");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución de tu criterio"><line x1="${x(0)}" x2="${x(0)}" y1="0" y2="${H}" stroke="var(--origen)" stroke-opacity=".5"/><polyline points="${pts}" fill="none" stroke="var(--despues)" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
}

function pasoQuiz() {
  if (Q.diagnostico === null) {
    return `<h3>t &lt; 0 · Diagnóstico</h3>
      <p class="contexto">Antes de empezar, ¿desde dónde partes? Cuando eliges un patrón, ¿sabrías explicar por qué ese y no otro?</p>
      <fieldset><legend>Autodiagnóstico</legend>
        <input type="range" id="diag" min="0" max="40" value="15" aria-describedby="diag-v">
        <p id="diag-v" class="contexto"></p></fieldset>
      <button class="primario" data-acc="diagnosticar">Registrar diagnóstico en t = −1</button>`;
  }
  if (Q.meta === null) {
    return `<h3>t = 0 · Compromiso</h3>
      <p class="contexto">El diagnóstico quedó en ${Q.diagnostico}. Ahora decide para qué vas a practicar. Sin meta no hay dirección.</p>
      <fieldset><legend>Tu meta</legend><input type="text" id="meta" value="Entender por qué uso cada patrón" maxlength="120"></fieldset>
      <button class="primario" data-acc="comprometer">Comprometerme en t = 0</button>`;
  }
  const pendiente = DATOS.lecciones.find((l) => !Q.resueltas.includes(l.id));
  const feedback = Q.ultimo ? feedbackQuiz() : "";
  if (!pendiente) {
    return `${feedback}<h3>Recorriste todas las lecciones</h3><p class="contexto">Tu criterio terminó en ${Q.criterio}. Vuelve al laboratorio y mira los caminos que no elegiste: ahí está la otra mitad del aprendizaje.</p>`;
  }
  const t = Q.resueltas.length + 1;
  return `${feedback}
    <h3>t = +${t} · ${esc(pendiente.titulo)}</h3>
    <p>${esc(pendiente.pregunta)}</p>
    <p class="contexto">${esc(pendiente.contexto)}</p>
    <form data-id="${pendiente.id}">
      <fieldset><legend>¿Qué eliges?</legend>
        ${pendiente.caminos.map((k) => `<label class="opcion"><input type="radio" name="op" value="${k.clave}" required><span>${esc(k.titulo)}</span></label>`).join("")}
      </fieldset>
      <fieldset><legend>¿Por qué? Marca las fuerzas que justifican tu elección</legend>
        ${pendiente.fuerzas.map((f) => `<label class="opcion"><input type="checkbox" name="fz" value="${f.nombre}"><span>${esc(f.nombre)}<small>${esc(f.descripcion)}</small></span></label>`).join("")}
      </fieldset>
      <button class="primario" type="submit">Decidir</button>
    </form>`;
}

function feedbackQuiz() {
  const u = Q.ultimo;
  const L = DATOS.lecciones.find((l) => l.id === u.id);
  const rec = L.caminos.find((k) => k.recomendada);
  const elegido = L.caminos.find((k) => k.clave === u.eleccion);
  const final = elegido.trayectoria.at(-1);
  const mensaje = u.acerto && u.justifico ? "Elegiste bien y sabes por qué."
    : u.acerto ? "Elegiste bien, pero sin las fuerzas que lo justifican: la próxima vez puede ser azar."
    : u.justifico ? "No era el mejor camino, pero razonaste con las fuerzas correctas: eso también enseña."
    : "Ni el camino ni el porqué. Mira las consecuencias que tuvo.";
  return `<div class="feedback" role="status">
    <p class="puntos ${u.puntos >= 0 ? "p" : "n"}">${u.puntos >= 0 ? "+" : ""}${u.puntos}</p>
    <p>${esc(mensaje)}</p>
    <p class="contexto">Tu camino, <b>${esc(elegido.titulo)}</b>, terminó <b>${esc(final.estado)}</b> con balance ${signoT(final.balance)}. Recomendado: <b>${esc(rec.titulo)}</b>, por ${L.justificacion.map(esc).join(", ")}.</p>
  </div><p style="height:12px"></p>`;
}

function enlazarPaso(raiz) {
  const diag = $("#diag", raiz);
  if (diag) {
    const v = $("#diag-v", raiz);
    const texto = () => { v.textContent = `${diag.value} de 40. ${diag.value < 14 ? "Sigo recetas, no siempre sé por qué." : diag.value < 28 ? "A veces puedo justificar mis elecciones." : "Casi siempre puedo explicar mis decisiones."}`; };
    diag.addEventListener("input", texto);
    texto();
  }
  raiz.querySelector("[data-acc=diagnosticar]")?.addEventListener("click", () => {
    Q.diagnostico = Number(diag.value);
    Q.criterio = Q.diagnostico;
    Q.historial = [{ t: -1, criterio: Q.criterio }];
    guardarQuiz();
    pintarQuiz();
  });
  raiz.querySelector("[data-acc=comprometer]")?.addEventListener("click", () => {
    Q.meta = $("#meta", raiz).value.trim() || "Practicar el porqué";
    Q.historial.push({ t: 0, criterio: Q.criterio });
    guardarQuiz();
    pintarQuiz();
  });
  const form = $("form", raiz);
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const L = DATOS.lecciones.find((l) => l.id === form.dataset.id);
    const eleccion = new FormData(form).get("op");
    const fuerzas = new FormData(form).getAll("fz");
    const acerto = eleccion === L.recomendada;
    // Justificar es citar al menos una fuerza que de verdad sostiene la decisión
    // recomendada, sin apoyarse en la fuerza que tienta al atajo.
    const justifico = fuerzas.some((f) => L.justificacion.includes(f)) && !fuerzas.includes(L.fuerzas[0].nombre);
    const puntos = DATOS.aprendiz.puntos[`${+acerto}${+justifico}`];
    Q.criterio = Math.min(100, Math.max(0, Q.criterio + puntos));
    Q.racha = acerto && justifico ? Q.racha + 1 : 0;
    Q.consciente = Q.consciente || justifico;
    Q.resueltas.push(L.id);
    Q.historial.push({ t: Q.resueltas.length, criterio: Q.criterio });
    Q.ultimo = { id: L.id, eleccion, acerto, justifico, puntos };
    guardarQuiz();
    pintarQuiz();
    $("#quiz .paso").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
}
