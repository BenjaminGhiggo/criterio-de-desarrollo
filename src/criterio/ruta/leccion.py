from __future__ import annotations

from dataclasses import dataclass
from functools import cache
from typing import Any

from criterio.ejecucion import ejecutar


@dataclass(frozen=True)
class Pregunta:
    pregunta: str
    opciones: tuple[str, ...]
    correcta: int
    porque: str
    sobre_salida: bool = False  # si es True, una prueba verifica la respuesta contra la salida real


@dataclass(frozen=True)
class Uso:
    """Cómo se aplica una metodología en esta lección concreta."""

    metodologia: str
    como: str


@dataclass(frozen=True)
class LeccionDeCodigo:
    id: str
    unidad: str
    titulo: str
    concepto: str
    objetivo: str
    codigo: str
    idea_clave: str
    metodologias: tuple[Uso, ...]
    prediccion: Pregunta  # t<0: antes de ejecutar
    repaso: tuple[Pregunta, ...]  # t>0: después, sin mirar
    reto: str
    explica: str  # consigna para explicarlo con tus palabras

    def ejecutar(self) -> dict[str, Any]:
        return _ejecutar(self.codigo)


@cache
def _ejecutar(codigo: str) -> dict[str, Any]:
    return ejecutar(codigo)
