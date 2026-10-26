from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from criterio.ejecucion.motor import ejecutar
from criterio.tiempo import EventoDeDominio, Instante, Protagonista


@dataclass(frozen=True)
class PasoEjecutado(EventoDeDominio):
    paso: dict[str, Any]


class Programa(Protagonista[dict[str, Any]]):
    """El programa como protagonista: su estado en t es el paso t de su ejecución.

    El motor ya registró la ejecución real; aquí cada paso se vuelve un evento
    en la línea de tiempo común, así un programa se consulta igual que una
    decisión o un conocimiento: donde_esta(t), estado_en(t).
    """

    def __init__(self, codigo: str) -> None:
        super().__init__()
        self.codigo = codigo
        self.resultado = ejecutar(codigo)
        for paso in self.resultado["pasos"]:
            self._registrar(PasoEjecutado(Instante(paso["t"]), paso))

    def _estado_inicial(self) -> dict[str, Any]:
        return {"t": None, "tipo": "sin-compilar", "memoria": {"marcos": [], "objetos": []}}

    def _aplicar(self, estado: dict[str, Any], evento: EventoDeDominio) -> dict[str, Any]:
        return evento.paso if isinstance(evento, PasoEjecutado) else estado
