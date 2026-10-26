import { useEffect, useRef, useState } from "react";
import { guardarLocal, leerLocal } from "@/lib/preferencias";
import { Accion, Codigo, Nota, Opcion, Pasos, Pregunta, Retro, mezclar } from "./kit";

// ── Práctica intercalada ─────────────────────────────────────────────────

const PATRONES = [
  "Value Object",
  "Entidad",
  "Agregado",
  "Repositorio",
  "Evento de dominio",
] as const;
type Patron = (typeof PATRONES)[number];

const ESCENARIOS: { texto: string; patron: Patron; porque: string }[] = [
  {
    texto: "El precio de un producto: 25.90 soles.",
    patron: "Value Object",
    porque: "Se define por su valor y moneda; dos precios iguales son intercambiables.",
  },
  {
    texto: "Un cliente que puede cambiar su dirección y su email.",
    patron: "Entidad",
    porque: "Sigue siendo el mismo cliente aunque cambien sus datos: tiene identidad.",
  },
  {
    texto: "Un pedido con líneas que nunca debe superar el límite de crédito.",
    patron: "Agregado",
    porque: "Hay una regla que abarca a varios objetos y alguien debe garantizarla.",
  },
  {
    texto: "Guardar y recuperar pedidos sin que el dominio sepa de SQL.",
    patron: "Repositorio",
    porque: "Es la colección de agregados que el dominio pide sin conocer la persistencia.",
  },
  {
    texto: "Avisar a facturación cuando un pedido se confirma.",
    patron: "Evento de dominio",
    porque: "Algo que ocurrió y que a otros les interesa, sin acoplarlos.",
  },
  {
    texto: "Las fechas de inicio y fin de una reserva.",
    patron: "Value Object",
    porque: "Un rango de fechas es un valor con una regla interna: fin después de inicio.",
  },
  {
    texto: "Un vuelo con asientos donde no se puede sobrevender.",
    patron: "Agregado",
    porque: "La invariante (asientos ≤ capacidad) obliga a modificar todo a través del vuelo.",
  },
  {
    texto: "Una cuenta bancaria identificada por su número, cuyo saldo cambia.",
    patron: "Entidad",
    porque: "El número la identifica a lo largo del tiempo.",
  },
  {
    texto: "Se rechazó el pago de una suscripción.",
    patron: "Evento de dominio",
    porque: "Es un hecho en pasado que dispara otras reacciones.",
  },
];

export function DemoIntercalado() {
  const orden = mezclar(
    ESCENARIOS.map((_, i) => i),
    11,
  );
  const [pos, setPos] = useState(0);
  const [eleccion, setEleccion] = useState<Patron | null>(null);
  const [resultados, setResultados] = useState<{ esperado: Patron; elegido: Patron }[]>([]);
  const actual = ESCENARIOS[orden[pos] ?? -1];
  if (!actual) {
    const aciertos = resultados.filter((r) => r.esperado === r.elegido).length;
    const confusiones = resultados
      .filter((r) => r.esperado !== r.elegido)
      .map((r) => `${r.esperado} con ${r.elegido}`);
    return (
      <div className="space-y-4">
        <Retro
          tipo={aciertos >= 7 ? "bien" : "info"}
          titulo={`${aciertos} de ${ESCENARIOS.length} reconocidos`}
        >
          {confusiones.length
            ? `Confundiste: ${[...new Set(confusiones)].join("; ")}. Esos pares son tu próxima práctica.`
            : "Sin confusiones: distingues los patrones sin que te digan cuál toca."}{" "}
          En práctica por bloques sabrías qué patrón toca antes de empezar; mezclados, tienes que
          elegir. Eso es lo que se transfiere al trabajo real.
        </Retro>
        <Accion
          secundaria
          onClick={() => {
            setPos(0);
            setResultados([]);
            setEleccion(null);
          }}
        >
          Otra ronda
        </Accion>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <p className="font-mono text-xs font-bold text-muted-foreground">
        Escenario {pos + 1} de {ESCENARIOS.length} · mezclados a propósito
      </p>
      <Pregunta>{actual.texto}</Pregunta>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {PATRONES.map((p) => (
          <Opcion
            key={p}
            disabled={eleccion !== null}
            activa={eleccion === p}
            estado={
              eleccion === null
                ? null
                : p === actual.patron
                  ? "bien"
                  : p === eleccion
                    ? "mal"
                    : null
            }
            onClick={() => setEleccion(p)}
          >
            <span className="font-semibold">{p}</span>
          </Opcion>
        ))}
      </div>
      {eleccion && (
        <>
          <Retro
            tipo={eleccion === actual.patron ? "bien" : "mal"}
            titulo={eleccion === actual.patron ? "Bien elegido" : `Era ${actual.patron}`}
          >
            {actual.porque}
          </Retro>
          <Accion
            onClick={() => {
              setResultados([...resultados, { esperado: actual.patron, elegido: eleccion }]);
              setEleccion(null);
              setPos(pos + 1);
            }}
          >
            Siguiente
          </Accion>
        </>
      )}
    </div>
  );
}

// ── Ejemplos con errores ─────────────────────────────────────────────────

const CASOS_ERROR = [
  {
    titulo: "pedido.py · un agregado",
    codigo: `class Pedido:
    def __init__(self, limite: Monto):
        self.lineas: list[Linea] = []
        self.limite = limite

    def agregar_linea(self, linea: Linea) -> None:
        if self.total() + linea.subtotal > self.limite:
            raise LimiteExcedido(self.limite)
        self.lineas.append(linea)`,
    linea: 2,
    pista: "Busca por dónde se puede romper la regla del límite sin pasar por agregar_linea.",
    explicaciones: [
      "Falta un setter para la lista de líneas",
      "La lista es pública y mutable: cualquiera hace pedido.lineas.append() y se salta el límite",
      "El límite debería ser un float",
    ],
    correcta: 1,
    arreglo: "Guardar las líneas en self._lineas y exponer una tupla de solo lectura.",
  },
  {
    titulo: "test_pedido.py · una prueba",
    codigo: `def test_agregar_linea():
    pedido = Pedido(limite=Monto(100, PEN))
    pedido.agregar_linea(Linea("pan", Monto(10, PEN)))
    assert pedido.lineas[0].producto == "pan"
    assert len(pedido._cache_totales) == 1`,
    linea: 4,
    pista: "Una buena prueba sobrevive a un refactor que no cambia el comportamiento.",
    explicaciones: [
      "Verifica un detalle interno: se rompe al refactorizar aunque el pedido funcione",
      "Le falta un tercer assert",
      "Debería usar unittest en vez de pytest",
    ],
    correcta: 0,
    arreglo: "Verificar comportamiento observable: el total o las líneas expuestas, no la caché.",
  },
];

export function DemoEjemplosConErrores() {
  const [caso, setCaso] = useState(0);
  const [linea, setLinea] = useState<number | null>(null);
  const [explicacion, setExplicacion] = useState<number | null>(null);
  const c = CASOS_ERROR[caso];
  if (!c) {
    return (
      <div className="space-y-4">
        <Retro tipo="bien" titulo="Dos errores reales, dos reglas entendidas por sus límites">
          Un agregado que expone su colección deja de proteger invariantes; una prueba que mira
          adentro deja de proteger el comportamiento.
        </Retro>
        <Accion
          secundaria
          onClick={() => {
            setCaso(0);
            setLinea(null);
            setExplicacion(null);
          }}
        >
          Repetir
        </Accion>
      </div>
    );
  }
  const acerto = linea === c.linea;
  return (
    <div className="space-y-4">
      <Pasos
        actual={caso}
        pasos={[
          { t: "t=+1", nombre: "Agregado" },
          { t: "t=+4", nombre: "Prueba" },
        ]}
      />
      <Pregunta>Este código tiene un error de diseño. Haz clic en la línea culpable.</Pregunta>
      <Codigo
        titulo={c.titulo}
        codigo={c.codigo}
        onLinea={(i) => {
          setLinea(i);
          setExplicacion(null);
        }}
        estado={(i) => (linea === i ? (acerto ? "bien" : "mal") : null)}
      />
      {linea !== null && !acerto && (
        <Retro tipo="mal" titulo="Esa línea no es">
          {c.pista}
        </Retro>
      )}
      {acerto && (
        <>
          <Pregunta>¿Por qué es un error?</Pregunta>
          <div className="grid gap-2">
            {c.explicaciones.map((e, i) => (
              <Opcion
                key={e}
                activa={explicacion === i}
                estado={
                  explicacion === null
                    ? null
                    : i === c.correcta
                      ? explicacion === i
                        ? "bien"
                        : null
                      : explicacion === i
                        ? "mal"
                        : null
                }
                onClick={() => setExplicacion(i)}
              >
                {e}
              </Opcion>
            ))}
          </div>
          {explicacion === c.correcta && (
            <>
              <Retro tipo="bien" titulo="Encontrado y explicado">
                Arreglo: {c.arreglo}
              </Retro>
              <Accion
                onClick={() => {
                  setCaso(caso + 1);
                  setLinea(null);
                  setExplicacion(null);
                }}
              >
                Siguiente caso
              </Accion>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ── Problemas de Parsons ─────────────────────────────────────────────────

const SOLUCION_PARSONS = [
  "def test_no_suma_monedas_distintas():",
  "    with pytest.raises(MonedasDistintas):",
  "        Monto(10, PEN) + Monto(5, USD)",
  "@dataclass(frozen=True)",
  "class Monto:",
  "    def __add__(self, otro):",
  "        if self.moneda != otro.moneda:",
  "            raise MonedasDistintas()",
];
const DISTRACTORAS = ["            return None", "    @property"];

export function DemoParsons() {
  const inicial = mezclar([...SOLUCION_PARSONS, ...DISTRACTORAS], 5);
  const [bolsa, setBolsa] = useState(inicial);
  const [armado, setArmado] = useState<string[]>([]);
  const [revisado, setRevisado] = useState(false);
  const correcto =
    armado.length === SOLUCION_PARSONS.length && armado.every((l, i) => l === SOLUCION_PARSONS[i]);
  return (
    <div className="space-y-4">
      <Pregunta>
        Arma el ciclo TDD: primero la prueba, después el código. Sobran dos líneas.
      </Pregunta>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">
            Líneas disponibles (clic para usar)
          </p>
          <ul className="space-y-1.5">
            {bolsa.map((l) => (
              <li key={l}>
                <button
                  type="button"
                  onClick={() => {
                    setBolsa(bolsa.filter((x) => x !== l));
                    setArmado([...armado, l]);
                    setRevisado(false);
                  }}
                  className="w-full rounded-md border bg-card px-3 py-2 text-left font-mono text-xs hover:border-primary/40 sm:text-sm"
                >
                  <span className="whitespace-pre">{l}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">
            Tu solución (clic para devolver)
          </p>
          <ol className="min-h-40 space-y-1.5 rounded-2xl bg-panel p-3">
            {armado.map((l, i) => {
              const estado = revisado
                ? SOLUCION_PARSONS[i] === l
                  ? "bg-success/25"
                  : "bg-destructive/30"
                : "";
              return (
                <li key={l}>
                  <button
                    type="button"
                    onClick={() => {
                      setArmado(armado.filter((x) => x !== l));
                      setBolsa([...bolsa, l]);
                      setRevisado(false);
                    }}
                    className={`w-full rounded-md px-3 py-1.5 text-left font-mono text-xs text-panel-foreground hover:bg-panel-foreground/10 sm:text-sm ${estado}`}
                  >
                    <span className="whitespace-pre">{l}</span>
                  </button>
                </li>
              );
            })}
            {armado.length === 0 && (
              <li className="p-3 text-sm text-panel-foreground/50">
                Empieza por la primera línea de la prueba.
              </li>
            )}
          </ol>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Accion disabled={armado.length === 0} onClick={() => setRevisado(true)}>
          Revisar
        </Accion>
        <Accion
          secundaria
          onClick={() => {
            setBolsa(inicial);
            setArmado([]);
            setRevisado(false);
          }}
        >
          Reiniciar
        </Accion>
      </div>
      {revisado &&
        (correcto ? (
          <Retro tipo="bien" titulo="Estructura correcta">
            Descartaste return None (la regla debe fallar ruidosamente) y @property (no hay nada que
            exponer). Pensaste en la estructura sin escribir una sola línea.
          </Retro>
        ) : (
          <Retro tipo="mal" titulo="Aún no">
            Las líneas en rojo están en una posición incorrecta o sobran. Pista: la prueba describe
            la regla antes de que exista la clase.
          </Retro>
        ))}
    </div>
  );
}

// ── Aprender con TDD ─────────────────────────────────────────────────────

type Ciclo = {
  fase: "rojo" | "verde" | "refactor";
  prueba?: string;
  codigo?: string;
  pregunta: string;
  respuesta: "pasa" | "falla";
  explicacion: string;
};

const CICLOS: Ciclo[] = [
  {
    fase: "rojo",
    prueba:
      "def test_frecuente_tiene_10_por_ciento():\n    assert descuento(Cliente(frecuente=True), Producto(oferta=False)) == Porcentaje(10)",
    pregunta: "Todavía no existe descuento(). ¿La prueba pasa o falla?",
    respuesta: "falla",
    explicacion:
      "Falla (NameError). Ver el rojo confirma que la prueba puede fallar: una prueba que nunca falla no prueba nada.",
  },
  {
    fase: "verde",
    codigo: "def descuento(cliente, producto):\n    return Porcentaje(10)",
    pregunta: "Con este código mínimo, ¿pasa?",
    respuesta: "pasa",
    explicacion:
      "Pasa. El código es tramposo a propósito: la siguiente prueba obligará a generalizar. Así el diseño crece guiado por casos reales.",
  },
  {
    fase: "rojo",
    prueba:
      "def test_no_frecuente_no_tiene_descuento():\n    assert descuento(Cliente(frecuente=False), Producto(oferta=False)) == Porcentaje(0)",
    pregunta: "Con el código actual (siempre 10), ¿esta nueva prueba pasa?",
    respuesta: "falla",
    explicacion:
      "Falla: devuelve 10. Tu hipótesis sobre el comportamiento se hizo explícita antes del código.",
  },
  {
    fase: "verde",
    codigo:
      "def descuento(cliente, producto):\n    return Porcentaje(10) if cliente.frecuente else Porcentaje(0)",
    pregunta: "¿Pasan ahora las dos pruebas?",
    respuesta: "pasa",
    explicacion: "Pasan las dos. Cada prueba es una regla del negocio documentada.",
  },
  {
    fase: "rojo",
    prueba:
      "def test_frecuente_sin_descuento_en_oferta():\n    assert descuento(Cliente(frecuente=True), Producto(oferta=True)) == Porcentaje(0)",
    pregunta: "Regla nueva de la campaña. ¿Pasa con el código actual?",
    respuesta: "falla",
    explicacion:
      "Falla: el código no conoce las ofertas. La campaña de julio no rompe la de junio porque la de junio tiene su prueba.",
  },
  {
    fase: "refactor",
    codigo:
      "@dataclass(frozen=True)\nclass PoliticaDeDescuento:\n    porcentaje_frecuente: Porcentaje = Porcentaje(10)\n\n    def para(self, cliente, producto) -> Porcentaje:\n        if cliente.frecuente and not producto.oferta:\n            return self.porcentaje_frecuente\n        return Porcentaje(0)",
    pregunta: "Movimos la regla a un objeto del dominio. ¿Las tres pruebas siguen pasando?",
    respuesta: "pasa",
    explicacion:
      "Pasan: refactorizaste con red de seguridad. Ese es el momento en que TDD paga lo que costó en t=0.",
  },
];

export function DemoTdd() {
  const [i, setI] = useState(0);
  const [respuesta, setRespuesta] = useState<"pasa" | "falla" | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const c = CICLOS[i];
  if (!c) {
    return (
      <div className="space-y-4">
        <Retro tipo="bien" titulo={`Predijiste ${aciertos} de ${CICLOS.length} resultados`}>
          Cada predicción fue una hipótesis (t&lt;0) y cada ejecución un experimento (t&gt;0).
          Cuando una prueba te sorprende, encontraste algo que no entendías. Usa lo mismo para
          aprender una librería nueva: escribe pruebas de lo que crees que hace.
        </Retro>
        <Accion
          secundaria
          onClick={() => {
            setI(0);
            setAciertos(0);
            setRespuesta(null);
          }}
        >
          Repetir el ciclo
        </Accion>
      </div>
    );
  }
  const color =
    c.fase === "rojo" ? "bg-destructive" : c.fase === "verde" ? "bg-success" : "bg-primary";
  return (
    <div className="space-y-4">
      <div className="flex gap-1" aria-hidden="true">
        {CICLOS.map((k, j) => (
          <span
            key={j}
            className={`h-2 flex-1 rounded-full ${j < i ? (k.fase === "rojo" ? "bg-destructive" : k.fase === "verde" ? "bg-success" : "bg-primary") : j === i ? `${color} opacity-50` : "bg-muted"}`}
          />
        ))}
      </div>
      <p className="font-mono text-xs font-bold uppercase text-muted-foreground">
        Paso {i + 1} · {c.fase}
      </p>
      {c.prueba && <Codigo titulo="Nueva prueba" codigo={c.prueba} />}
      {c.codigo && (
        <Codigo titulo={c.fase === "refactor" ? "Refactor" : "Código mínimo"} codigo={c.codigo} />
      )}
      <Pregunta>{c.pregunta}</Pregunta>
      <div className="flex gap-3">
        {(["pasa", "falla"] as const).map((r) => (
          <Opcion
            key={r}
            disabled={respuesta !== null}
            activa={respuesta === r}
            estado={
              respuesta === null
                ? null
                : r === c.respuesta
                  ? "bien"
                  : respuesta === r
                    ? "mal"
                    : null
            }
            onClick={() => {
              setRespuesta(r);
              if (r === c.respuesta) setAciertos(aciertos + 1);
            }}
          >
            <span className="font-semibold uppercase">{r}</span>
          </Opcion>
        ))}
      </div>
      {respuesta && (
        <>
          <Retro
            tipo={respuesta === c.respuesta ? "bien" : "mal"}
            titulo={
              respuesta === c.respuesta
                ? "Tu hipótesis se confirmó"
                : "Tu hipótesis falló: aquí se aprende"
            }
          >
            {c.explicacion}
          </Retro>
          <Accion
            onClick={() => {
              setI(i + 1);
              setRespuesta(null);
            }}
          >
            Siguiente
          </Accion>
        </>
      )}
    </div>
  );
}

// ── Kata y práctica deliberada ───────────────────────────────────────────

const PASOS_KATA = [
  "Un carrito vacío totaliza 0",
  "Total con un producto",
  "Total con varios productos",
  "10% para clientes frecuentes",
  "Sin descuento en productos en oferta",
  "No se mezclan monedas",
];
const RESTRICCIONES = [
  "Sin restricción",
  "Sin mirar notas",
  "En 15 minutos",
  "Sin if (usa una tabla de reglas)",
  "Explicándola en voz alta",
];
type Intento = { restriccion: string; segundos: number; pasos: number; errores: number };

export function DemoKata() {
  const [intentos, setIntentos] = useState<Intento[]>([]);
  const [restriccion, setRestriccion] = useState(RESTRICCIONES[0]!);
  const [hechos, setHechos] = useState<boolean[]>(PASOS_KATA.map(() => false));
  const [errores, setErrores] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const reloj = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => setIntentos(leerLocal<Intento[]>("kata", [])), []);
  useEffect(() => {
    if (!corriendo) return;
    reloj.current = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => {
      if (reloj.current) clearInterval(reloj.current);
    };
  }, [corriendo]);

  const registrar = () => {
    const nuevos = [
      ...intentos,
      { restriccion, segundos, pasos: hechos.filter(Boolean).length, errores },
    ];
    setIntentos(nuevos);
    guardarLocal("kata", nuevos);
    setCorriendo(false);
    setSegundos(0);
    setErrores(0);
    setHechos(PASOS_KATA.map(() => false));
  };
  const mmss = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const maximo = Math.max(60, ...intentos.map((x) => x.segundos));

  return (
    <div className="space-y-5">
      <Nota>
        Haz la kata en tu editor con pytest. Aquí llevas el tiempo, los pasos y los errores de cada
        repetición, para ver si mejoras de verdad.
      </Nota>
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-2xl border bg-card p-5">
          <label
            className="text-xs font-bold uppercase text-muted-foreground"
            htmlFor="restriccion"
          >
            Restricción de este intento
          </label>
          <select
            id="restriccion"
            value={restriccion}
            onChange={(e) => setRestriccion(e.target.value)}
            className="mt-2 h-11 w-full rounded-2xl border bg-card px-3"
          >
            {RESTRICCIONES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <ul className="mt-4 space-y-2">
            {PASOS_KATA.map((p, i) => (
              <li key={p}>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border p-3 has-[:checked]:border-success/40 has-[:checked]:bg-success/10">
                  <input
                    type="checkbox"
                    checked={hechos[i]}
                    onChange={(e) =>
                      setHechos(hechos.map((h, j) => (j === i ? e.target.checked : h)))
                    }
                    className="size-5 accent-[var(--success)]"
                  />
                  <span className="font-mono text-xs text-muted-foreground">prueba {i + 1}</span>
                  <span className="font-semibold">{p}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-panel p-5 text-panel-foreground shadow-card">
          <p className="text-xs font-bold uppercase text-accent">Reloj</p>
          <p className="mt-2 font-mono text-5xl font-bold tabular-nums">{mmss(segundos)}</p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setCorriendo(!corriendo)}
              className="h-10 flex-1 rounded-full bg-accent font-display text-sm font-semibold text-accent-foreground"
            >
              {corriendo ? "Pausar" : "Empezar"}
            </button>
            <button
              type="button"
              onClick={() => setErrores(errores + 1)}
              className="h-10 flex-1 rounded-full border border-panel-foreground/20 font-display text-sm font-semibold"
            >
              Error +1
            </button>
          </div>
          <p className="mt-3 text-sm text-panel-foreground/70">
            Errores: <strong className="font-mono">{errores}</strong> (una prueba roja que no
            esperabas)
          </p>
          <button
            type="button"
            disabled={segundos === 0}
            onClick={registrar}
            className="mt-4 h-10 w-full rounded-full border border-accent/60 font-display text-sm font-semibold text-accent disabled:opacity-40"
          >
            Registrar intento
          </button>
        </div>
      </div>
      {intentos.length > 0 && (
        <div className="rounded-2xl border bg-card p-5">
          <p className="mb-3 text-xs font-bold uppercase text-muted-foreground">Tus repeticiones</p>
          <div className="flex h-36 items-end gap-3">
            {intentos.map((x, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="font-mono text-[11px]">{mmss(x.segundos)}</span>
                <div
                  className="animate-bar w-full max-w-12 rounded-t-lg bg-primary"
                  style={{ height: `${(x.segundos / maximo) * 90}px` }}
                  title={`${x.restriccion}: ${x.pasos} pasos, ${x.errores} errores`}
                />
                <span className="font-mono text-[11px] text-muted-foreground">
                  #{i + 1} · {x.errores}e
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 text-xs text-muted-foreground underline"
            onClick={() => {
              setIntentos([]);
              guardarLocal("kata", []);
            }}
          >
            Borrar historial
          </button>
        </div>
      )}
    </div>
  );
}
