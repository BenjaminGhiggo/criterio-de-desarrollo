"""El protagonista de las metodologías: tu conocimiento de un concepto.

t<0 te preparas (o no), t=0 encuentras el concepto, t>0 lo consolidas (o lo
olvidas). Estas pruebas fijan las reglas del tiempo; las de
test_metodologias.py fijan lo que dice la evidencia.
"""

import math

import pytest

from criterio.metodologias import Actividad, Conocimiento, EFECTOS
from criterio.tiempo import ErrorDeDominio, Fase


def encontrado(actividad: Actividad = Actividad.EXPLICACION) -> Conocimiento:
    c = Conocimiento("Value Object")
    c.realizar(0, actividad)
    return c


class TestReglasDelTiempo:
    def test_cada_actividad_pertenece_a_una_fase(self):
        assert EFECTOS[Actividad.PREDICCION].fase is Fase.ANTES
        assert EFECTOS[Actividad.EXPLICACION].fase is Fase.DECISION
        assert EFECTOS[Actividad.RECUPERACION].fase is Fase.DESPUES
        assert {e.fase for e in EFECTOS.values()} == set(Fase)

    def test_preparar_solo_antes(self):
        c = encontrado()
        with pytest.raises(ErrorDeDominio, match="t<0"):
            c.realizar(1, Actividad.PREDICCION)

    def test_el_encuentro_es_en_t_cero_y_una_sola_vez(self):
        c = Conocimiento("x")
        with pytest.raises(ErrorDeDominio, match="t=0"):
            c.realizar(2, Actividad.EXPLICACION)
        c.realizar(0, Actividad.EXPLICACION)
        with pytest.raises(ErrorDeDominio, match="una sola vez"):
            c.realizar(0, Actividad.EJEMPLO_RESUELTO)

    def test_no_se_consolida_lo_que_no_se_encontro(self):
        with pytest.raises(ErrorDeDominio, match="encontr"):
            Conocimiento("x").realizar(1, Actividad.RECUPERACION)

    def test_consolidar_solo_despues(self):
        c = Conocimiento("x")
        with pytest.raises(ErrorDeDominio, match="t>0"):
            c.realizar(-1, Actividad.RECUPERACION)


class TestMedicion:
    def test_antes_del_encuentro_no_hay_nada_que_recordar(self):
        c = Conocimiento("x")
        c.realizar(-2, Actividad.PREDICCION)
        c.realizar(0, Actividad.EXPLICACION)
        m = c.medir(-1)
        assert m.retencion == 0
        assert m.fase is Fase.ANTES
        assert m.comprension == 0

    def test_en_el_encuentro_la_retencion_es_total(self):
        assert encontrado().medir(0).retencion == 100

    def test_sin_repasar_se_olvida_con_el_tiempo(self):
        c = encontrado()
        assert c.medir(1).retencion > c.medir(3).retencion > c.medir(10).retencion

    def test_la_curva_del_olvido_es_exponencial(self):
        c = encontrado()
        estabilidad = c.estado_en(0).estabilidad_efectiva
        assert c.medir(2).retencion == pytest.approx(100 * math.exp(-2 / estabilidad))

    def test_lo_que_se_comprende_se_olvida_mas_lento(self):
        foto = encontrado().estado_en(0)
        assert foto.estabilidad_efectiva > foto.estabilidad

    def test_repasar_reinicia_la_curva(self):
        c = encontrado()
        c.realizar(3, Actividad.RECUPERACION)
        assert c.medir(3).retencion == 100
        assert c.medir(4).retencion > encontrado().medir(1).retencion

    def test_prepararse_antes_mejora_el_encuentro(self):
        sin = encontrado()
        con = Conocimiento("x")
        con.realizar(-1, Actividad.PREDICCION)
        con.realizar(0, Actividad.EXPLICACION)
        assert con.estado_en(0).estabilidad > sin.estado_en(0).estabilidad
        assert con.medir(0).comprension > sin.medir(0).comprension

    def test_las_dimensiones_nunca_pasan_de_100(self):
        c = encontrado()
        for t in range(1, 60):
            c.realizar(t, Actividad.AUTOEXPLICACION)
        m = c.medir(60)
        assert 0 <= m.comprension <= 100
        assert 0 <= m.criterio <= 100

    def test_cuenta_el_tiempo_invertido(self):
        c = encontrado()
        c.realizar(1, Actividad.RECUPERACION)
        assert c.estado_actual.minutos == EFECTOS[Actividad.EXPLICACION].minutos + EFECTOS[Actividad.RECUPERACION].minutos

    def test_la_brecha_es_confianza_menos_retencion(self):
        m = encontrado().medir(5)
        assert m.brecha == pytest.approx(m.confianza - m.retencion)

    def test_dominio_promedia_las_cuatro_dimensiones(self):
        m = encontrado().medir(2)
        assert m.dominio == pytest.approx((m.retencion + m.comprension + m.transferencia + m.criterio) / 4)
