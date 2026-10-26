import { useEffect, useState } from "react";
import { Accion, Codigo, Nota, Retro } from "./kit";

// ── Enseñar: pato de goma y diálogo socrático ───────────────────────────

const PEDIDO = `class Pedido:
    def __init__(self, id: PedidoId, limite: Monto):
        self.id = id
        self._lineas: list[Linea] = []
        self._limite = limite
        self._confirmado = False

    def agregar(self, linea: Linea) -> None:
        if self._confirmado:
            raise PedidoYaConfirmado(self.id)
        if self.total() + linea.subtotal > self._limite:
            raise LimiteExcedido(self._limite)
        self._lineas.append(linea)

    def confirmar(self) -> None:
        if not self._lineas:
            raise PedidoVacio(self.id)
        self._confirmado = True`;

const SOCRATICAS = [
  {
    pregunta: "¿Qué problema resuelve esta clase? Dilo sin nombrar ningún patrón.",
    modelo:
      "Evita que un pedido quede en un estado imposible: pasado de su límite, modificado después de confirmar o confirmado vacío.",
  },
  {
    pregunta: "¿Qué pasaría si alguien hace pedido._lineas.append(...) desde afuera?",
    modelo:
      "Se saltaría el límite y la regla de no modificar confirmados. El guion bajo es una convención: la protección real es que nadie fuera de la clase lo use, y que las pruebas lo detecten.",
  },
  {
    pregunta: "¿Por qué confirmar() lanza una excepción y no devuelve False?",
    modelo:
      "Un False se puede ignorar sin querer. PedidoVacio obliga al llamador a decidir qué hacer y nombra la regla del negocio.",
  },
  {
    pregunta: "¿Qué prueba escribirías primero y por qué esa?",
    modelo:
      "La de confirmar un pedido vacío: es la regla más simple y define la interfaz (cómo se crea un pedido, cómo se confirma).",
  },
  {
    pregunta: "Si mañana el límite depende del tipo de cliente, ¿qué cambia y qué no?",
    modelo:
      "Cambia de dónde viene el límite (quizá una política inyectada). No cambia que el pedido sea quien lo verifica al agregar.",
  },
];

export function DemoEnsenar() {
  const [i, setI] = useState(0);
  const [respuestas, setRespuestas] = useState<string[]>(SOCRATICAS.map(() => ""));
  const [sinRespuesta, setSinRespuesta] = useState<number[]>([]);
  const fin = i >= SOCRATICAS.length;
  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <Codigo titulo="pedido.py · explícalo línea por línea" codigo={PEDIDO} />
      <div className="space-y-4">
        {!fin ? (
          <>
            <div className="rounded-2xl bg-panel p-5 text-panel-foreground shadow-card">
              <p className="font-mono text-xs font-bold text-accent">
                El pato pregunta · {i + 1}/{SOCRATICAS.length}
              </p>
              <p className="mt-2 font-display text-lg font-bold leading-snug">
                {SOCRATICAS[i]!.pregunta}
              </p>
            </div>
            <textarea
              value={respuestas[i]}
              onChange={(e) =>
                setRespuestas(respuestas.map((r, k) => (k === i ? e.target.value : r)))
              }
              rows={4}
              className="w-full rounded-2xl border bg-card p-3"
              placeholder="Responde como si se lo explicaras en voz alta."
              aria-label="Tu respuesta al pato"
            />
            <div className="flex flex-wrap gap-3">
              <Accion disabled={!respuestas[i]?.trim()} onClick={() => setI(i + 1)}>
                Responder
              </Accion>
              <Accion
                secundaria
                onClick={() => {
                  setSinRespuesta([...sinRespuesta, i]);
                  setI(i + 1);
                }}
              >
                No sé responder
              </Accion>
            </div>
            <Nota>
              El pato no da respuestas. Solo pregunta. Lo que descubras al explicar es tuyo.
            </Nota>
          </>
        ) : (
          <>
            <Retro
              tipo={sinRespuesta.length ? "info" : "bien"}
              titulo={
                sinRespuesta.length
                  ? `${sinRespuesta.length} pregunta(s) te frenaron: ahí está tu siguiente estudio`
                  : "Pudiste explicarlo todo"
              }
            >
              Compara tus respuestas con estas versiones. No son las únicas correctas.
            </Retro>
            <ul className="space-y-3">
              {SOCRATICAS.map((s, k) => (
                <li
                  key={s.pregunta}
                  className={`rounded-2xl border p-3 text-sm ${sinRespuesta.includes(k) ? "border-warning/40 bg-warning/10" : "bg-card"}`}
                >
                  <p className="font-semibold">{s.pregunta}</p>
                  {respuestas[k] && (
                    <p className="mt-1 text-muted-foreground">Tú: {respuestas[k]}</p>
                  )}
                  <p className="mt-1">Modelo: {s.modelo}</p>
                </li>
              ))}
            </ul>
            <Accion
              secundaria
              onClick={() => {
                setI(0);
                setRespuestas(SOCRATICAS.map(() => ""));
                setSinRespuesta([]);
              }}
            >
              Explicar otra vez
            </Accion>
          </>
        )}
      </div>
    </div>
  );
}

// ── Programación en pareja ───────────────────────────────────────────────

const PREGUNTAS_NAVEGANTE = [
  "¿Qué prueba escribirías después de esta?",
  "¿Este nombre lo entendería alguien del negocio?",
  "¿Qué pasa si la lista viene vacía?",
  "¿Esa regla pertenece a este objeto o a otro?",
  "¿Podemos hacer pasar la prueba con menos código?",
  "¿Hay algún caso que esta prueba no cubre?",
  "¿Por qué elegiste un if y no un objeto?",
  "¿Ya es momento de refactorizar o falta otra prueba?",
];

export function DemoPareja() {
  const [duracion, setDuracion] = useState(15 * 60);
  const [restante, setRestante] = useState(15 * 60);
  const [turno, setTurno] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [pregunta, setPregunta] = useState(0);
  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => {
      setRestante((r) => {
        if (r > 1) return r - 1;
        setTurno((t) => t + 1);
        return duracion;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [corriendo, duracion]);
  const conduces = turno % 2 === 0;
  const mmss = `${String(Math.floor(restante / 60)).padStart(2, "0")}:${String(restante % 60).padStart(2, "0")}`;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div
          className={`rounded-2xl p-5 shadow-card transition-colors ${conduces ? "bg-panel text-panel-foreground" : "border bg-card"}`}
        >
          <p
            className={`text-xs font-bold uppercase ${conduces ? "text-accent" : "text-muted-foreground"}`}
          >
            {conduces ? "Ahora" : "Siguiente turno"} · Conduces tú
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>Escribes la prueba roja y el código mínimo.</li>
            <li>Piensas en voz alta: qué vas a escribir y por qué.</li>
            <li>No discutes el diseño mientras tecleas: lo anotas.</li>
          </ul>
        </div>
        <div
          className={`rounded-2xl p-5 shadow-card transition-colors ${!conduces ? "bg-panel text-panel-foreground" : "border bg-card"}`}
        >
          <p
            className={`text-xs font-bold uppercase ${!conduces ? "text-accent" : "text-muted-foreground"}`}
          >
            {!conduces ? "Ahora" : "Siguiente turno"} · Navegas tú
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>Miras el diseño completo, no la línea actual.</li>
            <li>Preguntas por qué, no dictas el código.</li>
            <li>Llevas la lista de pruebas pendientes.</li>
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-5">
        <p className="font-mono text-4xl font-bold tabular-nums">{mmss}</p>
        <p className="font-mono text-sm text-muted-foreground">turno {turno + 1}</p>
        <div className="flex flex-wrap gap-2">
          <Accion onClick={() => setCorriendo(!corriendo)}>
            {corriendo ? "Pausar" : "Empezar sesión"}
          </Accion>
          <Accion
            secundaria
            onClick={() => {
              setTurno(turno + 1);
              setRestante(duracion);
            }}
          >
            Cambiar de rol
          </Accion>
        </div>
        <label className="ml-auto text-sm text-muted-foreground">
          Turnos de{" "}
          <select
            value={duracion}
            onChange={(e) => {
              setDuracion(Number(e.target.value));
              setRestante(Number(e.target.value));
            }}
            className="rounded-md border bg-card px-2 py-1"
          >
            <option value={15 * 60}>15 min</option>
            <option value={10 * 60}>10 min</option>
            <option value={30}>30 s (para probar)</option>
          </select>
        </label>
      </div>
      <div className="rounded-2xl bg-primary/5 p-5">
        <p className="text-xs font-bold uppercase text-primary">Pregunta para quien navega</p>
        <p className="mt-2 font-display text-xl font-bold">{PREGUNTAS_NAVEGANTE[pregunta]}</p>
        <button
          type="button"
          onClick={() => setPregunta((pregunta + 1) % PREGUNTAS_NAVEGANTE.length)}
          className="mt-3 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Otra pregunta
        </button>
      </div>
      <Nota>
        Al terminar: diez minutos de retrospectiva. Cada uno dice una cosa que aprendió del otro y
        una decisión que discutieron.
      </Nota>
    </div>
  );
}
