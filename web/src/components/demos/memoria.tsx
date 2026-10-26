import { useState } from "react";
import { Accion, Nota, Opcion, Pasos, Pregunta, Retro, type PreguntaMultiple } from "./kit";

export const TARJETAS = [
  {
    pregunta: "¿Por qué un agregado solo se modifica a través de su raíz?",
    respuesta:
      "Para que la raíz garantice las invariantes de todo el grupo. Si cualquiera modifica las partes, nadie garantiza la consistencia.",
  },
  {
    pregunta: "¿Por qué el repositorio se declara como Protocol dentro del dominio?",
    respuesta:
      "El dominio declara lo que necesita sin depender de la infraestructura: se prueba con un repositorio en memoria y la base de datos queda como detalle reemplazable.",
  },
  {
    pregunta: "¿Por qué escribir la prueba antes que el código?",
    respuesta:
      "Para diseñar desde el uso, comprobar que la prueba puede fallar (rojo) y tener una red de seguridad para refactorizar.",
  },
  {
    pregunta: "¿Por qué una excepción de dominio y no devolver None?",
    respuesta:
      "Un None se ignora sin querer. Una excepción con nombre del negocio (SaldoInsuficiente) obliga a tratar el caso y documenta la regla.",
  },
  {
    pregunta: "¿Por qué una Entidad se compara por identidad y no por atributos?",
    respuesta:
      "Porque sigue siendo la misma aunque cambien sus datos: un cliente que cambia de email sigue siendo el mismo cliente.",
  },
];

// ── Releer: el experimento de la ilusión ─────────────────────────────────

const TEXTO_VO =
  "Un Value Object se define por sus atributos, no por una identidad: dos montos de 10 soles son el mismo monto. Por eso se implementa inmutable (en Python, @dataclass(frozen=True)): como se comparte por valor, si mutara cambiaría para todos los que lo usan. Sus reglas viven dentro: un Monto valida en __post_init__ y se niega a sumarse con otra moneda. Al ser inmutable es hashable, así que puede ser clave de un diccionario.";

const PREGUNTAS_VO: PreguntaMultiple[] = [
  {
    pregunta: "¿Por qué un Value Object debe ser inmutable?",
    opciones: [
      "Por rendimiento: Python lo optimiza",
      "Porque se comparte por valor; si mutara, cambiaría para todos los que lo usan",
      "Porque dataclass lo exige",
    ],
    correcta: 1,
    porque: "Lo inmutable se puede compartir sin miedo.",
  },
  {
    pregunta: "¿Dónde se valida que no se sumen monedas distintas?",
    opciones: [
      "En el servicio que hace la suma",
      "En la base de datos con una restricción",
      "Dentro del propio Monto",
    ],
    correcta: 2,
    porque: "La regla vive con los datos que protege.",
  },
  {
    pregunta: "¿Por qué un Monto puede ser clave de un diccionario?",
    opciones: ["Porque tiene un id", "Porque al ser frozen es hashable", "No puede serlo"],
    correcta: 1,
    porque: "frozen=True genera __hash__ a partir de los campos.",
  },
];

export function DemoRelectura() {
  const [lecturas, setLecturas] = useState(0);
  const [paso, setPaso] = useState(0);
  const [confianza, setConfianza] = useState(80);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(PREGUNTAS_VO.map(() => null));
  const aciertos = respuestas.filter((r, i) => r === PREGUNTAS_VO[i]!.correcta).length;
  const resultado = Math.round((aciertos / PREGUNTAS_VO.length) * 100);
  return (
    <div>
      <Pasos
        actual={paso}
        pasos={[
          { t: "t=0", nombre: "Leer" },
          { t: "t=+1..3", nombre: "Releer" },
          { t: "t=+7", nombre: "¿Cuánto sabes?" },
          { t: "t=+7", nombre: "Prueba sorpresa" },
        ]}
      />
      {paso <= 1 && (
        <div className="space-y-4">
          <p
            className={`rounded-2xl border bg-card p-5 text-lg leading-8 transition-colors ${lecturas > 0 ? "bg-warning/5" : ""}`}
          >
            {TEXTO_VO}
          </p>
          <Nota>
            Léelo con calma. Puedes releerlo hasta tres veces, como harías antes de un examen.
          </Nota>
          <div className="flex flex-wrap gap-3">
            <Accion
              secundaria
              disabled={lecturas >= 3}
              onClick={() => {
                setLecturas(lecturas + 1);
                setPaso(1);
              }}
            >
              Releer ({lecturas}/3)
            </Accion>
            <Accion onClick={() => setPaso(2)}>Ya lo tengo</Accion>
          </div>
        </div>
      )}
      {paso === 2 && (
        <div className="space-y-4">
          <Pregunta>
            Una semana después: ¿qué porcentaje de preguntas sobre ese texto responderías bien?
          </Pregunta>
          <input
            type="range"
            className="rango"
            min={0}
            max={100}
            value={confianza}
            onChange={(e) => setConfianza(Number(e.target.value))}
            aria-label="Tu confianza"
          />
          <p className="font-mono text-3xl font-bold">{confianza}%</p>
          <Accion onClick={() => setPaso(3)}>Hacer la prueba (sin el texto)</Accion>
        </div>
      )}
      {paso === 3 && (
        <div className="space-y-6">
          {PREGUNTAS_VO.map((q, i) => (
            <fieldset key={q.pregunta}>
              <legend className="mb-3 font-display text-lg font-bold">{q.pregunta}</legend>
              <div className="grid gap-2">
                {q.opciones.map((o, j) => (
                  <Opcion
                    key={o}
                    activa={respuestas[i] === j}
                    onClick={() => setRespuestas(respuestas.map((r, k) => (k === i ? j : r)))}
                  >
                    {o}
                  </Opcion>
                ))}
              </div>
            </fieldset>
          ))}
          <Accion disabled={respuestas.includes(null)} onClick={() => setPaso(4)}>
            Ver resultado
          </Accion>
        </div>
      )}
      {paso === 4 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-xs font-bold uppercase text-muted-foreground">Lo que sentías</p>
              <p className="font-mono text-4xl font-bold text-warning">{confianza}%</p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Lo que respondiste
              </p>
              <p className="font-mono text-4xl font-bold text-primary">{resultado}%</p>
            </div>
          </div>
          <Retro
            tipo={confianza - resultado > 15 ? "mal" : "info"}
            titulo={`Brecha: ${confianza - resultado > 0 ? "+" : ""}${confianza - resultado} puntos`}
          >
            Releíste {lecturas} {lecturas === 1 ? "vez" : "veces"}. Releer hace que el texto se
            sienta familiar, y esa familiaridad se confunde con saber. Además, aquí la prueba fue
            inmediata: a los 7 días, sin repasar, el modelo predice que recordarías mucho menos. Por
            eso releer es el método de control.
          </Retro>
          <Accion
            secundaria
            onClick={() => {
              setLecturas(0);
              setPaso(0);
              setRespuestas(PREGUNTAS_VO.map(() => null));
            }}
          >
            Repetir el experimento
          </Accion>
        </div>
      )}
    </div>
  );
}

// ── Recuperación: tarjetas con autoevaluación ────────────────────────────

type Juicio = "si" | "medio" | "no";

export function DemoRecuperacion() {
  const [cola, setCola] = useState(TARJETAS.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [visible, setVisible] = useState(false);
  const [intento, setIntento] = useState("");
  const [juicios, setJuicios] = useState<Record<number, Juicio>>({});
  const actual = cola[pos];
  const terminado = actual === undefined;
  const juzgar = (j: Juicio) => {
    setJuicios({ ...juicios, [actual!]: j });
    setVisible(false);
    setIntento("");
    setPos(pos + 1);
  };
  const falladas = Object.entries(juicios)
    .filter(([, j]) => j !== "si")
    .map(([i]) => Number(i));
  if (terminado) {
    return (
      <div className="space-y-4">
        <Retro
          tipo={falladas.length ? "info" : "bien"}
          titulo={`Recordaste ${TARJETAS.length - falladas.length} de ${TARJETAS.length} sin mirar`}
        >
          Las que dudaste o fallaste son justo las que más se benefician de otro intento: recuperar
          cuesta, y ese costo es lo que fortalece el recuerdo.
        </Retro>
        <div className="flex flex-wrap gap-3">
          {falladas.length > 0 && (
            <Accion
              onClick={() => {
                setCola(falladas);
                setPos(0);
                setJuicios({});
              }}
            >
              Repetir solo las {falladas.length} difíciles
            </Accion>
          )}
          <Accion
            secundaria
            onClick={() => {
              setCola(TARJETAS.map((_, i) => i));
              setPos(0);
              setJuicios({});
            }}
          >
            Empezar de nuevo
          </Accion>
        </div>
      </div>
    );
  }
  const tarjeta = TARJETAS[actual]!;
  return (
    <div className="space-y-4">
      <p className="font-mono text-xs font-bold text-muted-foreground">
        Tarjeta {pos + 1} de {cola.length}
      </p>
      <div className="rounded-2xl bg-panel p-6 text-panel-foreground shadow-card">
        <p className="font-display text-xl font-bold">{tarjeta.pregunta}</p>
        {visible && (
          <p className="aparecer mt-4 border-t border-panel-foreground/15 pt-4 leading-7 text-panel-foreground/85">
            {tarjeta.respuesta}
          </p>
        )}
      </div>
      {!visible ? (
        <>
          <textarea
            value={intento}
            onChange={(e) => setIntento(e.target.value)}
            rows={3}
            placeholder="Escribe tu respuesta de memoria. Escribir obliga a recuperar de verdad."
            className="w-full rounded-2xl border bg-card p-3"
            aria-label="Tu respuesta"
          />
          <Accion onClick={() => setVisible(true)}>Mostrar la respuesta</Accion>
        </>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Accion onClick={() => juzgar("si")}>Lo sabía</Accion>
          <Accion secundaria onClick={() => juzgar("medio")}>
            A medias
          </Accion>
          <Accion secundaria onClick={() => juzgar("no")}>
            No lo sabía
          </Accion>
        </div>
      )}
    </div>
  );
}

// ── Espaciada: sistema de cajas de Leitner ───────────────────────────────

const INTERVALOS = [1, 3, 7, 14, 28];

export function DemoEspaciada() {
  const [dia, setDia] = useState(1);
  const [cartas, setCartas] = useState(TARJETAS.map(() => ({ caja: 0, proximo: 1 })));
  const [visible, setVisible] = useState(false);
  const [historial, setHistorial] = useState<string[]>([]);
  const pendientes = cartas.map((c, i) => ({ ...c, i })).filter((c) => c.proximo <= dia);
  const actual = pendientes[0];
  const responder = (acierto: boolean) => {
    if (!actual) return;
    const caja = acierto ? Math.min(4, actual.caja + 1) : 0;
    setCartas(
      cartas.map((c, i) => (i === actual.i ? { caja, proximo: dia + INTERVALOS[caja]! } : c)),
    );
    setHistorial(
      [
        `t=+${dia}: tarjeta ${actual.i + 1} ${acierto ? `sube a la caja ${caja + 1}, vuelve en t=+${dia + INTERVALOS[caja]!}` : "vuelve a la caja 1, mañana otra vez"}`,
        ...historial,
      ].slice(0, 5),
    );
    setVisible(false);
  };
  const siguiente = Math.min(...cartas.map((c) => c.proximo));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 gap-2">
        {INTERVALOS.map((intervalo, caja) => {
          const n = cartas.filter((c) => c.caja === caja).length;
          return (
            <div
              key={caja}
              className={`rounded-2xl border p-3 text-center ${n ? "bg-primary/5" : "bg-card"}`}
            >
              <p className="text-[11px] font-bold uppercase text-muted-foreground">
                Caja {caja + 1}
              </p>
              <p className="font-mono text-2xl font-bold">{n}</p>
              <p className="text-[11px] text-muted-foreground">
                cada {intervalo} {intervalo === 1 ? "día" : "días"}
              </p>
            </div>
          );
        })}
      </div>
      <p className="font-mono text-sm font-bold text-primary">
        Hoy es t=+{dia} · {pendientes.length} para repasar
      </p>
      {actual ? (
        <div className="space-y-3">
          <div className="rounded-2xl bg-panel p-6 text-panel-foreground shadow-card">
            <p className="text-xs font-bold uppercase text-accent">Caja {actual.caja + 1}</p>
            <p className="mt-2 font-display text-xl font-bold">{TARJETAS[actual.i]!.pregunta}</p>
            {visible && (
              <p className="aparecer mt-4 border-t border-panel-foreground/15 pt-4 text-panel-foreground/85">
                {TARJETAS[actual.i]!.respuesta}
              </p>
            )}
          </div>
          {!visible ? (
            <Accion onClick={() => setVisible(true)}>Responder mentalmente y voltear</Accion>
          ) : (
            <div className="flex gap-3">
              <Accion onClick={() => responder(true)}>Acerté</Accion>
              <Accion secundaria onClick={() => responder(false)}>
                Fallé
              </Accion>
            </div>
          )}
        </div>
      ) : (
        <Retro tipo="bien" titulo="Nada que repasar hoy">
          El próximo repaso es en t=+{siguiente}. Ese silencio es el sistema funcionando: repasas
          justo antes de olvidar, no todos los días todo.
          <div className="mt-3">
            <Accion onClick={() => setDia(siguiente)}>Avanzar a t=+{siguiente}</Accion>
          </div>
        </Retro>
      )}
      {historial.length > 0 && (
        <ul className="space-y-1 font-mono text-xs text-muted-foreground">
          {historial.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Dominio: niveles que se desbloquean al 80% ───────────────────────────

const NIVELES: { nombre: string; preguntas: PreguntaMultiple[] }[] = [
  {
    nombre: "Value Object",
    preguntas: [
      {
        pregunta: "¿Dos Monto(10, PEN) son iguales?",
        opciones: [
          "Sí: se comparan por valor",
          "No: son objetos distintos",
          "Solo si son el mismo objeto en memoria",
        ],
        correcta: 0,
        porque: "Un Value Object no tiene identidad propia.",
      },
      {
        pregunta: "¿Cómo se cambia un Value Object?",
        opciones: ["Con un setter", "Creando uno nuevo", "Con __setattr__"],
        correcta: 1,
        porque: "Es inmutable: cada operación devuelve un objeto nuevo.",
      },
      {
        pregunta: "¿Qué ayuda a implementarlo en Python?",
        opciones: ["@property", "@staticmethod", "@dataclass(frozen=True)"],
        correcta: 2,
        porque: "frozen=True impide asignar atributos y genera __eq__ y __hash__.",
      },
      {
        pregunta: "¿Dónde se rechaza un Email mal formado?",
        opciones: ["En __post_init__ del Value Object", "En el controlador HTTP", "En la vista"],
        correcta: 0,
        porque: "Si no puede existir inválido, nadie tiene que volver a validarlo.",
      },
      {
        pregunta: "¿Cuál NO es un buen Value Object?",
        opciones: ["Rango de fechas", "Cliente con historial de compras", "Coordenadas"],
        correcta: 1,
        porque: "El cliente tiene identidad y ciclo de vida: es una Entidad.",
      },
    ],
  },
  {
    nombre: "Entidad",
    preguntas: [
      {
        pregunta: "¿Qué define a una Entidad?",
        opciones: [
          "Sus atributos",
          "Una identidad que perdura en el tiempo",
          "Su tabla en la base de datos",
        ],
        correcta: 1,
        porque: "Sigue siendo la misma aunque cambien sus datos.",
      },
      {
        pregunta: "Un cliente cambia de email. ¿Es el mismo cliente?",
        opciones: ["Sí", "No", "Depende de la base de datos"],
        correcta: 0,
        porque: "La identidad no depende de los atributos.",
      },
      {
        pregunta: "¿Cómo se comparan dos entidades?",
        opciones: ["Por todos sus campos", "Por su identificador", "Por referencia en memoria"],
        correcta: 1,
        porque: "Dos objetos con el mismo id representan la misma entidad.",
      },
      {
        pregunta: "¿Una entidad puede contener Value Objects?",
        opciones: ["Sí, es lo habitual", "No", "Solo si son mutables"],
        correcta: 0,
        porque: "Un Pedido tiene un Monto total; un Cliente tiene un Email.",
      },
      {
        pregunta: "Entre Pedido y Monto, ¿cuál es Entidad?",
        opciones: ["Monto", "Ambos", "Pedido"],
        correcta: 2,
        porque: "El pedido tiene ciclo de vida; el monto es un valor.",
      },
    ],
  },
  {
    nombre: "Agregado",
    preguntas: [
      {
        pregunta: "¿Para qué existe un agregado?",
        opciones: [
          "Para agrupar tablas",
          "Para garantizar invariantes de un grupo de objetos",
          "Para acelerar consultas",
        ],
        correcta: 1,
        porque: "Es una frontera de consistencia.",
      },
      {
        pregunta: "¿Cómo se agrega una línea a un pedido?",
        opciones: [
          "pedido.lineas.append(linea)",
          "pedido.agregar_linea(producto, cantidad)",
          "repo.lineas.guardar(linea)",
        ],
        correcta: 1,
        porque: "Solo la raíz puede verificar las reglas al agregar.",
      },
      {
        pregunta: "¿Cuántos agregados debería modificar una transacción?",
        opciones: ["Uno", "Todos los necesarios", "Ninguno"],
        correcta: 0,
        porque: "Si necesitas dos, revisa las fronteras o usa eventos.",
      },
      {
        pregunta: "¿Cómo referencia un agregado a otro?",
        opciones: ["Con el objeto completo", "Heredando de él", "Por su identificador"],
        correcta: 2,
        porque: "Referenciar por id mantiene las fronteras independientes.",
      },
      {
        pregunta: "¿Qué se guarda con el repositorio?",
        opciones: ["La raíz del agregado", "Cada línea por separado", "Los Value Objects sueltos"],
        correcta: 0,
        porque: "Hay un repositorio por agregado, no por tabla.",
      },
    ],
  },
];

export function DemoMaestria() {
  const [nivel, setNivel] = useState(0);
  const [desbloqueado, setDesbloqueado] = useState(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>([null, null, null, null, null]);
  const [corregido, setCorregido] = useState(false);
  const [intentos, setIntentos] = useState(1);
  const n = NIVELES[nivel]!;
  const aciertos = respuestas.filter((r, i) => r === n.preguntas[i]!.correcta).length;
  const aprobado = aciertos >= 4;
  const elegir = (i: number) => {
    setNivel(i);
    setRespuestas([null, null, null, null, null]);
    setCorregido(false);
    setIntentos(1);
  };
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        {NIVELES.map((l, i) => (
          <button
            key={l.nombre}
            type="button"
            disabled={i > desbloqueado}
            onClick={() => elegir(i)}
            className={`rounded-2xl border p-3 text-left transition-colors disabled:opacity-40 ${i === nivel ? "border-primary bg-primary/5" : "bg-card"}`}
          >
            <span className="block font-mono text-xs font-bold text-muted-foreground">
              Nivel {i + 1}
            </span>
            <span className="block font-display font-bold">{l.nombre}</span>
            <span className="block text-xs text-muted-foreground">
              {i < desbloqueado ? "dominado" : i === desbloqueado ? "en curso" : "bloqueado"}
            </span>
          </button>
        ))}
      </div>
      {n.preguntas.map((q, i) => (
        <fieldset key={q.pregunta}>
          <legend className="mb-2 font-semibold">
            {i + 1}. {q.pregunta}
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {q.opciones.map((o, j) => (
              <Opcion
                key={o}
                activa={respuestas[i] === j}
                disabled={corregido}
                estado={
                  corregido
                    ? j === q.correcta && respuestas[i] === j
                      ? "bien"
                      : respuestas[i] === j
                        ? "mal"
                        : null
                    : null
                }
                onClick={() => setRespuestas(respuestas.map((r, k) => (k === i ? j : r)))}
              >
                {o}
              </Opcion>
            ))}
          </div>
          {corregido && respuestas[i] !== q.correcta && (
            <p className="mt-2 text-sm text-muted-foreground">Práctica correctiva: {q.porque}</p>
          )}
        </fieldset>
      ))}
      {!corregido ? (
        <Accion
          disabled={respuestas.includes(null)}
          onClick={() => {
            setCorregido(true);
            if (aciertos >= 4)
              setDesbloqueado(Math.max(desbloqueado, Math.min(NIVELES.length - 1, nivel + 1)));
          }}
        >
          Evaluar nivel
        </Accion>
      ) : aprobado ? (
        <Retro tipo="bien" titulo={`${aciertos}/5: nivel dominado`}>
          {nivel < NIVELES.length - 1
            ? "Se desbloqueó el siguiente nivel. Construyes sobre una base sin huecos."
            : "Dominaste los tres niveles."}
          {nivel < NIVELES.length - 1 && (
            <div className="mt-3">
              <Accion onClick={() => elegir(nivel + 1)}>Ir al nivel {nivel + 2}</Accion>
            </div>
          )}
        </Retro>
      ) : (
        <Retro tipo="mal" titulo={`${aciertos}/5: aún no (se necesita 4)`}>
          Lee la práctica correctiva de cada fallo y vuelve a intentarlo. Intento {intentos}. En
          mastery learning el tiempo varía; el dominio no.
          <div className="mt-3">
            <Accion
              onClick={() => {
                setRespuestas([null, null, null, null, null]);
                setCorregido(false);
                setIntentos(intentos + 1);
              }}
            >
              Reintentar el nivel
            </Accion>
          </div>
        </Retro>
      )}
    </div>
  );
}
