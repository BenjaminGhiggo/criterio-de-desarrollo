"""La ruta: de Hola mundo a un agregado de DDD con TDD.

Cada lección es código Python real que el motor ejecuta paso a paso. Las
pruebas garantizan que lo que la lección afirma coincide con lo que Python hace.
"""

import pytest

from criterio.metodologias import METODOLOGIAS
from criterio.ruta import RUTA, UNIDADES, buscar_leccion
from criterio.tiempo import ErrorDeDominio


def test_la_ruta_empieza_por_hola_mundo():
    primera = RUTA[0]
    assert primera.id == "hola-mundo"
    assert primera.codigo.strip() == 'print("Hola, mundo")'


def test_hay_al_menos_dieciseis_lecciones_con_ids_unicos():
    assert len(RUTA) >= 16
    assert len({l.id for l in RUTA}) == len(RUTA)


def test_las_unidades_avanzan_en_orden():
    indices = [UNIDADES.index(l.unidad) for l in RUTA]
    assert indices == sorted(indices)


@pytest.mark.parametrize("leccion", RUTA, ids=lambda l: l.id)
def test_cada_leccion_se_ejecuta_de_principio_a_fin(leccion):
    r = leccion.ejecutar()
    assert r["error_compilacion"] is None
    assert r["excepcion"] is None
    assert not r["truncado"]
    assert len(r["pasos"]) <= 300
    assert r["pasos"][-1]["tipo"] == "fin"


@pytest.mark.parametrize("leccion", RUTA, ids=lambda l: l.id)
def test_cada_leccion_aplica_metodologias_que_existen(leccion):
    ids = {m.id for m in METODOLOGIAS}
    assert leccion.metodologias
    for uso in leccion.metodologias:
        assert uso.metodologia in ids
        assert uso.como


def test_la_ruta_recorre_casi_todas_las_metodologias():
    usadas = {u.metodologia for l in RUTA for u in l.metodologias}
    faltan = {m.id for m in METODOLOGIAS} - usadas - {"relectura"}
    assert not faltan, f"Metodologías sin lección: {faltan}"


@pytest.mark.parametrize("leccion", RUTA, ids=lambda l: l.id)
def test_preguntas_bien_formadas(leccion):
    for p in (leccion.prediccion, *leccion.repaso):
        assert 0 <= p.correcta < len(p.opciones)
        assert p.porque
    assert len(leccion.repaso) >= 2
    assert leccion.reto and leccion.idea_clave and leccion.objetivo


@pytest.mark.parametrize("leccion", [l for l in RUTA if l.prediccion.sobre_salida], ids=lambda l: l.id)
def test_la_prediccion_correcta_coincide_con_la_salida_real(leccion):
    salida = leccion.ejecutar()["salida"]
    correcta = leccion.prediccion.opciones[leccion.prediccion.correcta]
    assert correcta in salida
    for i, opcion in enumerate(leccion.prediccion.opciones):
        if i != leccion.prediccion.correcta:
            assert opcion not in salida.splitlines()


def test_buscar_leccion():
    assert buscar_leccion("variables").titulo
    with pytest.raises(ErrorDeDominio):
        buscar_leccion("magia")
