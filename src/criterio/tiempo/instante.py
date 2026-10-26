from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from criterio.tiempo.errores import ErrorDeDominio


class Fase(Enum):
    ANTES = "t<0"
    DECISION = "t=0"
    DESPUES = "t>0"

    @property
    def pregunta(self) -> str:
        return _PREGUNTAS[self]

    @property
    def nombre_legible(self) -> str:
        return _NOMBRES[self]


_PREGUNTAS = {
    Fase.ANTES: "¿Por qué hay que decidir? ¿Qué fuerzas y alternativas existen?",
    Fase.DECISION: "¿Qué se elige y con qué justificación?",
    Fase.DESPUES: "¿Qué consecuencia tuvo lo elegido con el paso del tiempo?",
}

_NOMBRES = {
    Fase.ANTES: "Antes",
    Fase.DECISION: "Decisión",
    Fase.DESPUES: "Después",
}


@dataclass(frozen=True, order=True)
class Instante:
    """Un punto en el tiempo relativo al momento de decisión.

    Es un Value Object: no tiene identidad, dos instantes con el mismo ``t``
    son el mismo instante, y no cambia nunca.
    """

    t: int

    def __post_init__(self) -> None:
        if isinstance(self.t, bool) or not isinstance(self.t, int):
            raise ErrorDeDominio(f"El tiempo debe ser un entero, se recibió {self.t!r}")

    @classmethod
    def presente(cls) -> Instante:
        return cls(0)

    @property
    def fase(self) -> Fase:
        if self.t < 0:
            return Fase.ANTES
        if self.t == 0:
            return Fase.DECISION
        return Fase.DESPUES

    @property
    def distancia_al_presente(self) -> int:
        return abs(self.t)

    def __str__(self) -> str:
        return f"t={self.t:+d}" if self.t else "t=0"
