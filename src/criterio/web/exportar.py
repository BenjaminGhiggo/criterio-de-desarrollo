"""Convierte las trayectorias del dominio en datos para el sitio.

El sitio no recalcula nada de las lecciones ni de la simulación: muestra lo
que el dominio en Python proyectó para cada t. Así la verdad vive en un solo
lugar y está cubierta por las pruebas.
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
from criterio.tiempo import Fase

T_FINAL = 5
PASOS_SIMULACION = 8


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


def exportar() -> dict[str, Any]:
    return {
        "fases": [{"signo": f.value, "nombre": f.nombre_legible, "pregunta": f.pregunta} for f in Fase],
        "lecciones": [_leccion(l) for l in LECCIONES],
        "simulacion": _simulacion(),
        "aprendiz": _reglas_aprendiz(),
    }


def exportar_a_archivo(destino: Path) -> Path:
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps(exportar(), ensure_ascii=False, indent=1), encoding="utf-8")
    return destino
