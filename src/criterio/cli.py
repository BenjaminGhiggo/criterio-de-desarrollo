"""Aprender desde la terminal.

    criterio ruta
    criterio ejecutar hola-mundo
    criterio ejecutar --archivo mi_programa.py
    criterio metodos
    criterio metodo espaciada --t 7
    criterio combinar espaciada feynman premortem
    criterio lecciones
    criterio leccion value-object --camino float --t 4
    criterio simular sin-pruebas
    criterio exportar
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from criterio.catalogo import LECCIONES, buscar
from criterio.codigo import ESTRATEGIAS, simular
from criterio.ejecucion import ejecutar
from criterio.ruta import RUTA, buscar_leccion
from criterio.metodologias import EFECTOS, METODOLOGIAS, Metodologia, combinar
from criterio.metodologias import buscar as buscar_metodo
from criterio.tiempo import ErrorDeDominio, Instante
from criterio.web import DESTINO, exportar_a_archivo, exportar_todo_ruta


def _ruta(_: argparse.Namespace) -> None:
    for i, l in enumerate(RUTA, 1):
        usos = ", ".join(u.metodologia for u in l.metodologias)
        print(f"{i:>2}. {l.id:<18} {l.titulo:<38} {usos}")


def _metodos(_: argparse.Namespace) -> None:
    for m in METODOLOGIAS:
        final = m.vivir().medir(30)
        print(f"{m.id:<22} {m.familia.value:<12} evidencia {m.evidencia.value:<21} dominio a t=30: {final.dominio:5.1f}")


def _mostrar_metodo(m: Metodologia, t: int) -> None:
    conocimiento = m.vivir()
    medicion = conocimiento.medir(t)
    print(f"\n{m.nombre}  [{m.familia.value} · evidencia {m.evidencia.value}]")
    if m.idea:
        print(f"{m.idea}\n")
    print("Plan en el tiempo:")
    for p in sorted(m.plan, key=lambda p: p.t):
        marca = ">" if p.t <= t else " "
        print(f" {marca} {str(Instante(p.t)):>5}  {EFECTOS[p.actividad].nombre:<22} {p.que_haces}")
    print(f"\nDónde está tu conocimiento en {Instante(t)} ({medicion.fase.nombre_legible}):")
    for nombre in ("retencion", "comprension", "transferencia", "criterio", "confianza"):
        valor = getattr(medicion, nombre)
        print(f"  {nombre:<14} {valor:5.1f}  {'#' * round(valor / 4)}")
    print(f"  {'brecha':<14} {medicion.brecha:+5.1f}  (confianza menos retención)")
    print(f"  {'tiempo':<14} {medicion.minutos:>5} min")


def _metodo(args: argparse.Namespace) -> None:
    _mostrar_metodo(buscar_metodo(args.id), args.t)


def _combinar(args: argparse.Namespace) -> None:
    _mostrar_metodo(combinar(args.ids), args.t)


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
    escritos = exportar_todo_ruta()
    print(f"Escritos {len(escritos)} archivos de la ruta (lecciones, trazas y motor.py)")


def _ejecutar(args: argparse.Namespace) -> None:
    codigo = Path(args.archivo).read_text(encoding="utf-8") if args.archivo else buscar_leccion(args.leccion).codigo
    for p in ejecutar(codigo)["pasos"]:
        lineas = f"ejecutada {p['ejecutada']}" if p["ejecutada"] else "inicio" if p["t"] == 0 else ""
        print(f"\nt={p['t']:+d}  {p['tipo']}  {lineas}")
        for m in p["memoria"]["marcos"]:
            print(f"  marco {m['nombre']}: " + ", ".join(f"{v['nombre']} -> {v['ref']}" for v in m["variables"]))
        for e in p["explicacion"]:
            print(f"  · {e}")
        if p["orden"]:
            print(f"  orden de la línea {p['siguiente']}: " + " → ".join(m["fragmento"] for m in p["orden"]))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="criterio", description="Criterio de desarrollo medido en el tiempo")
    sub = parser.add_subparsers(required=True)

    sub.add_parser("ruta", help="Lista las lecciones de la ruta, desde Hola mundo").set_defaults(fn=_ruta)

    p = sub.add_parser("ejecutar", help="Ejecuta paso a paso una lección o tu archivo .py")
    p.add_argument("leccion", nargs="?", default="hola-mundo")
    p.add_argument("--archivo", help="Ruta a tu propio archivo .py")
    p.set_defaults(fn=_ejecutar)

    sub.add_parser("metodos", help="Lista las metodologías de aprendizaje").set_defaults(fn=_metodos)

    p = sub.add_parser("metodo", help="Vive una metodología y mide tu conocimiento en t")
    p.add_argument("id")
    p.add_argument("--t", type=int, default=30)
    p.set_defaults(fn=_metodo)

    p = sub.add_parser("combinar", help="Combina metodologías en tu propio plan")
    p.add_argument("ids", nargs="+")
    p.add_argument("--t", type=int, default=30)
    p.set_defaults(fn=_combinar)

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
    p.add_argument("destino", nargs="?", default=str(DESTINO))
    p.set_defaults(fn=_exportar)

    args = parser.parse_args(argv)
    try:
        args.fn(args)
    except ErrorDeDominio as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1
    return 0
