"""El catálogo de lecciones reutiliza el agregado Decision: cada lección es una
decisión que se puede vivir por cada camino posible (el recomendado y los
contrafactuales)."""

import pytest

from criterio.catalogo import LECCIONES, buscar
from criterio.decisiones import EstadoDecision
from criterio.tiempo import ErrorDeDominio, Fase


def test_hay_varias_lecciones_con_identificador_unico():
    ids = [l.id for l in LECCIONES]
    assert len(ids) >= 6
    assert len(ids) == len(set(ids))


@pytest.mark.parametrize("leccion", LECCIONES, ids=lambda l: l.id)
def test_cada_leccion_es_una_decision_valida_por_cualquier_camino(leccion):
    for opcion in leccion.opciones:
        decision = leccion.vivir(opcion.clave)
        assert decision.estado_en(0).elegida.clave == opcion.clave
        assert decision.donde_esta(-1).fase is Fase.ANTES


@pytest.mark.parametrize("leccion", LECCIONES, ids=lambda l: l.id)
def test_el_camino_recomendado_termina_validado(leccion):
    final = leccion.vivir(leccion.recomendada).estado_actual
    assert final.estado is EstadoDecision.VALIDADA


@pytest.mark.parametrize("leccion", LECCIONES, ids=lambda l: l.id)
def test_algun_camino_alternativo_termina_peor(leccion):
    recomendado = leccion.vivir(leccion.recomendada).estado_actual.balance
    alternativos = [leccion.vivir(o.clave).estado_actual.balance for o in leccion.opciones if o.clave != leccion.recomendada]
    assert min(alternativos) < recomendado


@pytest.mark.parametrize("leccion", LECCIONES, ids=lambda l: l.id)
def test_el_porque_cita_fuerzas_de_la_leccion(leccion):
    nombres = {f.nombre for f in leccion.fuerzas}
    assert set(leccion.justificacion) <= nombres


def test_buscar_por_id():
    assert buscar("value-object").titulo
    with pytest.raises(ErrorDeDominio):
        buscar("no-existe")


def test_vivir_una_opcion_inexistente_falla():
    with pytest.raises(ErrorDeDominio):
        buscar("value-object").vivir("nada")
