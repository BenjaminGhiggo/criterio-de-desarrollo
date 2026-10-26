"""Exporta la ruta de lecciones, la traza de cada una y el motor para el navegador.

- web/src/data/ruta.json       lecciones (sin trazas), liviano: va en todas las páginas.
- web/src/data/trazas/<id>.json la ejecución paso a paso de cada lección.
- web/public/motor.py           el mismo motor, para ejecutar tu código con Pyodide.

Las trazas dependen de la versión de Python (la forma en que el intérprete
reporta líneas cambia levemente entre versiones), por eso ruta.json guarda la
versión con la que se generaron.
"""

from __future__ import annotations

import json
import sys
from dataclasses import asdict
from pathlib import Path
from typing import Any

from criterio.ejecucion import motor
from criterio.ruta import RUTA, UNIDADES, LeccionDeCodigo

RAIZ_WEB = Path("web")
DESTINO_RUTA = RAIZ_WEB / "src/data/ruta.json"
CARPETA_TRAZAS = RAIZ_WEB / "src/data/trazas"
DESTINO_MOTOR = RAIZ_WEB / "public/motor.py"


def version_python() -> str:
    return f"{sys.version_info.major}.{sys.version_info.minor}"


def _leccion(leccion: LeccionDeCodigo, orden: int) -> dict[str, Any]:
    datos = asdict(leccion)
    resultado = leccion.ejecutar()
    datos["orden"] = orden
    datos["pasos"] = len(resultado["pasos"])
    datos["salida"] = resultado["salida"]
    return datos


def exportar_ruta() -> dict[str, Any]:
    return {
        "python": version_python(),
        "unidades": list(UNIDADES),
        "lecciones": [_leccion(l, i + 1) for i, l in enumerate(RUTA)],
    }


def _json(datos: Any) -> str:
    return json.dumps(datos, ensure_ascii=False, separators=(",", ":")) + "\n"


def serializar_ruta() -> str:
    return _json(exportar_ruta())


def serializar_traza(leccion: LeccionDeCodigo) -> str:
    return _json(leccion.ejecutar())


def fuente_motor() -> str:
    return Path(motor.__file__).read_text(encoding="utf-8")


def exportar_todo_ruta(raiz: Path = Path(".")) -> list[Path]:
    escritos = []
    destino = raiz / DESTINO_RUTA
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(serializar_ruta(), encoding="utf-8")
    escritos.append(destino)
    carpeta = raiz / CARPETA_TRAZAS
    carpeta.mkdir(parents=True, exist_ok=True)
    for leccion in RUTA:
        archivo = carpeta / f"{leccion.id}.json"
        archivo.write_text(serializar_traza(leccion), encoding="utf-8")
        escritos.append(archivo)
    motor_destino = raiz / DESTINO_MOTOR
    motor_destino.parent.mkdir(parents=True, exist_ok=True)
    motor_destino.write_text(fuente_motor(), encoding="utf-8")
    escritos.append(motor_destino)
    return escritos
