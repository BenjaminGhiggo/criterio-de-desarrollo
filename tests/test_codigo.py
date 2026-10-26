"""Propuesta C: el protagonista es un módulo de código.

t<0 se diseña (y en TDD se escriben las pruebas), t=0 se publica, t>0 se
mantiene. Lo que se mide es cuánto cuesta cambiarlo con el paso del tiempo.
"""

import pytest

from criterio.codigo import Modulo, Riesgo, simular
from criterio.tiempo import ErrorDeDominio


class TestAntesDePublicar:
    def test_las_pruebas_escritas_antes_cuentan_como_diseno_guiado(self):
        m = Modulo("facturacion")
        m.escribir_prueba(-2)
        m.escribir_prueba(-1)
        foto = m.estado_en(-1)
        assert foto.pruebas == 2
        assert foto.pruebas_primero == 2
        assert not foto.publicado

    def test_no_se_cambia_lo_que_no_se_publico(self):
        with pytest.raises(ErrorDeDominio, match="publicado"):
            Modulo("x").cambiar(1, con_prueba=True)


class TestPublicacion:
    def test_se_publica_en_t_cero_con_sus_comportamientos(self):
        m = Modulo("x")
        m.escribir_prueba(-1)
        m.publicar(comportamientos=2)
        foto = m.estado_en(0)
        assert foto.publicado
        assert foto.cobertura == 0.5

    def test_se_publica_una_sola_vez(self):
        m = Modulo("x")
        m.publicar(comportamientos=1)
        with pytest.raises(ErrorDeDominio, match="ya fue publicado"):
            m.publicar(comportamientos=1)

    def test_publicar_exige_al_menos_un_comportamiento(self):
        with pytest.raises(ErrorDeDominio):
            Modulo("x").publicar(comportamientos=0)

    def test_publicado_con_todo_probado_cuesta_uno_cambiarlo(self):
        m = Modulo("x")
        m.escribir_prueba(-1)
        m.publicar(comportamientos=1)
        assert m.estado_en(0).costo_de_cambio == 1.0
        assert m.estado_en(0).riesgo is Riesgo.BAJO


class TestMantenimiento:
    def test_cambiar_sin_prueba_acumula_deuda_y_encarece(self):
        m = Modulo("x")
        m.publicar(comportamientos=1)
        costo_inicial = m.estado_en(0).costo_de_cambio
        m.cambiar(1, con_prueba=False)
        m.cambiar(2, con_prueba=False)
        assert m.estado_en(2).deuda == 2
        assert m.estado_en(2).costo_de_cambio > costo_inicial

    def test_cambiar_con_prueba_no_acumula_deuda(self):
        m = Modulo("x")
        m.escribir_prueba(-1)
        m.publicar(comportamientos=1)
        m.cambiar(1, con_prueba=True)
        assert m.estado_en(1).deuda == 0
        assert m.estado_en(1).cobertura == 1.0

    def test_refactorizar_sin_red_de_seguridad_esta_prohibido(self):
        m = Modulo("x")
        m.publicar(comportamientos=3)
        m.cambiar(1, con_prueba=False)
        with pytest.raises(ErrorDeDominio, match="red de seguridad"):
            m.refactorizar(2)

    def test_refactorizar_con_pruebas_paga_deuda(self):
        m = Modulo("x")
        for t in (-3, -2, -1):
            m.escribir_prueba(t)
        m.publicar(comportamientos=3)
        m.cambiar(1, con_prueba=False)
        m.cambiar(2, con_prueba=True)
        m.cambiar(3, con_prueba=True)
        assert m.estado_en(3).deuda == 1
        m.refactorizar(4)
        assert m.estado_en(4).deuda == 0

    def test_el_mantenimiento_es_en_t_positivo(self):
        m = Modulo("x")
        m.publicar(comportamientos=1)
        with pytest.raises(ErrorDeDominio, match="t>0"):
            m.cambiar(-1, con_prueba=True)


class TestSimulacion:
    def test_tdd_mantiene_el_costo_plano_y_sin_pruebas_crece(self):
        con_tdd = simular("tdd", pasos=6)
        sin_pruebas = simular("sin-pruebas", pasos=6)
        assert con_tdd[-1].estado.costo_de_cambio == pytest.approx(1.0)
        assert sin_pruebas[-1].estado.costo_de_cambio > 3
        assert sin_pruebas[-1].estado.riesgo is Riesgo.ALTO

    def test_la_simulacion_recorre_desde_t_negativo(self):
        trayectoria = simular("tdd", pasos=3)
        assert trayectoria[0].instante.t < 0
        assert trayectoria[-1].instante.t == 3

    def test_estrategia_desconocida(self):
        with pytest.raises(ErrorDeDominio):
            simular("magia", pasos=2)
