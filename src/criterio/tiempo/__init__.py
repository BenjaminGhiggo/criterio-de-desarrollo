"""Núcleo compartido (shared kernel): el tiempo como sistema de referencia.

Todos los contextos del sistema hablan el mismo idioma sobre el tiempo:

* ``t < 0``  -> ANTES: el contexto, las fuerzas, las alternativas.
* ``t = 0``  -> DECISION: el instante en que se elige.
* ``t > 0``  -> DESPUES: las consecuencias de lo elegido.
"""

from criterio.tiempo.errores import ErrorDeDominio
from criterio.tiempo.instante import Fase, Instante
from criterio.tiempo.linea import EventoDeDominio, LineaDeTiempo
from criterio.tiempo.protagonista import Protagonista, Ubicacion

__all__ = [
    "ErrorDeDominio",
    "EventoDeDominio",
    "Fase",
    "Instante",
    "LineaDeTiempo",
    "Protagonista",
    "Ubicacion",
]
