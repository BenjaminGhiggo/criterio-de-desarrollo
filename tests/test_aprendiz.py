"""Propuesta B: el protagonista es quien aprende.

t<0 diagnóstico, t=0 compromiso, t>0 práctica. El criterio no sube por
acertar, sube por acertar sabiendo por qué.
"""

import pytest

from criterio.aprendiz import Aprendiz, Etapa
from criterio.tiempo import ErrorDeDominio


def aprendiz_comprometido(diagnostico: int = 20) -> Aprendiz:
    a = Aprendiz("Ana")
    a.diagnosticar(-1, diagnostico)
    a.comprometerse("Entender por qué uso cada patrón")
    return a


class TestDiagnosticoYCompromiso:
    def test_el_diagnostico_es_en_t_negativo_y_fija_el_punto_de_partida(self):
        a = Aprendiz("Ana")
        a.diagnosticar(-2, 30)
        assert a.estado_en(-2).criterio == 30
        with pytest.raises(ErrorDeDominio, match="t<0"):
            a.diagnosticar(1, 30)

    def test_el_diagnostico_esta_entre_0_y_100(self):
        with pytest.raises(ErrorDeDominio):
            Aprendiz("Ana").diagnosticar(-1, 140)

    def test_sin_diagnostico_no_hay_compromiso(self):
        with pytest.raises(ErrorDeDominio, match="diagnóstico"):
            Aprendiz("Ana").comprometerse("meta")

    def test_el_compromiso_ocurre_en_t_cero(self):
        a = aprendiz_comprometido()
        assert a.estado_en(-1).meta is None
        assert a.estado_en(0).meta == "Entender por qué uso cada patrón"

    def test_no_se_practica_sin_compromiso(self):
        a = Aprendiz("Ana")
        a.diagnosticar(-1, 10)
        with pytest.raises(ErrorDeDominio, match="compromiso"):
            a.resolver(1, "tdd", acerto=True, justifico=True)


class TestPractica:
    def test_acertar_y_justificar_es_lo_que_mas_suma(self):
        a = aprendiz_comprometido(20)
        a.resolver(1, "vo", acerto=True, justifico=True)
        assert a.estado_en(1).criterio == 30

    def test_acertar_sin_saber_por_que_casi_no_suma(self):
        a = aprendiz_comprometido(20)
        a.resolver(1, "vo", acerto=True, justifico=False)
        assert a.estado_en(1).criterio == 22

    def test_equivocarse_razonando_tambien_ensena(self):
        a = aprendiz_comprometido(20)
        a.resolver(1, "vo", acerto=False, justifico=True)
        assert a.estado_en(1).criterio == 24

    def test_equivocarse_sin_razonar_resta(self):
        a = aprendiz_comprometido(20)
        a.resolver(1, "vo", acerto=False, justifico=False)
        assert a.estado_en(1).criterio == 17

    def test_el_criterio_nunca_sale_de_0_a_100(self):
        a = aprendiz_comprometido(98)
        a.resolver(1, "x", acerto=True, justifico=True)
        assert a.estado_en(1).criterio == 100
        b = aprendiz_comprometido(1)
        b.resolver(1, "x", acerto=False, justifico=False)
        assert b.estado_en(1).criterio == 0

    def test_la_practica_es_en_t_positivo(self):
        a = aprendiz_comprometido()
        with pytest.raises(ErrorDeDominio, match="t>0"):
            a.resolver(0, "x", acerto=True, justifico=True)


class TestEtapas:
    def test_al_inicio_no_sabe_lo_que_no_sabe(self):
        assert aprendiz_comprometido(10).estado_actual.etapa is Etapa.INCOMPETENCIA_INCONSCIENTE

    def test_el_primer_error_razonado_lo_vuelve_consciente(self):
        a = aprendiz_comprometido(10)
        a.resolver(1, "x", acerto=False, justifico=True)
        assert a.estado_actual.etapa is Etapa.INCOMPETENCIA_CONSCIENTE

    def test_con_criterio_alto_llega_a_la_competencia_consciente(self):
        a = aprendiz_comprometido(45)
        a.resolver(1, "x", acerto=True, justifico=True)
        assert a.estado_actual.etapa is Etapa.COMPETENCIA_CONSCIENTE

    def test_la_maestria_exige_criterio_y_constancia(self):
        a = aprendiz_comprometido(60)
        for t in (1, 2):
            a.resolver(t, f"l{t}", acerto=True, justifico=True)
        assert a.estado_en(2).criterio == 80
        assert a.estado_en(2).etapa is Etapa.COMPETENCIA_CONSCIENTE  # racha 2 aún no basta
        a.resolver(3, "l3", acerto=True, justifico=True)
        assert a.estado_en(3).etapa is Etapa.COMPETENCIA_INCONSCIENTE

    def test_un_error_rompe_la_racha(self):
        a = aprendiz_comprometido(60)
        a.resolver(1, "a", acerto=True, justifico=True)
        a.resolver(2, "b", acerto=False, justifico=True)
        assert a.estado_en(2).racha == 0
