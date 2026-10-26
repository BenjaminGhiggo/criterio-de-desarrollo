"""Núcleo compartido: el tiempo como referencia.

Estas pruebas se escribieron antes que el código (TDD). Cada una responde a
una pregunta: ¿qué significa estar en t<0, t=0 o t>0?
"""

from dataclasses import dataclass

import pytest

from criterio.tiempo import (
    ErrorDeDominio,
    EventoDeDominio,
    Fase,
    Instante,
    LineaDeTiempo,
    Protagonista,
)


class TestInstante:
    @pytest.mark.parametrize(
        ("t", "fase"),
        [(-3, Fase.ANTES), (-1, Fase.ANTES), (0, Fase.DECISION), (1, Fase.DESPUES), (9, Fase.DESPUES)],
    )
    def test_la_fase_depende_solo_del_signo_de_t(self, t, fase):
        assert Instante(t).fase is fase

    def test_es_un_value_object_se_compara_por_valor(self):
        assert Instante(2) == Instante(2)
        assert hash(Instante(2)) == hash(Instante(2))

    def test_es_inmutable(self):
        instante = Instante(1)
        with pytest.raises(AttributeError):
            instante.t = 5  # type: ignore[misc]

    def test_los_instantes_se_ordenan_en_el_tiempo(self):
        assert sorted([Instante(3), Instante(-2), Instante(0)]) == [Instante(-2), Instante(0), Instante(3)]

    def test_rechaza_valores_que_no_son_enteros(self):
        with pytest.raises(ErrorDeDominio):
            Instante(1.5)  # type: ignore[arg-type]
        with pytest.raises(ErrorDeDominio):
            Instante(True)  # bool es subclase de int, pero no es un tiempo

    def test_el_presente_es_t_igual_a_cero(self):
        assert Instante.presente() == Instante(0)

    def test_distancia_al_presente(self):
        assert Instante(-4).distancia_al_presente == 4
        assert Instante(3).distancia_al_presente == 3

    def test_cada_fase_explica_su_pregunta(self):
        assert "por qué" in Fase.ANTES.pregunta.lower()
        assert "qué" in Fase.DECISION.pregunta.lower()
        assert "consecuencia" in Fase.DESPUES.pregunta.lower()


@dataclass(frozen=True)
class Marca(EventoDeDominio):
    nombre: str = ""


class TestLineaDeTiempo:
    def test_ordena_los_eventos_por_instante(self):
        linea = LineaDeTiempo([Marca(Instante(2), "c"), Marca(Instante(-1), "a"), Marca(Instante(0), "b")])
        assert [e.nombre for e in linea] == ["a", "b", "c"]

    def test_registrar_no_muta_devuelve_una_nueva_linea(self):
        vacia = LineaDeTiempo()
        con_uno = vacia.registrar(Marca(Instante(1), "x"))
        assert len(vacia) == 0
        assert len(con_uno) == 1

    def test_hasta_incluye_el_instante_pedido(self):
        linea = LineaDeTiempo([Marca(Instante(t), str(t)) for t in (-2, 0, 1, 3)])
        assert [e.nombre for e in linea.hasta(Instante(1))] == ["-2", "0", "1"]

    def test_en_fase_filtra_por_signo(self):
        linea = LineaDeTiempo([Marca(Instante(t), str(t)) for t in (-2, -1, 0, 4)])
        assert [e.nombre for e in linea.en_fase(Fase.ANTES)] == ["-2", "-1"]
        assert [e.nombre for e in linea.en_fase(Fase.DESPUES)] == ["4"]

    def test_mantiene_el_orden_de_llegada_dentro_de_un_mismo_instante(self):
        linea = LineaDeTiempo().registrar(Marca(Instante(1), "primero")).registrar(Marca(Instante(1), "segundo"))
        assert [e.nombre for e in linea] == ["primero", "segundo"]


class Contador(Protagonista[int]):
    """El protagonista más simple posible: cuenta cuántas cosas le pasaron."""

    def _estado_inicial(self) -> int:
        return 0

    def _aplicar(self, estado: int, evento: EventoDeDominio) -> int:
        return estado + 1

    def marcar(self, t: int) -> None:
        self._registrar(Marca(Instante(t)))


class TestProtagonista:
    def test_su_estado_en_t_es_la_proyeccion_de_sus_eventos_hasta_t(self):
        contador = Contador()
        for t in (-2, -1, 0, 2, 5):
            contador.marcar(t)
        assert contador.estado_en(-3) == 0
        assert contador.estado_en(-1) == 2
        assert contador.estado_en(0) == 3
        assert contador.estado_en(4) == 4
        assert contador.estado_en(99) == 5

    def test_donde_esta_responde_instante_fase_y_estado(self):
        contador = Contador()
        contador.marcar(-1)
        ubicacion = contador.donde_esta(-1)
        assert ubicacion.instante == Instante(-1)
        assert ubicacion.fase is Fase.ANTES
        assert ubicacion.estado == 1
        assert ubicacion.eventos_vividos == 1

    def test_el_estado_actual_considera_todos_los_eventos(self):
        contador = Contador()
        contador.marcar(-1)
        contador.marcar(7)
        assert contador.estado_actual == 2
        assert contador.ultimo_instante == Instante(7)

    def test_un_protagonista_sin_historia_vive_en_el_presente(self):
        assert Contador().ultimo_instante == Instante(0)

    def test_trayectoria_recorre_un_rango_de_instantes(self):
        contador = Contador()
        contador.marcar(0)
        trayectoria = contador.trayectoria(-1, 1)
        assert [(u.instante.t, u.estado) for u in trayectoria] == [(-1, 0), (0, 1), (1, 1)]
