"""Convierte las trayectorias del dominio en datos para el sitio.

El sitio no recalcula las lecciones, la simulación ni las trayectorias de las
metodologías: muestra lo que el dominio en Python proyectó para cada t. Así
la verdad vive en un solo lugar y está cubierta por las pruebas.

La única excepción es la combinación de metodologías que elige cada persona:
el sitio la calcula con un port del modelo en TypeScript, y los "vectores"
exportados aquí garantizan que ambos den el mismo resultado.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from criterio import aprendiz as ctx_aprendiz
from criterio.aprendiz.modelo import PUNTOS, RACHA_MAESTRIA, UMBRAL_COMPETENCIA, UMBRAL_MAESTRIA
from criterio.catalogo import LECCIONES, Leccion
from criterio.codigo import ESTRATEGIAS, simular
from criterio.decisiones import FotoDecision
from criterio.metodologias import EFECTOS, METODOLOGIAS, Evidencia, Familia, Medicion, Metodologia, combinar
from criterio.metodologias.conocimiento import CONFIANZA_INICIAL, ESTABILIDAD_INICIAL
from criterio.tiempo import Fase

T_FINAL = 5
PASOS_SIMULACION = 8
HORIZONTE = range(-3, 31)
DESTINO = Path("web/src/data/criterio.json")

# Combinaciones con las que se verifica que el port en TypeScript coincide.
VECTORES = (
    ("relectura",),
    ("espaciada", "feynman"),
    ("fracaso-productivo", "intercalado", "adr"),
    ("ejemplos-resueltos", "recuperacion", "pareja"),
    tuple(m.id for m in METODOLOGIAS),
)


def _foto_decision(foto: FotoDecision) -> dict[str, Any]:
    return {
        "estado": foto.estado.value,
        "balance": foto.balance,
        "fuerzas": [f.nombre for f in foto.fuerzas],
        "opciones": [o.clave for o in foto.opciones],
        "elegida": foto.elegida.clave if foto.elegida else None,
        "justificacion": list(foto.justificacion),
        "consecuencias": [
            {"t": c.instante.t, "descripcion": c.descripcion, "impacto": c.impacto.value} for c in foto.consecuencias
        ],
    }


def _leccion(leccion: Leccion) -> dict[str, Any]:
    t_inicial = -len(leccion.fuerzas) - 1
    caminos = []
    for camino in leccion.opciones:
        decision = leccion.vivir(camino.clave)
        caminos.append(
            {
                "clave": camino.clave,
                "titulo": camino.titulo,
                "codigo": camino.codigo,
                "recomendada": camino.clave == leccion.recomendada,
                "trayectoria": [
                    {"t": u.instante.t, "fase": u.fase.value, **_foto_decision(u.estado)}
                    for u in decision.trayectoria(t_inicial, T_FINAL)
                ],
            }
        )
    return {
        "id": leccion.id,
        "titulo": leccion.titulo,
        "concepto": leccion.concepto,
        "pregunta": leccion.pregunta,
        "contexto": leccion.contexto,
        "fuerzas": [{"nombre": f.nombre, "descripcion": f.descripcion} for f in leccion.fuerzas],
        "recomendada": leccion.recomendada,
        "justificacion": list(leccion.justificacion),
        "explicacion": leccion.explicacion,
        "t_inicial": t_inicial,
        "t_final": T_FINAL,
        "caminos": caminos,
    }


def _simulacion() -> dict[str, Any]:
    return {
        clave: {
            "descripcion": descripcion,
            "trayectoria": [
                {
                    "t": u.instante.t,
                    "fase": u.fase.value,
                    "publicado": u.estado.publicado,
                    "costo": u.estado.costo_de_cambio,
                    "deuda": u.estado.deuda,
                    "cobertura": round(u.estado.cobertura, 2),
                    "riesgo": u.estado.riesgo.value,
                    "pruebas_primero": u.estado.pruebas_primero,
                }
                for u in simular(clave, PASOS_SIMULACION)
            ],
        }
        for clave, descripcion in ESTRATEGIAS.items()
    }


def _reglas_aprendiz() -> dict[str, Any]:
    return {
        "puntos": {f"{int(a)}{int(j)}": p for (a, j), p in PUNTOS.items()},
        "umbral_competencia": UMBRAL_COMPETENCIA,
        "umbral_maestria": UMBRAL_MAESTRIA,
        "racha_maestria": RACHA_MAESTRIA,
        "etapas": {e.name: e.value for e in ctx_aprendiz.Etapa},
    }


def _medicion(m: Medicion, decimales: int | None = 2) -> dict[str, Any]:
    redondear = (lambda v: round(v, decimales)) if decimales is not None else (lambda v: v)
    return {
        "t": m.t,
        "fase": m.fase.value,
        "retencion": redondear(m.retencion),
        "comprension": redondear(m.comprension),
        "transferencia": redondear(m.transferencia),
        "criterio": redondear(m.criterio),
        "confianza": redondear(m.confianza),
        "minutos": m.minutos,
    }


def _metodo(m: Metodologia) -> dict[str, Any]:
    conocimiento = m.vivir()
    return {
        "id": m.id,
        "nombre": m.nombre,
        "familia": m.familia.value,
        "resumen": m.resumen,
        "idea": m.idea,
        "evidencia": m.evidencia.value,
        "fuente": m.fuente,
        "para_quien": m.para_quien,
        "plan": [{"t": p.t, "actividad": p.actividad.value, "que_haces": p.que_haces} for p in m.plan],
        "esta_semana": list(m.esta_semana),
        "cuando_no": m.cuando_no,
        "senal": m.senal,
        "ejemplo": m.ejemplo,
        "minutos": m.minutos,
        "trayectoria": [_medicion(conocimiento.medir(t)) for t in HORIZONTE],
    }


def _metodologias() -> dict[str, Any]:
    return {
        "constantes": {"estabilidad_inicial": ESTABILIDAD_INICIAL, "confianza_inicial": CONFIANZA_INICIAL},
        "actividades": {
            a.value: {
                "nombre": e.nombre,
                "fase": e.fase.value,
                "minutos": e.minutos,
                "por_que": e.por_que,
                "preparacion": e.preparacion,
                "estabilidad": e.estabilidad,
                "dificultad": e.dificultad,
                "comprension": e.comprension,
                "transferencia": e.transferencia,
                "criterio": e.criterio,
                "confianza": e.confianza,
            }
            for a, e in EFECTOS.items()
        },
        "evidencias": {e.value: e.descripcion for e in Evidencia},
        "familias": [f.value for f in Familia],
        "metodos": [_metodo(m) for m in METODOLOGIAS],
        "vectores": [
            {
                "ids": list(ids),
                "plan": [{"t": p.t, "actividad": p.actividad.value} for p in combinar(ids).plan],
                "mediciones": [_medicion(combinar(ids).vivir().medir(t), decimales=None) for t in (-1, 0, 1, 5, 12, 30)],
            }
            for ids in VECTORES
        ],
    }


def exportar() -> dict[str, Any]:
    return {
        "fases": [{"signo": f.value, "nombre": f.nombre_legible, "pregunta": f.pregunta} for f in Fase],
        "metodologias": _metodologias(),
        "lecciones": [_leccion(l) for l in LECCIONES],
        "simulacion": _simulacion(),
        "aprendiz": _reglas_aprendiz(),
    }


def serializar() -> str:
    return json.dumps(exportar(), ensure_ascii=False, separators=(",", ":")) + "\n"


def exportar_a_archivo(destino: Path = DESTINO) -> Path:
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(serializar(), encoding="utf-8")
    return destino
