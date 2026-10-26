from __future__ import annotations

from dataclasses import dataclass

from criterio.decisiones import Decision, Fuerza, Impacto
from criterio.tiempo import ErrorDeDominio

# Abreviaturas para escribir el catálogo como si fuera una tabla.
POS, NEU, NEG = Impacto.POSITIVO, Impacto.NEUTRO, Impacto.NEGATIVO


@dataclass(frozen=True)
class Camino:
    """Una opción de la lección junto con lo que le pasa con el tiempo si se elige."""

    clave: str
    titulo: str
    codigo: str
    consecuencias: tuple[tuple[int, str, Impacto], ...]


@dataclass(frozen=True)
class Leccion:
    id: str
    titulo: str
    concepto: str
    pregunta: str
    contexto: str
    fuerzas: tuple[Fuerza, ...]
    opciones: tuple[Camino, ...]
    recomendada: str
    justificacion: tuple[str, ...]
    explicacion: str

    def camino(self, clave: str) -> Camino:
        for camino in self.opciones:
            if camino.clave == clave:
                return camino
        raise ErrorDeDominio(f"La lección '{self.id}' no tiene la opción '{clave}'")

    def vivir(self, clave: str) -> Decision:
        """Reproduce la decisión completa eligiendo ``clave`` en t=0.

        Para los caminos no recomendados se usa como justificación la fuerza
        que más tienta a elegirlos (la primera que se nombró), porque nadie
        elige mal sin una razón aparente.
        """
        camino = self.camino(clave)
        decision = Decision(self.pregunta)
        t_fuerzas = range(-len(self.fuerzas) - 1, -1)
        for t, fuerza in zip(t_fuerzas, self.fuerzas, strict=True):
            decision.identificar_fuerza(t, fuerza.nombre, fuerza.descripcion)
        for opcion in self.opciones:
            decision.considerar_opcion(-1, opcion.clave, opcion.titulo)
        justificacion = self.justificacion if clave == self.recomendada else (self.fuerzas[0].nombre,)
        decision.decidir(clave, justificacion)
        for t, descripcion, impacto in camino.consecuencias:
            decision.observar(t, descripcion, impacto)
        return decision
