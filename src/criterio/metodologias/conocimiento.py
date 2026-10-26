"""El protagonista: tu conocimiento de un concepto, medido en el tiempo.

Modelo ilustrativo. Los números no salen de un experimento: están elegidos
para que el modelo respete los hallazgos de la investigación (ver
tests/test_metodologias.py). Sirve para comparar metodologías entre sí, no
para predecir tu nota.

* Retención: curva del olvido exponencial, R(t) = exp(-(t - último repaso) / S).
  Cada actividad multiplica la estabilidad S. Recuperar cuando ya olvidaste un
  poco fortalece más (dificultad deseable). Lo que se comprende se olvida más
  lento: la estabilidad efectiva crece con la comprensión.
* Comprensión, transferencia y criterio: 0 a 100, con rendimientos decrecientes.
* Confianza: lo que sientes que sabes. No siempre coincide con lo que recuerdas.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, replace
from enum import Enum

from criterio.tiempo import ErrorDeDominio, EventoDeDominio, Fase, Instante, Protagonista

ESTABILIDAD_INICIAL = 2.0  # días que tarda en caer la retención a ~37% sin repasar ni comprender
CONFIANZA_INICIAL = 30.0  # "algo me suena" antes de empezar


class Actividad(Enum):
    # t<0: preparación
    PREGUNTA_PREVIA = "pregunta-previa"
    PREDICCION = "prediccion"
    INTENTO = "intento"
    PREMORTEM = "premortem"
    # t=0: encuentro con el concepto
    EXPLICACION = "explicacion"
    EJEMPLO_RESUELTO = "ejemplo-resuelto"
    # t>0: consolidación
    RELECTURA = "relectura"
    RECUPERACION = "recuperacion"
    AUTOEXPLICACION = "autoexplicacion"
    APLICACION = "aplicacion"
    INTERCALADO = "intercalado"
    ERROR_ANALIZADO = "error-analizado"
    ORDENAMIENTO = "ordenamiento"
    PRACTICA_DELIBERADA = "practica-deliberada"
    ENSENANZA = "ensenanza"
    CONTRAFACTUAL = "contrafactual"
    REFLEXION = "reflexion"


@dataclass(frozen=True)
class Efecto:
    """Lo que una actividad le hace al conocimiento. Es la tabla de supuestos del modelo."""

    fase: Fase
    nombre: str
    minutos: int
    por_que: str
    preparacion: float = 0.0  # solo t<0: mejora el encuentro en t=0
    estabilidad: float = 1.0  # multiplicador fijo de S
    dificultad: float = 0.0  # multiplicador extra proporcional a lo olvidado (1 - R)
    comprension: float = 0.0
    transferencia: float = 0.0
    criterio: float = 0.0
    confianza: float = 0.0


A, F = Actividad, Fase

EFECTOS: dict[Actividad, Efecto] = {
    A.PREGUNTA_PREVIA: Efecto(
        F.ANTES, "Pregunta previa", 5, "Preguntarse antes activa lo que ya sabes y orienta la atención (efecto de pretest).",
        preparacion=0.2, criterio=4,
    ),
    A.PREDICCION: Efecto(
        F.ANTES, "Predicción", 5, "Comprometerse con una predicción crea una expectativa que el resultado confirma o rompe.",
        preparacion=0.25, comprension=0, confianza=-2,
    ),
    A.INTENTO: Efecto(
        F.ANTES, "Intento sin instrucción", 20, "Fallar antes de la explicación revela qué partes del problema importan (fracaso productivo).",
        preparacion=0.35, transferencia=8, confianza=-10,
    ),
    A.PREMORTEM: Efecto(
        F.ANTES, "Pre-mortem", 10, "Imaginar que ya fracasó obliga a nombrar riesgos que el optimismo oculta.",
        preparacion=0.15, criterio=10,
    ),
    A.EXPLICACION: Efecto(
        F.DECISION, "Explicación", 30, "El primer encuentro: alguien (o un texto) explica el concepto.",
        comprension=35, transferencia=8, criterio=8, confianza=25,
    ),
    A.EJEMPLO_RESUELTO: Efecto(
        F.DECISION, "Ejemplo resuelto", 30, "Ver un problema resuelto paso a paso reduce la carga cognitiva del principiante.",
        comprension=45, transferencia=8, criterio=6, confianza=25,
    ),
    A.RELECTURA: Efecto(
        F.DESPUES, "Relectura", 10, "Releer da familiaridad, no recuerdo: se siente como aprender (ilusión de fluidez).",
        estabilidad=1.1, comprension=2, confianza=12,
    ),
    A.RECUPERACION: Efecto(
        F.DESPUES, "Recuperación", 10, "Sacar de memoria sin mirar fortalece el recuerdo más que volver a ver (efecto de prueba).",
        estabilidad=1.6, dificultad=1.8, comprension=4, confianza=4,
    ),
    A.AUTOEXPLICACION: Efecto(
        F.DESPUES, "Autoexplicación", 15, "Explicar con tus palabras obliga a conectar ideas y expone huecos.",
        estabilidad=1.4, comprension=12, transferencia=4, criterio=10, confianza=3,
    ),
    A.APLICACION: Efecto(
        F.DESPUES, "Aplicación", 30, "Usar el concepto en un problema nuevo construye transferencia.",
        estabilidad=1.5, comprension=6, transferencia=12, criterio=6, confianza=5,
    ),
    A.INTERCALADO: Efecto(
        F.DESPUES, "Práctica intercalada", 15, "Mezclar tipos de problemas enseña a elegir qué técnica aplica; se siente más difícil.",
        estabilidad=1.4, dificultad=1.4, transferencia=12, criterio=8, confianza=-2,
    ),
    A.ERROR_ANALIZADO: Efecto(
        F.DESPUES, "Análisis de errores", 15, "Encontrar y explicar un error enseña los límites de una regla.",
        estabilidad=1.3, comprension=8, transferencia=4, criterio=10,
    ),
    A.ORDENAMIENTO: Efecto(
        F.DESPUES, "Ordenar código", 10, "Reordenar líneas dadas enfoca en la estructura sin el costo de escribir todo.",
        estabilidad=1.25, comprension=6, confianza=3,
    ),
    A.PRACTICA_DELIBERADA: Efecto(
        F.DESPUES, "Práctica deliberada", 25, "Repetir un ejercicio acotado con meta y retroalimentación, al borde de tu capacidad.",
        estabilidad=1.45, comprension=4, transferencia=10, criterio=4, confianza=4,
    ),
    A.ENSENANZA: Efecto(
        F.DESPUES, "Enseñar", 25, "Preparar y dar una explicación a otro organiza el conocimiento (efecto protegido).",
        estabilidad=1.5, comprension=10, transferencia=4, criterio=8, confianza=4,
    ),
    A.CONTRAFACTUAL: Efecto(
        F.DESPUES, "Contrafactual", 15, "Preguntar qué habría pasado con la otra opción hace visible el porqué.",
        estabilidad=1.2, transferencia=8, criterio=14,
    ),
    A.REFLEXION: Efecto(
        F.DESPUES, "Reflexión escrita", 10, "Escribir qué esperabas y qué pasó convierte experiencia en criterio.",
        estabilidad=1.15, comprension=4, criterio=12,
    ),
}


def _sumar(valor: float, ganancia: float) -> float:
    """Rendimientos decrecientes: cuanto más sabes, menos suma cada actividad."""
    if ganancia >= 0:
        return valor + ganancia * (1 - valor / 100)
    return max(0.0, valor + ganancia)


@dataclass(frozen=True)
class ActividadRealizada(EventoDeDominio):
    actividad: Actividad


@dataclass(frozen=True)
class FotoConocimiento:
    encontrado: bool = False
    preparacion: float = 0.0
    estabilidad: float = 0.0
    ultimo_repaso: int | None = None
    comprension: float = 0.0
    transferencia: float = 0.0
    criterio: float = 0.0
    confianza: float = CONFIANZA_INICIAL
    minutos: int = 0
    actividades: tuple[Actividad, ...] = ()

    @property
    def estabilidad_efectiva(self) -> float:
        return self.estabilidad * (1 + self.comprension / 100)

    def retencion(self, t: int) -> float:
        if not self.encontrado or self.ultimo_repaso is None or t < self.ultimo_repaso:
            return 0.0
        return math.exp(-(t - self.ultimo_repaso) / self.estabilidad_efectiva)


@dataclass(frozen=True)
class Medicion:
    """Dónde está y en qué estado se encuentra el conocimiento en un instante."""

    t: int
    fase: Fase
    retencion: float
    comprension: float
    transferencia: float
    criterio: float
    confianza: float
    minutos: int

    @property
    def brecha(self) -> float:
        """Positiva: crees saber más de lo que recuerdas."""
        return self.confianza - self.retencion

    @property
    def dominio(self) -> float:
        return (self.retencion + self.comprension + self.transferencia + self.criterio) / 4


class Conocimiento(Protagonista[FotoConocimiento]):
    def __init__(self, concepto: str) -> None:
        super().__init__()
        self.concepto = concepto

    def realizar(self, t: int, actividad: Actividad) -> None:
        instante = Instante(t)
        efecto = EFECTOS[actividad]
        foto = self.estado_actual
        if efecto.fase is Fase.ANTES and instante.fase is not Fase.ANTES:
            raise ErrorDeDominio(f"{efecto.nombre} es preparación: ocurre en t<0; se recibió {instante}")
        if efecto.fase is Fase.DECISION:
            if instante.fase is not Fase.DECISION:
                raise ErrorDeDominio(f"{efecto.nombre} es el encuentro: ocurre en t=0; se recibió {instante}")
            if foto.encontrado:
                raise ErrorDeDominio("El encuentro con el concepto ocurre una sola vez")
        if efecto.fase is Fase.DESPUES:
            if instante.fase is not Fase.DESPUES:
                raise ErrorDeDominio(f"{efecto.nombre} es consolidación: ocurre en t>0; se recibió {instante}")
            if not foto.encontrado:
                raise ErrorDeDominio("No se consolida lo que todavía no se encontró")
        self._registrar(ActividadRealizada(instante, actividad))

    def medir(self, t: int) -> Medicion:
        foto = self.estado_en(t)
        return Medicion(
            t=t,
            fase=Instante(t).fase,
            retencion=100 * foto.retencion(t),
            comprension=foto.comprension,
            transferencia=foto.transferencia,
            criterio=foto.criterio,
            confianza=foto.confianza,
            minutos=foto.minutos,
        )

    def _estado_inicial(self) -> FotoConocimiento:
        return FotoConocimiento()

    def _aplicar(self, foto: FotoConocimiento, evento: EventoDeDominio) -> FotoConocimiento:
        if not isinstance(evento, ActividadRealizada):
            return foto
        t = evento.instante.t
        e = EFECTOS[evento.actividad]
        foto = replace(
            foto,
            minutos=foto.minutos + e.minutos,
            actividades=(*foto.actividades, evento.actividad),
            confianza=_sumar(foto.confianza, e.confianza),
            criterio=_sumar(foto.criterio, e.criterio),
            transferencia=_sumar(foto.transferencia, e.transferencia),
        )
        if e.fase is Fase.ANTES:
            return replace(foto, preparacion=_sumar(foto.preparacion * 100, e.preparacion * 100) / 100)
        if e.fase is Fase.DECISION:
            p = foto.preparacion
            return replace(
                foto,
                encontrado=True,
                ultimo_repaso=t,
                estabilidad=ESTABILIDAD_INICIAL * (1 + p),
                comprension=_sumar(foto.comprension, e.comprension + 20 * p),
                transferencia=_sumar(foto.transferencia, 25 * p),
            )
        olvido = 1 - foto.retencion(t)
        return replace(
            foto,
            ultimo_repaso=t,
            estabilidad=foto.estabilidad * (e.estabilidad + e.dificultad * olvido),
            comprension=_sumar(foto.comprension, e.comprension),
        )
