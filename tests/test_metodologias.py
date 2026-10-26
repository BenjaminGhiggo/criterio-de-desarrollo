"""Lo que dice la evidencia, convertido en pruebas.

Cada prueba es un hallazgo de la investigación sobre aprendizaje. Si alguien
cambia los parámetros del modelo y contradice la evidencia, la prueba falla.
Los números del modelo son ilustrativos; las comparaciones no.
"""

import pytest

from criterio.metodologias import EFECTOS, METODOLOGIAS, Actividad, Evidencia, Familia, buscar, combinar
from criterio.tiempo import ErrorDeDominio, Fase


def medir(id_: str, t: int):
    return buscar(id_).vivir().medir(t)


def test_hay_muchas_propuestas_con_ids_unicos():
    ids = [m.id for m in METODOLOGIAS]
    assert len(ids) >= 18
    assert len(set(ids)) == len(ids)


@pytest.mark.parametrize("m", METODOLOGIAS, ids=lambda m: m.id)
def test_cada_metodologia_es_un_plan_valido_en_el_tiempo(m):
    c = m.vivir()
    assert c.estado_en(0).encontrado
    assert c.medir(-1).retencion == 0
    assert [p for p in m.plan if p.t == 0 and EFECTOS[p.actividad].fase is Fase.DECISION]


@pytest.mark.parametrize("m", METODOLOGIAS, ids=lambda m: m.id)
def test_cada_metodologia_explica_como_aplicarla_y_cita_su_fuente(m):
    assert m.resumen and m.idea and m.fuente
    assert len(m.esta_semana) >= 3
    assert m.cuando_no and m.senal and m.ejemplo
    assert all(p.que_haces for p in m.plan)


class TestEvidencia:
    def test_efecto_de_prueba_recuperar_retiene_mas_que_releer(self):
        # Roediger y Karpicke (2006): mismo tiempo, mejor retención una semana después.
        assert medir("recuperacion", 7).retencion > medir("relectura", 7).retencion

    def test_ilusion_de_fluidez_releer_da_la_mayor_confianza_sin_respaldo(self):
        # Releer se siente bien: la brecha entre lo que crees y lo que recuerdas es la mayor.
        brechas = {m.id: m.vivir().medir(7).brecha for m in METODOLOGIAS}
        assert max(brechas, key=brechas.get) == "relectura"

    def test_espaciar_vence_a_concentrar_a_largo_plazo(self):
        # Cepeda et al. (2006): mismas recuperaciones, distribuidas, retienen más a t=30.
        assert medir("espaciada", 30).retencion > medir("recuperacion", 30).retencion

    def test_releer_es_la_peor_retencion_a_un_mes(self):
        retenciones = {m.id: m.vivir().medir(30).retencion for m in METODOLOGIAS}
        assert min(retenciones, key=retenciones.get) == "relectura"

    def test_fracaso_productivo_se_siente_peor_antes_pero_transfiere_mejor(self):
        # Kapur (2008): el intento fallido incomoda en t<0 y rinde en transferencia.
        assert medir("fracaso-productivo", -1).confianza < medir("relectura", -1).confianza
        assert medir("fracaso-productivo", 30).transferencia > medir("recuperacion", 30).transferencia

    def test_explicar_construye_comprension_que_releer_no(self):
        # Chi et al. (1994): la autoexplicación supera a la relectura en comprensión.
        assert medir("feynman", 30).comprension > medir("relectura", 30).comprension

    def test_intercalar_mejora_la_transferencia(self):
        # Rohrer y Taylor (2007): mezclar problemas enseña a elegir la estrategia.
        assert medir("intercalado", 30).transferencia > medir("espaciada", 30).transferencia

    def test_las_metodologias_de_criterio_son_las_que_mas_desarrollan_el_porque(self):
        criterio = sorted(METODOLOGIAS, key=lambda m: m.vivir().medir(30).criterio, reverse=True)
        top = [m.familia for m in criterio[:3]]
        assert top.count(Familia.CRITERIO) >= 2

    def test_releer_tiene_evidencia_baja_y_recuperar_y_espaciar_alta(self):
        assert buscar("relectura").evidencia is Evidencia.BAJA
        assert buscar("recuperacion").evidencia is Evidencia.ALTA
        assert buscar("espaciada").evidencia is Evidencia.ALTA


class TestCombinar:
    def test_combinar_une_los_planes_con_un_solo_encuentro(self):
        mezcla = combinar(["espaciada", "feynman"])
        encuentros = [p for p in mezcla.plan if p.t == 0]
        assert len(encuentros) == 1
        ts = {(p.t, p.actividad) for p in mezcla.plan}
        assert (1, Actividad.AUTOEXPLICACION) in ts
        assert (28, Actividad.RECUPERACION) in ts

    def test_si_alguna_usa_ejemplo_resuelto_el_encuentro_es_ese(self):
        mezcla = combinar(["recuperacion", "ejemplos-resueltos"])
        assert [p.actividad for p in mezcla.plan if p.t == 0] == [Actividad.EJEMPLO_RESUELTO]

    def test_no_duplica_actividades_iguales_en_el_mismo_instante(self):
        mezcla = combinar(["recuperacion", "recuperacion"])
        assert len(mezcla.plan) == len(buscar("recuperacion").plan)

    def test_una_buena_mezcla_supera_a_sus_partes(self):
        mezcla = combinar(["espaciada", "feynman", "premortem"]).vivir().medir(30)
        assert mezcla.dominio > medir("espaciada", 30).dominio
        assert mezcla.dominio > medir("feynman", 30).dominio

    def test_combinar_nada_es_un_error(self):
        with pytest.raises(ErrorDeDominio):
            combinar([])

    def test_buscar_inexistente(self):
        with pytest.raises(ErrorDeDominio):
            buscar("hipnosis")
