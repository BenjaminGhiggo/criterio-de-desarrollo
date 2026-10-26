from __future__ import annotations

from collections.abc import Iterable, Iterator
from dataclasses import dataclass
from typing import Generic, TypeVar

from criterio.tiempo.instante import Fase, Instante


@dataclass(frozen=True)
class EventoDeDominio:
    """Algo que le ocurrió al protagonista en un instante. Los hechos no cambian."""

    instante: Instante


E = TypeVar("E", bound=EventoDeDominio)


class LineaDeTiempo(Generic[E]):
    """Secuencia inmutable de eventos ordenada por instante.

    El orden de llegada se respeta dentro de un mismo instante (``sorted`` es
    estable), así que la historia es determinista.
    """

    def __init__(self, eventos: Iterable[E] = ()) -> None:
        self._eventos: tuple[E, ...] = tuple(sorted(eventos, key=lambda e: e.instante))

    def registrar(self, evento: E) -> LineaDeTiempo[E]:
        return LineaDeTiempo((*self._eventos, evento))

    def hasta(self, instante: Instante) -> tuple[E, ...]:
        return tuple(e for e in self._eventos if e.instante <= instante)

    def en_fase(self, fase: Fase) -> tuple[E, ...]:
        return tuple(e for e in self._eventos if e.instante.fase is fase)

    @property
    def ultimo_instante(self) -> Instante | None:
        return self._eventos[-1].instante if self._eventos else None

    def __iter__(self) -> Iterator[E]:
        return iter(self._eventos)

    def __len__(self) -> int:
        return len(self._eventos)
