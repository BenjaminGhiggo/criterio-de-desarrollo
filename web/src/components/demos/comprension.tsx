import { Fragment, useState } from "react";
import { Accion, Codigo, Nota, Opcion, Pasos, Pregunta, Retro } from "./kit";

// ── Fracaso productivo ───────────────────────────────────────────────────

const INTENTOS = [
  { clave: "float", titulo: "Un número", codigo: "precio = 10.10\ntotal = precio + 0.20" },
  {
    clave: "dict",
    titulo: "Un diccionario",
    codigo: 'precio = {"monto": 10.10, "moneda": "PEN"}\ntotal = precio["monto"] + otro["monto"]',
  },
  {
    clave: "tupla",
    titulo: "Una tupla con Decimal",
    codigo: 'precio = (Decimal("10.10"), "PEN")\ntotal = precio[0] + otro[0]',
  },
];

const PRUEBAS = [
  {
    id: "T1",
    nombre: "0.10 + 0.20 da exactamente 0.30",
    pasa: { float: false, dict: false, tupla: true },
    linea: 2,
  },
  {
    id: "T2",
    nombre: "Sumar soles con dólares se rechaza",
    pasa: { float: false, dict: false, tupla: false },
    linea: 9,
  },
  {
    id: "T3",
    nombre: "Nadie puede cambiar un precio ya usado",
    pasa: { float: true, dict: false, tupla: true },
    linea: 0,
  },
  {
    id: "T4",
    nombre: "Un precio negativo se rechaza",
    pasa: { float: false, dict: false, tupla: false },
    linea: 6,
  },
] as const;

const SOLUCION = `@dataclass(frozen=True)          # T3: inmutable
class Monto:
    valor: Decimal                # T1: Decimal, no float
    moneda: Moneda

    def __post_init__(self):
        if self.valor < 0: raise MontoNegativo(self.valor)   # T4

    def __add__(self, otro: "Monto") -> "Monto":
        if self.moneda != otro.moneda: raise MonedasDistintas()  # T2
        return Monto(self.valor + otro.valor, self.moneda)`;

export function DemoFracasoProductivo() {
  const [paso, setPaso] = useState(0);
  const [intento, setIntento] = useState<"float" | "dict" | "tupla" | null>(null);
  const [propio, setPropio] = useState("");
  const fallidas = intento ? PRUEBAS.filter((p) => !p.pasa[intento]) : [];
  return (
    <div>
      <Pasos
        actual={paso}
        pasos={[
          { t: "t=-2", nombre: "Intenta" },
          { t: "t=-1", nombre: "Ponlo a prueba" },
          { t: "t=0", nombre: "La solución" },
        ]}
      />
      {paso === 0 && (
        <div className="space-y-4">
          <Pregunta>
            Una tienda vende en soles y dólares. ¿Cómo representarías un precio para poder sumar el
            total del carrito?
          </Pregunta>
          <Nota>Todavía nadie te explicó nada. Elige lo que harías hoy o escribe tu idea.</Nota>
          <div className="grid gap-3 md:grid-cols-3">
            {INTENTOS.map((i) => (
              <Opcion
                key={i.clave}
                activa={intento === i.clave}
                onClick={() => setIntento(i.clave as typeof intento)}
              >
                <span className="block font-semibold">{i.titulo}</span>
                <code className="mt-2 block whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                  {i.codigo}
                </code>
              </Opcion>
            ))}
          </div>
          <textarea
            value={propio}
            onChange={(e) => setPropio(e.target.value)}
            rows={2}
            placeholder="Tu propia idea (opcional)"
            className="w-full rounded-2xl border bg-card p-3 font-mono text-sm"
            aria-label="Tu propia idea"
          />
          <Accion disabled={!intento} onClick={() => setPaso(1)}>
            Probar mi intento
          </Accion>
        </div>
      )}
      {paso === 1 && intento && (
        <div className="space-y-4">
          <Pregunta>Estas son las reglas del negocio, escritas como pruebas. Tu intento:</Pregunta>
          <ul className="space-y-2">
            {PRUEBAS.map((p) => (
              <li
                key={p.id}
                className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${p.pasa[intento] ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10"}`}
              >
                <span>
                  <span className="mr-2 font-mono text-xs font-bold">{p.id}</span>
                  {p.nombre}
                </span>
                <span className="font-mono text-xs font-bold">
                  {p.pasa[intento] ? "PASA" : "FALLA"}
                </span>
              </li>
            ))}
          </ul>
          <Retro
            tipo="info"
            titulo={`Fallan ${fallidas.length} de ${PRUEBAS.length}. Eso es lo que buscábamos.`}
          >
            Ahora sabes qué hace difícil al problema: precisión, monedas, cambios inesperados y
            valores inválidos. Fallar antes de la explicación crea los huecos donde va a encajar.
          </Retro>
          <Accion onClick={() => setPaso(2)}>Ver la solución (t=0)</Accion>
        </div>
      )}
      {paso === 2 && intento && (
        <div className="space-y-4">
          <Codigo
            titulo="dinero.py · Value Object"
            codigo={SOLUCION}
            estado={(i) => (fallidas.some((f) => f.linea === i) ? "bien" : null)}
          />
          <Nota>
            En verde, las líneas que resuelven exactamente las pruebas que tu intento no pasó. Cada
            línea de la solución responde a un fallo que viviste.
          </Nota>
          <Accion
            secundaria
            onClick={() => {
              setPaso(0);
              setIntento(null);
            }}
          >
            Probar con otro intento
          </Accion>
        </div>
      )}
    </div>
  );
}

// ── Ejemplos resueltos que se desvanecen ─────────────────────────────────

type Hueco = { opciones: string[]; correcta: number };
type Etapa = { titulo: string; codigo: string; huecos: Hueco[] };

const ETAPAS: Etapa[] = [
  {
    titulo: "Ejemplo 1 · completo: estúdialo",
    codigo: `def test_email_sin_arroba_se_rechaza():
    with pytest.raises(EmailInvalido):
        Email("ana.ejemplo.com")

@dataclass(frozen=True)
class Email:
    valor: str

    def __post_init__(self):
        if "@" not in self.valor:
            raise EmailInvalido(self.valor)`,
    huecos: [],
  },
  {
    titulo: "Ejemplo 2 · falta una pieza",
    codigo: `def test_telefono_con_letras_se_rechaza():
    with pytest.raises(TelefonoInvalido):
        Telefono("98x765432")

@dataclass(frozen=True)
class Telefono:
    valor: str

    def __post_init__(self):
        if not self.valor.isdigit():
            raise {{0}}(self.valor)`,
    huecos: [{ opciones: ["ValueError", "TelefonoInvalido", "return None"], correcta: 1 }],
  },
  {
    titulo: "Ejemplo 3 · faltan tres piezas",
    codigo: `def test_rango_con_fin_antes_del_inicio_se_rechaza():
    with pytest.raises({{0}}):
        Rango(date(2026, 5, 2), date(2026, 5, 1))

@dataclass({{1}})
class Rango:
    inicio: date
    fin: date

    def __post_init__(self):
        if {{2}}:
            raise RangoInvalido(self.inicio, self.fin)`,
    huecos: [
      { opciones: ["Exception", "RangoInvalido", "AssertionError"], correcta: 1 },
      { opciones: ["order=True", "frozen=True", "slots=False"], correcta: 1 },
      {
        opciones: ["self.fin < self.inicio", "self.inicio < self.fin", "self.fin is None"],
        correcta: 0,
      },
    ],
  },
];

export function DemoEjemplosResueltos() {
  const [etapa, setEtapa] = useState(0);
  const [elecciones, setElecciones] = useState<Record<string, number>>({});
  const [revisado, setRevisado] = useState(false);
  const e = ETAPAS[etapa]!;
  const correcto = e.huecos.every((h, i) => elecciones[`${etapa}-${i}`] === h.correcta);
  return (
    <div className="space-y-4">
      <Pasos
        actual={etapa}
        pasos={[
          { t: "t=0", nombre: "Completo" },
          { t: "t=+1", nombre: "Un hueco" },
          { t: "t=+3", nombre: "Tres huecos" },
        ]}
      />
      <div className="overflow-hidden rounded-2xl bg-panel text-panel-foreground shadow-card">
        <p className="border-b border-panel-foreground/10 px-5 py-2.5 font-mono text-xs text-panel-foreground/60">
          {e.titulo}
        </p>
        <pre className="codigo overflow-x-auto p-5">
          {e.codigo.split(/(\{\{\d\}\})/).map((parte, i) => {
            const m = parte.match(/\{\{(\d)\}\}/);
            if (!m) return <Fragment key={i}>{parte}</Fragment>;
            const h = Number(m[1]);
            const clave = `${etapa}-${h}`;
            const hueco = e.huecos[h]!;
            const estado = revisado
              ? elecciones[clave] === hueco.correcta
                ? "border-success"
                : "border-destructive"
              : "border-accent";
            return (
              <select
                key={i}
                aria-label={`Hueco ${h + 1}`}
                value={elecciones[clave] ?? ""}
                onChange={(ev) => {
                  setElecciones({ ...elecciones, [clave]: Number(ev.target.value) });
                  setRevisado(false);
                }}
                className={`mx-0.5 rounded-md border-2 bg-panel px-1 font-mono text-[13px] text-accent ${estado}`}
              >
                <option value="" disabled>
                  elige
                </option>
                {hueco.opciones.map((o, j) => (
                  <option key={o} value={j}>
                    {o}
                  </option>
                ))}
              </select>
            );
          })}
        </pre>
      </div>
      {e.huecos.length === 0 ? (
        <>
          <Nota>
            Fíjate en el orden: primero la prueba que describe la regla, después el Value Object
            mínimo que la cumple. La validación vive en __post_init__.
          </Nota>
          <Accion onClick={() => setEtapa(1)}>Siguiente ejemplo</Accion>
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Accion secundaria onClick={() => setRevisado(true)}>
            Revisar
          </Accion>
          {revisado && correcto && etapa < ETAPAS.length - 1 && (
            <Accion
              onClick={() => {
                setEtapa(etapa + 1);
                setRevisado(false);
              }}
            >
              Siguiente: menos ayuda
            </Accion>
          )}
          {revisado &&
            (correcto ? (
              <span className="font-semibold text-success">Correcto. La ayuda se retira.</span>
            ) : (
              <span className="font-semibold text-destructive">
                Revisa los huecos en rojo y compáralos con el ejemplo 1.
              </span>
            ))}
        </div>
      )}
      {revisado && correcto && etapa === ETAPAS.length - 1 && (
        <Retro tipo="bien" titulo="Ya no necesitas el ejemplo">
          El siguiente paso (t=+7) es escribir un Value Object desde cero, sin mirar.
        </Retro>
      )}
    </div>
  );
}

// ── PRIMM ────────────────────────────────────────────────────────────────

const CODIGO_PRIMM = `def agregar(producto, carrito=[]):
    carrito.append(producto)
    return carrito

print(agregar("pan"))
print(agregar("leche"))`;

export function DemoPrimm() {
  const [paso, setPaso] = useState(0);
  const [prediccion, setPrediccion] = useState<number | null>(null);
  const [investiga, setInvestiga] = useState<number | null>(null);
  const [arreglo, setArreglo] = useState<number | null>(null);
  const predicciones = [
    "['pan']  y luego  ['leche']",
    "['pan']  y luego  ['pan', 'leche']",
    "Un error: no se puede modificar el argumento",
  ];
  return (
    <div className="space-y-4">
      <Pasos
        actual={paso}
        pasos={[
          { t: "t=-1", nombre: "Predecir" },
          { t: "t=0", nombre: "Ejecutar" },
          { t: "t=+1", nombre: "Investigar" },
          { t: "t=+2", nombre: "Modificar" },
          { t: "t=+5", nombre: "Crear" },
        ]}
      />
      <Codigo titulo="carrito.py" codigo={CODIGO_PRIMM} />
      {paso === 0 && (
        <>
          <Pregunta>Antes de ejecutar: ¿qué imprime?</Pregunta>
          <div className="grid gap-2">
            {predicciones.map((p, i) => (
              <Opcion key={p} activa={prediccion === i} onClick={() => setPrediccion(i)}>
                <code className="font-mono">{p}</code>
              </Opcion>
            ))}
          </div>
          <Accion disabled={prediccion === null} onClick={() => setPaso(1)}>
            Comprometerme y ejecutar
          </Accion>
        </>
      )}
      {paso >= 1 && (
        <div className="rounded-2xl bg-foreground p-4 font-mono text-sm text-background">
          <p className="text-background/50">$ python carrito.py</p>
          <p>['pan']</p>
          <p>['pan', 'leche']</p>
        </div>
      )}
      {paso === 1 && (
        <>
          <Retro
            tipo={prediccion === 1 ? "bien" : "mal"}
            titulo={
              prediccion === 1
                ? "Predijiste bien. ¿Sabes por qué?"
                : "La salida contradice tu predicción. Ahí está el aprendizaje."
            }
          />
          <Accion onClick={() => setPaso(2)}>Investigar</Accion>
        </>
      )}
      {paso === 2 && (
        <>
          <Pregunta>¿Cuándo se crea la lista que se usa como valor por defecto?</Pregunta>
          <div className="grid gap-2">
            {[
              "En cada llamada a la función",
              "Una sola vez, cuando se define la función",
              "Cuando se importa el módulo que la llama",
            ].map((o, i) => (
              <Opcion
                key={o}
                activa={investiga === i}
                estado={
                  investiga === null
                    ? null
                    : i === 1
                      ? investiga === i
                        ? "bien"
                        : null
                      : investiga === i
                        ? "mal"
                        : null
                }
                onClick={() => setInvestiga(i)}
              >
                {o}
              </Opcion>
            ))}
          </div>
          {investiga === 1 && (
            <>
              <Retro tipo="bien" titulo="Exacto">
                Los valores por defecto se evalúan una vez, al ejecutar def. Todas las llamadas
                comparten la misma lista mutable.
              </Retro>
              <Accion onClick={() => setPaso(3)}>Modificar el código</Accion>
            </>
          )}
        </>
      )}
      {paso === 3 && (
        <>
          <Pregunta>¿Qué cambio lo corrige?</Pregunta>
          <div className="grid gap-2">
            {[
              "carrito=list()",
              "carrito=None  y dentro:  if carrito is None: carrito = []",
              "carrito.clear() al inicio de la función",
            ].map((o, i) => (
              <Opcion
                key={o}
                activa={arreglo === i}
                estado={
                  arreglo === null
                    ? null
                    : i === 1
                      ? arreglo === i
                        ? "bien"
                        : null
                      : arreglo === i
                        ? "mal"
                        : null
                }
                onClick={() => setArreglo(i)}
              >
                <code className="font-mono text-sm">{o}</code>
              </Opcion>
            ))}
          </div>
          {arreglo !== null && arreglo !== 1 && (
            <Retro tipo="mal" titulo="No del todo">
              {arreglo === 0
                ? "list() también se evalúa una sola vez: es el mismo problema con otra sintaxis."
                : "Borra lo que el llamador pasó a propósito: rompe otro caso."}
            </Retro>
          )}
          {arreglo === 1 && <Accion onClick={() => setPaso(4)}>Crear tu versión</Accion>}
        </>
      )}
      {paso === 4 && (
        <>
          <Codigo
            titulo="Crear: que el error no pueda existir"
            codigo={`@dataclass(frozen=True)
class Carrito:
    productos: tuple[str, ...] = ()

    def agregar(self, producto: str) -> "Carrito":
        return Carrito((*self.productos, producto))`}
          />
          <Retro tipo="bien" titulo="Del arreglo al diseño">
            Con un Value Object inmutable no hay lista compartida que se pueda corromper. Pasaste de
            recordar una trampa a entender por qué el diseño la evita.
          </Retro>
        </>
      )}
    </div>
  );
}

// ── Técnica Feynman ──────────────────────────────────────────────────────

const JERGA = [
  "invariante",
  "invariantes",
  "raíz",
  "raiz",
  "entidad",
  "entidades",
  "consistencia",
  "transaccional",
  "transacción",
  "dominio",
  "bounded",
  "contexto delimitado",
  "value object",
  "repositorio",
  "encapsula",
  "encapsulamiento",
  "cohesión",
  "acoplamiento",
  "aggregate",
  "frontera",
];

function analizar(texto: string) {
  const minus = texto.toLowerCase();
  const jerga = JERGA.filter((j) => new RegExp(`\\b${j}\\b`, "i").test(minus));
  const oraciones = texto
    .split(/[.!?]+/)
    .map((o) => o.trim())
    .filter(Boolean);
  const palabras = texto.split(/\s+/).filter(Boolean).length;
  return {
    jerga,
    palabras,
    largoMedio: oraciones.length ? Math.round(palabras / oraciones.length) : 0,
    ejemplo: /por ejemplo|imagina|piensa en|como cuando|es como/i.test(texto),
    porque: /porque|para que|por eso|así/i.test(texto),
  };
}

export function DemoFeynman() {
  const [texto, setTexto] = useState("");
  const [versiones, setVersiones] = useState<{ jerga: number; palabras: number }[]>([]);
  const [modelo, setModelo] = useState(false);
  const a = analizar(texto);
  const checks = [
    { ok: a.palabras >= 25, texto: "Al menos 25 palabras" },
    {
      ok: a.jerga.length === 0 && a.palabras > 0,
      texto: a.jerga.length ? `Sin jerga (encontrada: ${a.jerga.join(", ")})` : "Sin jerga",
    },
    {
      ok: a.largoMedio > 0 && a.largoMedio <= 22,
      texto: `Oraciones cortas (promedio ${a.largoMedio} palabras)`,
    },
    { ok: a.ejemplo, texto: "Incluye un ejemplo propio" },
    { ok: a.porque, texto: "Explica el porqué, no solo el qué" },
  ];
  return (
    <div className="space-y-4">
      <Pregunta>
        Explica qué es un agregado a alguien que empezó a programar el mes pasado.
      </Pregunta>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={6}
        className="w-full rounded-2xl border bg-card p-4 text-base leading-7"
        placeholder="Un agregado es..."
        aria-label="Tu explicación"
      />
      <ul className="grid gap-2 sm:grid-cols-2">
        {checks.map((c) => (
          <li
            key={c.texto}
            className={`rounded-2xl border p-3 text-sm font-semibold ${c.ok ? "border-success/40 bg-success/10" : "bg-card text-muted-foreground"}`}
          >
            <span className="mr-2 font-mono">{c.ok ? "sí" : "aún no"}</span>
            {c.texto}
          </li>
        ))}
      </ul>
      <Nota>
        Cada palabra técnica que no puedes reemplazar marca un hueco. Vuelve a la fuente solo para
        ese hueco y reescribe.
      </Nota>
      <div className="flex flex-wrap gap-3">
        <Accion
          secundaria
          disabled={!texto}
          onClick={() =>
            setVersiones([...versiones, { jerga: a.jerga.length, palabras: a.palabras }])
          }
        >
          Guardar versión {versiones.length + 1}
        </Accion>
        <Accion secundaria onClick={() => setModelo(!modelo)}>
          {modelo ? "Ocultar" : "Ver"} una explicación modelo
        </Accion>
      </div>
      {versiones.length > 0 && (
        <p className="font-mono text-xs text-muted-foreground">
          {versiones
            .map((v, i) => `v${i + 1}: ${v.jerga} términos de jerga, ${v.palabras} palabras`)
            .join("  ·  ")}
        </p>
      )}
      {modelo && (
        <Retro tipo="info" titulo="Una versión posible">
          Un agregado es un grupo de objetos que tienen que cambiar juntos para no contradecirse,
          con un único responsable que decide si un cambio vale. Por ejemplo, un pedido y sus
          líneas: si agregas una línea, alguien tiene que revisar que no pases el límite de crédito.
          Ese alguien es el pedido; por eso nadie toca las líneas directamente, se lo pide al
          pedido.
        </Retro>
      )}
    </div>
  );
}
