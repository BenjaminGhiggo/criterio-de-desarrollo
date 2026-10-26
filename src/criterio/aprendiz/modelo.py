from __future__ import annotations

from dataclasses import dataclass, replace
from enum import Enum

from criterio.tiempo import ErrorDeDominio, EventoDeDominio, Fase, Instante, Protagonista


class Etapa(Enum):
    """Las cuatro etapas de la competencia."""

    INCOMPETENCIA_INCONSCIENTE = "No sabe lo que no sabe"
    INCOMPETENCIA_CONSCIENTE = "Sabe lo que no sabe"
    COMPETENCIA_CONSCIENTE = "Sabe, pensando el porqué"
    COMPETENCIA_INCONSCIENTE = "Sabe, y el porqué ya es intuición"


# Cuánto mueve el criterio cada combinación (acertó, justificó).
# Acertar sin saber por qué vale poco: la próxima vez puede ser azar.
PUNTOS = {
    (True, True): 10,
    (True, False): 2,
    (False, True): 4,
    (False, False): -3,
}

UMBRAL_COMPETENCIA = 50
UMBRAL_MAESTRIA = 80
RACHA_MAESTRIA = 3


@dataclass(frozen=True)
class DiagnosticoRealizado(EventoDeDominio):
    puntaje: int


@dataclass(frozen=True)
class CompromisoAsumido(EventoDeDominio):
    meta: str


@dataclass(frozen=True)
class LeccionResuelta(EventoDeDominio):
    leccion: str
    acerto: bool
    justifico: bool


@dataclass(frozen=True)
class FotoAprendiz:
    criterio: int = 0
    diagnosticado: bool = False
    meta: str | None = None
    racha: int = 0
    consciente: bool = False
    resueltas: tuple[str, ...] = ()

    @property
    def etapa(self) -> Etapa:
        if self.criterio >= UMBRAL_MAESTRIA and self.racha >= RACHA_MAESTRIA:
            return Etapa.COMPETENCIA_INCONSCIENTE
        if self.criterio >= UMBRAL_COMPETENCIA:
            return Etapa.COMPETENCIA_CONSCIENTE
        if self.consciente:
            return Etapa.INCOMPETENCIA_CONSCIENTE
        return Etapa.INCOMPETENCIA_INCONSCIENTE


class Aprendiz(Protagonista[FotoAprendiz]):
    def __init__(self, nombre: str) -> None:
        super().__init__()
        self.nombre = nombre

    def diagnosticar(self, t: int, puntaje: int) -> None:
        instante = Instante(t)
        if instante.fase is not Fase.ANTES:
            raise ErrorDeDominio(f"El diagnóstico es antes de empezar (t<0); se recibió {instante}")
        if not 0 <= puntaje <= 100:
            raise ErrorDeDominio("El diagnóstico va de 0 a 100")
        self._registrar(DiagnosticoRealizado(instante, puntaje))

    def comprometerse(self, meta: str) -> None:
        if not self.estado_actual.diagnosticado:
            raise ErrorDeDominio("Sin diagnóstico no se sabe desde dónde se parte")
        self._registrar(CompromisoAsumido(Instante.presente(), meta))

    def resolver(self, t: int, leccion: str, *, acerto: bool, justifico: bool) -> None:
        instante = Instante(t)
        if instante.fase is not Fase.DESPUES:
            raise ErrorDeDominio(f"La práctica ocurre después del compromiso (t>0); se recibió {instante}")
        if self.estado_actual.meta is None:
            raise ErrorDeDominio("No hay práctica sin compromiso en t=0")
        self._registrar(LeccionResuelta(instante, leccion, acerto, justifico))

    def _estado_inicial(self) -> FotoAprendiz:
        return FotoAprendiz()

    def _aplicar(self, foto: FotoAprendiz, evento: EventoDeDominio) -> FotoAprendiz:
        match evento:
            case DiagnosticoRealizado(puntaje=puntaje):
                return replace(foto, criterio=puntaje, diagnosticado=True)
            case CompromisoAsumido(meta=meta):
                return replace(foto, meta=meta)
            case LeccionResuelta(leccion=leccion, acerto=acerto, justifico=justifico):
                criterio = min(100, max(0, foto.criterio + PUNTOS[(acerto, justifico)]))
                return replace(
                    foto,
                    criterio=criterio,
                    racha=foto.racha + 1 if acerto and justifico else 0,
                    consciente=foto.consciente or justifico,
                    resueltas=(*foto.resueltas, leccion),
                )
        return foto
