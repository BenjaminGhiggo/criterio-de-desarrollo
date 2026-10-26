"""Propuesta A: el protagonista es una Decisión técnica.

t<0 se identifican fuerzas y alternativas, t=0 se decide con justificación,
t>0 se observan las consecuencias.
"""

import pytest

from criterio.decisiones import Decision, EstadoDecision, Impacto
from criterio.tiempo import ErrorDeDominio, Fase


def decision_lista_para_decidir() -> Decision:
    d = Decision("¿Cómo representamos el dinero?")
    d.identificar_fuerza(-3, "precision", "Los centavos no pueden perderse")
    d.identificar_fuerza(-2, "legibilidad", "El equipo debe entender el código")
    d.considerar_opcion(-2, "float", "Usar float")
    d.considerar_opcion(-1, "decimal", "Value Object con Decimal")
    return d


class TestAntesDeDecidir:
    def test_una_decision_nueva_esta_en_contexto(self):
        d = Decision("¿Algo?")
        assert d.estado_actual.estado is EstadoDecision.EN_CONTEXTO

    def test_la_pregunta_es_obligatoria(self):
        with pytest.raises(ErrorDeDominio):
            Decision("   ")

    def test_las_fuerzas_solo_se_identifican_antes_de_decidir(self):
        d = Decision("¿Algo?")
        with pytest.raises(ErrorDeDominio, match="t<0"):
            d.identificar_fuerza(0, "x", "y")
        with pytest.raises(ErrorDeDominio, match="t<0"):
            d.identificar_fuerza(2, "x", "y")

    def test_las_opciones_solo_se_consideran_antes_de_decidir(self):
        d = Decision("¿Algo?")
        with pytest.raises(ErrorDeDominio, match="t<0"):
            d.considerar_opcion(1, "a", "A")

    def test_no_se_repiten_opciones(self):
        d = Decision("¿Algo?")
        d.considerar_opcion(-1, "a", "A")
        with pytest.raises(ErrorDeDominio, match="ya fue considerada"):
            d.considerar_opcion(-1, "a", "otra vez A")

    def test_el_estado_en_t_negativo_solo_ve_lo_que_ya_ocurrio(self):
        d = decision_lista_para_decidir()
        assert [f.nombre for f in d.estado_en(-3).fuerzas] == ["precision"]
        assert [o.clave for o in d.estado_en(-2).opciones] == ["float"]
        assert len(d.estado_en(-1).opciones) == 2


class TestEnTCero:
    def test_decidir_mueve_el_estado_a_decidida(self):
        d = decision_lista_para_decidir()
        d.decidir("decimal", ["precision"])
        foto = d.estado_en(0)
        assert foto.estado is EstadoDecision.DECIDIDA
        assert foto.elegida.clave == "decimal"
        assert foto.justificacion == ("precision",)
        assert d.donde_esta(0).fase is Fase.DECISION

    def test_sin_alternativas_no_hay_criterio(self):
        d = Decision("¿Algo?")
        d.identificar_fuerza(-1, "f", "F")
        d.considerar_opcion(-1, "unica", "La única que conozco")
        with pytest.raises(ErrorDeDominio, match="al menos dos"):
            d.decidir("unica", ["f"])

    def test_no_se_puede_elegir_una_opcion_no_considerada(self):
        d = decision_lista_para_decidir()
        with pytest.raises(ErrorDeDominio, match="no fue considerada"):
            d.decidir("int", ["precision"])

    def test_la_justificacion_debe_citar_fuerzas_identificadas(self):
        d = decision_lista_para_decidir()
        with pytest.raises(ErrorDeDominio, match="justific"):
            d.decidir("decimal", [])
        with pytest.raises(ErrorDeDominio, match="moda"):
            d.decidir("decimal", ["moda"])

    def test_solo_se_decide_una_vez(self):
        d = decision_lista_para_decidir()
        d.decidir("decimal", ["precision"])
        with pytest.raises(ErrorDeDominio, match="ya fue tomada"):
            d.decidir("float", ["legibilidad"])

    def test_antes_de_t_cero_la_decision_aun_no_existe(self):
        d = decision_lista_para_decidir()
        d.decidir("decimal", ["precision"])
        assert d.estado_en(-1).elegida is None
        assert d.estado_en(-1).estado is EstadoDecision.EN_CONTEXTO


class TestDespuesDeDecidir:
    def test_las_consecuencias_solo_existen_despues(self):
        d = decision_lista_para_decidir()
        d.decidir("decimal", ["precision"])
        with pytest.raises(ErrorDeDominio, match="t>0"):
            d.observar(0, "algo", Impacto.POSITIVO)

    def test_no_hay_consecuencias_de_algo_no_decidido(self):
        d = decision_lista_para_decidir()
        with pytest.raises(ErrorDeDominio, match="sin decidir"):
            d.observar(1, "algo", Impacto.POSITIVO)

    def test_el_balance_de_consecuencias_valida_o_cuestiona(self):
        d = decision_lista_para_decidir()
        d.decidir("decimal", ["precision"])
        d.observar(1, "Más verboso", Impacto.NEGATIVO)
        d.observar(3, "Cero errores de redondeo en facturación", Impacto.POSITIVO)
        d.observar(5, "Auditoría aprobada", Impacto.POSITIVO)

        assert d.estado_en(1).estado is EstadoDecision.CUESTIONADA
        assert d.estado_en(2).balance == -1
        assert d.estado_en(3).estado is EstadoDecision.DECIDIDA
        assert d.estado_en(5).estado is EstadoDecision.VALIDADA
        assert d.estado_en(5).balance == 1

    def test_un_neutro_no_mueve_el_balance(self):
        d = decision_lista_para_decidir()
        d.decidir("decimal", ["precision"])
        d.observar(1, "Nadie lo notó", Impacto.NEUTRO)
        assert d.estado_en(1).balance == 0
        assert len(d.estado_en(1).consecuencias) == 1
