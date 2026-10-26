from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from functools import reduce
from typing import Generic, TypeVar

from criterio.tiempo.instante import Fase, Instante
from criterio.tiempo.linea import EventoDeDominio, LineaDeTiempo

S = TypeVar("S")


@dataclass(frozen=True)
class Ubicacion(Generic[S]):
    """Respuesta a "¿en qué estado se encuentra y dónde está?" para un instante."""

    instante: Instante
    fase: Fase
    estado: S
    eventos_vividos: int


class Protagonista(ABC, Generic[S]):
    """Raíz de agregado que se mide en el tiempo.

    No guarda su estado: guarda lo que le pasó. El estado en cualquier ``t``
    es la proyección (``reduce``) de sus eventos hasta ``t``. Así podemos
    preguntar cómo estaba antes de decidir, al decidir y después, sin
    mantener copias desincronizadas.
    """

    def __init__(self) -> None:
        self._linea: LineaDeTiempo[EventoDeDominio] = LineaDeTiempo()

    @abstractmethod
    def _estado_inicial(self) -> S: ...

    @abstractmethod
    def _aplicar(self, estado: S, evento: EventoDeDominio) -> S: ...

    def _registrar(self, evento: EventoDeDominio) -> None:
        self._linea = self._linea.registrar(evento)

    @property
    def eventos(self) -> LineaDeTiempo[EventoDeDominio]:
        return self._linea

    @property
    def ultimo_instante(self) -> Instante:
        return self._linea.ultimo_instante or Instante.presente()

    def estado_en(self, t: Instante | int) -> S:
        instante = t if isinstance(t, Instante) else Instante(t)
        return reduce(self._aplicar, self._linea.hasta(instante), self._estado_inicial())

    @property
    def estado_actual(self) -> S:
        return reduce(self._aplicar, self._linea, self._estado_inicial())

    def donde_esta(self, t: Instante | int) -> Ubicacion[S]:
        instante = t if isinstance(t, Instante) else Instante(t)
        return Ubicacion(
            instante=instante,
            fase=instante.fase,
            estado=self.estado_en(instante),
            eventos_vividos=len(self._linea.hasta(instante)),
        )

    def trayectoria(self, desde: int, hasta: int) -> list[Ubicacion[S]]:
        return [self.donde_esta(t) for t in range(desde, hasta + 1)]
