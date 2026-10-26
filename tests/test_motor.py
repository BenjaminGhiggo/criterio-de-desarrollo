"""Motor de ejecución: qué se ejecuta primero y dónde vive cada variable.

El motor ejecuta código Python real y registra cada paso. t=-1 es la
compilación, t=0 el arranque y cada t>0 un paso de la ejecución.
"""

import json

import pytest

from criterio.ejecucion import Programa, ejecutar
from criterio.tiempo import Fase


def paso(resultado, t):
    return next(p for p in resultado["pasos"] if p["t"] == t)


def variables(p, marco=0):
    return {v["nombre"]: v["ref"] for v in p["memoria"]["marcos"][marco]["variables"]}


def objeto(p, ref):
    return next(o for o in p["memoria"]["objetos"] if o["ref"] == ref)


def ultimo(resultado):
    return resultado["pasos"][-1]


class TestHolaMundo:
    def test_antes_de_ejecutar_python_compila_y_no_existe_nada(self):
        r = ejecutar('print("Hola, mundo")')
        compilacion = paso(r, -1)
        assert compilacion["tipo"] == "compilacion"
        assert compilacion["memoria"]["marcos"] == []
        assert any("compila" in e for e in compilacion["explicacion"])

    def test_en_t_cero_la_siguiente_linea_es_la_primera(self):
        r = ejecutar('print("Hola, mundo")')
        inicio = paso(r, 0)
        assert inicio["siguiente"] == 1
        assert inicio["salida"] == ""

    def test_primero_se_evalua_el_argumento_y_despues_se_llama_a_print(self):
        r = ejecutar('print("Hola, mundo")')
        orden = [m["fragmento"] for m in paso(r, 0)["orden"]]
        assert orden.index("print") < orden.index('"Hola, mundo"') < orden.index('print("Hola, mundo")')

    def test_la_salida_aparece_despues_de_ejecutar_la_linea(self):
        r = ejecutar('print("Hola, mundo")')
        assert ultimo(r)["salida"] == "Hola, mundo\n"
        assert any("Hola, mundo" in e for p in r["pasos"] for e in p["explicacion"])


class TestVariables:
    def test_una_variable_es_un_nombre_en_un_marco_que_apunta_a_un_objeto(self):
        r = ejecutar('nombre = "Ana"\nedad = 30')
        final = ultimo(r)
        vs = variables(final)
        assert set(vs) == {"nombre", "edad"}
        assert objeto(final, vs["nombre"])["valor"] == "'Ana'"
        assert objeto(final, vs["edad"])["tipo"] == "int"
        assert final["memoria"]["marcos"][0]["nombre"] == "global"

    def test_en_una_asignacion_primero_se_evalua_la_derecha(self):
        r = ejecutar("precio = 10\ncantidad = 3\ntotal = precio * cantidad + 5")
        linea3 = next(p for p in r["pasos"] if p["siguiente"] == 3)
        fragmentos = [m["fragmento"] for m in linea3["orden"]]
        assert fragmentos == ["precio", "cantidad", "precio * cantidad", "5", "precio * cantidad + 5", "total"]
        valores = {m["fragmento"]: m["valor"] for m in linea3["orden"]}
        assert valores["precio * cantidad"] == "30"
        assert "enlaza" in linea3["orden"][-1]["nota"]

    def test_y_igual_x_comparte_el_objeto_y_reasignar_x_no_cambia_y(self):
        r = ejecutar("x = 5\ny = x\nx = x + 1")
        tras_y = next(p for p in r["pasos"] if p["ejecutada"] == 2)
        assert variables(tras_y)["x"] == variables(tras_y)["y"]
        assert any("mismo objeto" in e for e in tras_y["explicacion"])
        final = ultimo(r)
        assert variables(final)["x"] != variables(final)["y"]
        assert objeto(final, variables(final)["y"])["valor"] == "5"

    def test_las_direcciones_son_estables_entre_ejecuciones(self):
        codigo = "a = [1, 2]\nb = a"
        assert json.dumps(ejecutar(codigo)) == json.dumps(ejecutar(codigo))


class TestMutabilidad:
    def test_dos_nombres_un_objeto_el_cambio_se_ve_desde_ambos(self):
        r = ejecutar("a = [1, 2]\nb = a\nb.append(3)")
        final = ultimo(r)
        assert variables(final)["a"] == variables(final)["b"]
        lista = objeto(final, variables(final)["a"])
        assert lista["valor"] == "[1, 2, 3]"
        assert len(lista["elementos"]) == 3
        cambio = next(p for p in r["pasos"] if p["ejecutada"] == 3)
        assert any("cambió por dentro" in e for e in cambio["explicacion"])

    def test_el_valor_por_defecto_vive_pegado_a_la_funcion(self):
        r = ejecutar("def agregar(p, carrito=[]):\n    carrito.append(p)\n    return carrito\n\nagregar('pan')\nagregar('leche')")
        final = ultimo(r)
        funcion = objeto(final, variables(final)["agregar"])
        assert funcion["tipo"] == "función"
        ref_defecto = dict(funcion["atributos"])["defecto de carrito"]
        assert objeto(final, ref_defecto)["valor"] == "['pan', 'leche']"


class TestFuncionesYPila:
    CODIGO = 'def saludar(nombre):\n    mensaje = "Hola, " + nombre\n    return mensaje\n\ntexto = saludar("Ana")\nprint(texto)'

    def test_def_crea_un_objeto_funcion_sin_ejecutar_el_cuerpo(self):
        r = ejecutar(self.CODIGO)
        tras_def = next(p for p in r["pasos"] if p["ejecutada"] == 1)
        assert "saludar" in variables(tras_def)
        assert any("todavía no se ejecuta" in e for e in tras_def["explicacion"])

    def test_la_llamada_crea_un_marco_nuevo_con_sus_parametros(self):
        r = ejecutar(self.CODIGO)
        llamada = next(p for p in r["pasos"] if p["tipo"] == "call")
        marcos = llamada["memoria"]["marcos"]
        assert [m["nombre"] for m in marcos] == ["global", "saludar"]
        assert "nombre" in variables(llamada, 1)
        assert any("marco nuevo" in e for e in llamada["explicacion"])

    def test_las_variables_locales_desaparecen_al_volver(self):
        r = ejecutar(self.CODIGO)
        retorno = next(p for p in r["pasos"] if p["tipo"] == "return" and p["funcion"] == "saludar")
        assert any("se destruye" in e for e in retorno["explicacion"])
        final = ultimo(r)
        assert len(final["memoria"]["marcos"]) == 1
        assert "mensaje" not in variables(final)
        assert objeto(final, variables(final)["texto"])["valor"] == "'Hola, Ana'"

    def test_cada_llamada_tiene_su_propio_x(self):
        r = ejecutar("def doble(x):\n    return x * 2\n\ndef cuadruple(x):\n    return doble(doble(x))\n\nr = cuadruple(3)")
        profundidad = max(len(p["memoria"]["marcos"]) for p in r["pasos"])
        assert profundidad == 3


class TestControlDeFlujo:
    def test_el_bloque_que_no_corresponde_no_se_ejecuta(self):
        r = ejecutar('edad = 17\nif edad >= 18:\n    print("adulto")\nelse:\n    print("menor")')
        ejecutadas = {p["ejecutada"] for p in r["pasos"] if p["ejecutada"]}
        assert 3 not in ejecutadas and 5 in ejecutadas
        condicion = next(p for p in r["pasos"] if p["siguiente"] == 2)
        assert {m["fragmento"]: m["valor"] for m in condicion["orden"]}["edad >= 18"] == "False"

    def test_un_bucle_vuelve_a_la_misma_linea(self):
        r = ejecutar("total = 0\nfor n in [4, 7, 1]:\n    total = total + n")
        assert sum(1 for p in r["pasos"] if p["ejecutada"] == 3) == 3
        assert objeto(ultimo(r), variables(ultimo(r))["total"])["valor"] == "12"

    def test_una_excepcion_salta_al_except(self):
        r = ejecutar('try:\n    x = 1 / 0\n    print("no")\nexcept ZeroDivisionError:\n    print("capturada")')
        assert ultimo(r)["salida"] == "capturada\n"
        assert any(p["tipo"] == "exception" for p in r["pasos"])

    def test_un_bucle_infinito_se_corta(self):
        r = ejecutar("while True:\n    pass", max_pasos=50)
        assert r["truncado"]

    def test_un_error_de_sintaxis_se_detecta_antes_de_ejecutar(self):
        r = ejecutar("print('hola'")
        assert r["pasos"][-1]["tipo"] == "compilacion"
        assert r["error_compilacion"]["linea"] == 1


class TestObjetos:
    def test_los_atributos_viven_dentro_del_objeto(self):
        codigo = "class Cuenta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n\nc = Cuenta(100)"
        final = ultimo(ejecutar(codigo))
        cuenta = objeto(final, variables(final)["c"])
        assert cuenta["tipo"] == "Cuenta"
        assert objeto(final, dict(cuenta["atributos"])["saldo"])["valor"] == "100"
        assert objeto(final, variables(final)["Cuenta"])["tipo"] == "clase"

    def test_self_es_el_mismo_objeto(self):
        codigo = "class Cuenta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n\nc = Cuenta(100)"
        r = ejecutar(codigo)
        dentro = next(p for p in r["pasos"] if p["tipo"] == "return" and p["funcion"] == "__init__")
        final = ultimo(r)
        assert variables(dentro, 1)["self"] == variables(final)["c"]


    def test_el_cuerpo_de_una_clase_no_es_una_llamada(self):
        codigo = "class Cuenta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n\nc = Cuenta(100)"
        r = ejecutar(codigo)
        cuerpo = next(p for p in r["pasos"] if p["tipo"] == "call")
        assert cuerpo["funcion"] == "clase Cuenta"
        assert any("cuerpo de la clase" in e for e in cuerpo["explicacion"])
        fin_cuerpo = next(p for p in r["pasos"] if p["tipo"] == "return")
        assert "__init__" in variables(fin_cuerpo, 1)

    def test_explica_por_que_se_salta_un_bloque(self):
        r = ejecutar('edad = 17\nif edad >= 18:\n    print("adulto")\nprint("fin")')
        tras_if = next(p for p in r["pasos"] if p["ejecutada"] == 2)
        assert any("dio False" in e for e in tras_if["explicacion"])


class TestProtagonista:
    def test_el_programa_es_un_protagonista_medido_en_el_tiempo(self):
        programa = Programa('x = 1\nprint(x)')
        assert programa.donde_esta(-1).fase is Fase.ANTES
        assert programa.donde_esta(0).fase is Fase.DECISION
        assert programa.estado_en(-1)["tipo"] == "compilacion"
        assert programa.estado_en(99)["tipo"] == "fin"
        assert programa.estado_en(1)["ejecutada"] == 1
