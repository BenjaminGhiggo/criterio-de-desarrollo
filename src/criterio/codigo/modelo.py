from __future__ import annotations

from dataclasses import dataclass, replace
from enum import Enum

from criterio.tiempo import ErrorDeDominio, EventoDeDominio, Fase, Instante, Protagonista, Ubicacion

COBERTURA_MINIMA_PARA_REFACTORIZAR = 0.7
DEUDA_POR_CAMBIO_SIN_PRUEBA = 1
DEUDA_PAGADA_POR_REFACTOR = 2


class Riesgo(Enum):
    BAJO = "bajo"
    MEDIO = "medio"
    ALTO = "alto"


@dataclass(frozen=True)
class PruebaEscrita(EventoDeDominio):
    pass


@dataclass(frozen=True)
class ModuloPublicado(EventoDeDominio):
    comportamientos: int


@dataclass(frozen=True)
class CambioRealizado(EventoDeDominio):
    con_prueba: bool


@dataclass(frozen=True)
class Refactorizado(EventoDeDominio):
    pass


@dataclass(frozen=True)
class FotoModulo:
    publicado: bool = False
    comportamientos: int = 0
    pruebas: int = 0
    pruebas_primero: int = 0
    deuda: int = 0

    @property
    def cobertura(self) -> float:
        if not self.comportamientos:
            return 0.0
        return min(1.0, self.pruebas / self.comportamientos)

    @property
    def costo_de_cambio(self) -> float:
        """1.0 es el costo de cambiar código limpio y probado. Todo lo demás es más caro."""
        return round((1 + 0.35 * self.deuda) * (2 - self.cobertura), 2)

    @property
    def riesgo(self) -> Riesgo:
        if self.costo_de_cambio < 1.5:
            return Riesgo.BAJO
        if self.costo_de_cambio < 3:
            return Riesgo.MEDIO
        return Riesgo.ALTO


class Modulo(Protagonista[FotoModulo]):
    def __init__(self, nombre: str) -> None:
        super().__init__()
        self.nombre = nombre

    def escribir_prueba(self, t: int) -> None:
        self._registrar(PruebaEscrita(Instante(t)))

    def publicar(self, *, comportamientos: int) -> None:
        if self.estado_actual.publicado:
            raise ErrorDeDominio("El módulo ya fue publicado en t=0")
        if comportamientos < 1:
            raise ErrorDeDominio("Un módulo sin comportamiento no se publica")
        self._registrar(ModuloPublicado(Instante.presente(), comportamientos))

    def cambiar(self, t: int, *, con_prueba: bool) -> None:
        instante = self._exigir_mantenimiento(t)
        self._registrar(CambioRealizado(instante, con_prueba))

    def refactorizar(self, t: int) -> None:
        instante = self._exigir_mantenimiento(t)
        if self.estado_actual.cobertura < COBERTURA_MINIMA_PARA_REFACTORIZAR:
            raise ErrorDeDominio("Refactorizar sin pruebas es reescribir sin red de seguridad")
        self._registrar(Refactorizado(instante))

    def _exigir_mantenimiento(self, t: int) -> Instante:
        instante = Instante(t)
        if not self.estado_actual.publicado:
            raise ErrorDeDominio("Solo se mantiene lo que ya fue publicado")
        if instante.fase is not Fase.DESPUES:
            raise ErrorDeDominio(f"El mantenimiento ocurre después de publicar (t>0); se recibió {instante}")
        return instante

    def _estado_inicial(self) -> FotoModulo:
        return FotoModulo()

    def _aplicar(self, foto: FotoModulo, evento: EventoDeDominio) -> FotoModulo:
        match evento:
            case PruebaEscrita(instante=instante):
                primero = foto.pruebas_primero + (1 if instante.fase is Fase.ANTES else 0)
                return replace(foto, pruebas=foto.pruebas + 1, pruebas_primero=primero)
            case ModuloPublicado(comportamientos=n):
                return replace(foto, publicado=True, comportamientos=n)
            case CambioRealizado(con_prueba=True):
                return replace(foto, comportamientos=foto.comportamientos + 1, pruebas=foto.pruebas + 1)
            case CambioRealizado(con_prueba=False):
                return replace(
                    foto,
                    comportamientos=foto.comportamientos + 1,
                    deuda=foto.deuda + DEUDA_POR_CAMBIO_SIN_PRUEBA,
                )
            case Refactorizado():
                return replace(foto, deuda=max(0, foto.deuda - DEUDA_PAGADA_POR_REFACTOR))
        return foto


# --- Simulación: la misma historia con dos criterios distintos ---------------

ESTRATEGIAS = {
    "tdd": "Prueba primero, luego el código mínimo, luego refactor",
    "pruebas-despues": "Código primero, pruebas cuando hay tiempo",
    "sin-pruebas": "Código directo a producción",
}

COMPORTAMIENTOS_INICIALES = 3


def simular(estrategia: str, pasos: int) -> list[Ubicacion[FotoModulo]]:
    if estrategia not in ESTRATEGIAS:
        raise ErrorDeDominio(f"Estrategia desconocida: {estrategia}")
    m = Modulo(estrategia)
    inicio = -COMPORTAMIENTOS_INICIALES
    if estrategia == "tdd":
        for t in range(inicio, 0):
            m.escribir_prueba(t)
    m.publicar(comportamientos=COMPORTAMIENTOS_INICIALES)
    for t in range(1, pasos + 1):
        if estrategia == "tdd":
            m.cambiar(t, con_prueba=True)
        elif estrategia == "pruebas-despues":
            # Se prueba un cambio de cada dos; la deuda nunca se termina de pagar.
            m.cambiar(t, con_prueba=t % 2 == 0)
            if t % 2 == 0:
                m.escribir_prueba(t)
        else:
            m.cambiar(t, con_prueba=False)
    return m.trayectoria(inicio, pasos)
