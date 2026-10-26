"""Capa de presentación: traduce el dominio a JSON para el sitio estático."""

from criterio.web.exportar import DESTINO, exportar, exportar_a_archivo, serializar
from criterio.web.ruta import exportar_ruta, exportar_todo_ruta

__all__ = ["DESTINO", "exportar", "exportar_a_archivo", "exportar_ruta", "exportar_todo_ruta", "serializar"]
