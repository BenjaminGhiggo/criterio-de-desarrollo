"""Aprender desde la terminal.

    criterio lecciones
    criterio leccion value-object --camino float --t 4
    criterio simular sin-pruebas
    criterio exportar site/data.json
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from criterio.catalogo import LECCIONES, buscar
from criterio.codigo import ESTRATEGIAS, simular
from criterio.tiempo import ErrorDeDominio
from criterio.web import exportar_a_archivo


def _lecciones(_: argparse.Namespace) -> None:
    for leccion in LECCIONES:
        print(f"{leccion.id:<20} {leccion.concepto:<34} {leccion.titulo}")


def _leccion(args: argparse.Namespace) -> None:
    leccion = buscar(args.id)
    clave = args.camino or leccion.recomendada
    decision = leccion.vivir(clave)
    ubicacion = decision.donde_esta(args.t)
    foto = ubicacion.estado

    print(f"\n{leccion.titulo}  [{leccion.concepto}]")
    print(f"{leccion.pregunta}\n{leccion.contexto}\n")
    print(f"Camino: {leccion.camino(clave).titulo}")
    print(f"Dónde está: {ubicacion.instante} -> fase {ubicacion.fase.nombre_legible} ({ubicacion.fase.value})")
    print(f"Pregunta de la fase: {ubicacion.fase.pregunta}")
    print(f"Estado: {foto.estado.value}   balance: {foto.balance:+d}\n")
    print("Fuerzas vistas: " + (", ".join(f.nombre for f in foto.fuerzas) or "ninguna aún"))
    if foto.elegida:
        print(f"Elegida en t=0: {foto.elegida.descripcion}, porque {', '.join(foto.justificacion)}")
    for c in foto.consecuencias:
        signo = {1: "+", 0: "=", -1: "-"}[c.impacto.value]
        print(f"  {c.instante}  [{signo}] {c.descripcion}")
    if args.t >= 5:
        print(f"\nPor qué: {leccion.explicacion}")


def _simular(args: argparse.Namespace) -> None:
    print(f"{args.estrategia}: {ESTRATEGIAS[args.estrategia]}\n")
    for u in simular(args.estrategia, args.pasos):
        if not u.estado.publicado:
            print(f"{str(u.instante):>5}  diseñando (pruebas primero: {u.estado.pruebas_primero})")
            continue
        barra = "#" * round(u.estado.costo_de_cambio * 5)
        print(f"{str(u.instante):>5}  costo {u.estado.costo_de_cambio:>4}  deuda {u.estado.deuda}  {barra}")


def _exportar(args: argparse.Namespace) -> None:
    print(f"Escrito {exportar_a_archivo(Path(args.destino))}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="criterio", description="Criterio de desarrollo medido en el tiempo")
    sub = parser.add_subparsers(required=True)

    sub.add_parser("lecciones", help="Lista las lecciones").set_defaults(fn=_lecciones)

    p = sub.add_parser("leccion", help="Vive una lección en un instante t")
    p.add_argument("id")
    p.add_argument("--camino", help="Opción elegida en t=0 (por defecto, la recomendada)")
    p.add_argument("--t", type=int, default=5)
    p.set_defaults(fn=_leccion)

    p = sub.add_parser("simular", help="Costo de cambio de un módulo según la estrategia de pruebas")
    p.add_argument("estrategia", choices=list(ESTRATEGIAS))
    p.add_argument("--pasos", type=int, default=8)
    p.set_defaults(fn=_simular)

    p = sub.add_parser("exportar", help="Genera el JSON del sitio")
    p.add_argument("destino", nargs="?", default="site/data.json")
    p.set_defaults(fn=_exportar)

    args = parser.parse_args(argv)
    try:
        args.fn(args)
    except ErrorDeDominio as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1
    return 0
