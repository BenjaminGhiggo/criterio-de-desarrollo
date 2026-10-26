"""Contexto "Ejecución": un programa como protagonista medido en el tiempo.

t=-1 Python compila, t=0 empieza, cada t>0 es un paso de la ejecución. En
cada instante se puede preguntar qué se ejecutó, qué sigue y dónde vive cada
variable.
"""

from criterio.ejecucion.motor import ejecutar, ejecutar_json, trazar
from criterio.ejecucion.programa import Programa

__all__ = ["Programa", "ejecutar", "ejecutar_json", "trazar"]
