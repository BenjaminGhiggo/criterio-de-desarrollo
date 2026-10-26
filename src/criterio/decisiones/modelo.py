from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass, replace
from enum import Enum

from criterio.tiempo import ErrorDeDominio, EventoDeDominio, Fase, Instante, Protagonista


class Impacto(Enum):
    POSITIVO = 1
    NEUTRO = 0
    NEGATIVO = -1


class EstadoDecision(Enum):
    EN_CONTEXTO = "en contexto"
    DECIDIDA = "decidida"
    VALIDADA = "validada"
    CUESTIONADA = "cuestionada"


# --- Value Objects -----------------------------------------------------------


@dataclass(frozen=True)
class Fuerza:
    """Algo que empuja la decisión: un requisito, un riesgo, una restricción."""

    nombre: str
    descripcion: str


@dataclass(frozen=True)
class Opcion:
    clave: str
    descripcion: str


@dataclass(frozen=True)
class Consecuencia:
    instante: Instante
    descripcion: str
    impacto: Impacto


# --- Eventos -----------------------------------------------------------------


@dataclass(frozen=True)
class FuerzaIdentificada(EventoDeDominio):
    fuerza: Fuerza


@dataclass(frozen=True)
class OpcionConsiderada(EventoDeDominio):
    opcion: Opcion


@dataclass(frozen=True)
class DecisionTomada(EventoDeDominio):
    clave: str
    justificacion: tuple[str, ...]


@dataclass(frozen=True)
class ConsecuenciaObservada(EventoDeDominio):
    consecuencia: Consecuencia


# --- Estado proyectado -------------------------------------------------------


@dataclass(frozen=True)
class FotoDecision:
    """Cómo se ve la decisión en un instante dado."""

    estado: EstadoDecision = EstadoDecision.EN_CONTEXTO
    fuerzas: tuple[Fuerza, ...] = ()
    opciones: tuple[Opcion, ...] = ()
    elegida: Opcion | None = None
    justificacion: tuple[str, ...] = ()
    consecuencias: tuple[Consecuencia, ...] = ()

    @property
    def balance(self) -> int:
        return sum(c.impacto.value for c in self.consecuencias)

    def opcion(self, clave: str) -> Opcion | None:
        return next((o for o in self.opciones if o.clave == clave), None)


def _estado_por_balance(balance: int) -> EstadoDecision:
    if balance > 0:
        return EstadoDecision.VALIDADA
    if balance < 0:
        return EstadoDecision.CUESTIONADA
    return EstadoDecision.DECIDIDA


# --- Raíz de agregado --------------------------------------------------------


class Decision(Protagonista[FotoDecision]):
    """Una decisión técnica vivida en el tiempo.

    Invariantes (el "criterio" convertido en reglas):

    * Fuerzas y opciones pertenecen a t<0: se piensa antes de elegir.
    * Se decide exactamente una vez, en t=0.
    * Sin al menos dos opciones no hay decisión, hay costumbre.
    * Toda elección cita las fuerzas que la justifican: el "por qué".
    * Las consecuencias pertenecen a t>0 y solo existen si hubo decisión.
    """

    def __init__(self, pregunta: str) -> None:
        super().__init__()
        if not pregunta.strip():
            raise ErrorDeDominio("Una decisión necesita una pregunta")
        self.pregunta = pregunta.strip()

    # Comandos

    def identificar_fuerza(self, t: int, nombre: str, descripcion: str) -> None:
        instante = _exigir_fase(t, Fase.ANTES, "Las fuerzas se identifican antes de decidir (t<0)")
        self._registrar(FuerzaIdentificada(instante, Fuerza(nombre, descripcion)))

    def considerar_opcion(self, t: int, clave: str, descripcion: str) -> None:
        instante = _exigir_fase(t, Fase.ANTES, "Las opciones se consideran antes de decidir (t<0)")
        if self.estado_actual.opcion(clave):
            raise ErrorDeDominio(f"La opción '{clave}' ya fue considerada")
        self._registrar(OpcionConsiderada(instante, Opcion(clave, descripcion)))

    def decidir(self, clave: str, justificacion: Iterable[str]) -> None:
        foto = self.estado_actual
        justificacion = tuple(justificacion)
        if foto.elegida:
            raise ErrorDeDominio("La decisión ya fue tomada en t=0")
        if len(foto.opciones) < 2:
            raise ErrorDeDominio("Se necesitan al menos dos opciones: sin alternativas no hay criterio")
        if not foto.opcion(clave):
            raise ErrorDeDominio(f"La opción '{clave}' no fue considerada")
        if not justificacion:
            raise ErrorDeDominio("Una decisión sin justificación no enseña nada")
        conocidas = {f.nombre for f in foto.fuerzas}
        desconocidas = [j for j in justificacion if j not in conocidas]
        if desconocidas:
            raise ErrorDeDominio(f"La justificación cita fuerzas no identificadas: {', '.join(desconocidas)}")
        self._registrar(DecisionTomada(Instante.presente(), clave, justificacion))

    def observar(self, t: int, descripcion: str, impacto: Impacto) -> None:
        instante = _exigir_fase(t, Fase.DESPUES, "Las consecuencias se observan después de decidir (t>0)")
        if not self.estado_actual.elegida:
            raise ErrorDeDominio("No hay consecuencias de una decisión sin decidir")
        self._registrar(ConsecuenciaObservada(instante, Consecuencia(instante, descripcion, impacto)))

    # Proyección

    def _estado_inicial(self) -> FotoDecision:
        return FotoDecision()

    def _aplicar(self, foto: FotoDecision, evento: EventoDeDominio) -> FotoDecision:
        match evento:
            case FuerzaIdentificada(fuerza=fuerza):
                return replace(foto, fuerzas=(*foto.fuerzas, fuerza))
            case OpcionConsiderada(opcion=opcion):
                return replace(foto, opciones=(*foto.opciones, opcion))
            case DecisionTomada(clave=clave, justificacion=justificacion):
                return replace(
                    foto,
                    estado=EstadoDecision.DECIDIDA,
                    elegida=foto.opcion(clave),
                    justificacion=justificacion,
                )
            case ConsecuenciaObservada(consecuencia=consecuencia):
                nueva = replace(foto, consecuencias=(*foto.consecuencias, consecuencia))
                return replace(nueva, estado=_estado_por_balance(nueva.balance))
        return foto


def _exigir_fase(t: int, fase: Fase, mensaje: str) -> Instante:
    instante = Instante(t)
    if instante.fase is not fase:
        raise ErrorDeDominio(f"{mensaje}; se recibió {instante}")
    return instante
