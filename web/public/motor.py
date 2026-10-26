"""Motor de ejecución paso a paso: qué se ejecuta primero y dónde vive cada variable.

Ejecuta código Python real con sys.settrace y registra, en cada paso, la pila
de marcos (dónde viven los nombres), los objetos en el montón (dónde viven los
valores, con su dirección), la salida y el orden en que se evalúa la línea
siguiente. Después explica en español qué cambió entre un paso y el otro.

Este archivo solo usa la biblioteca estándar: el sitio lo descarga y lo
ejecuta en el navegador con Pyodide, así que el código que explica las
lecciones y el que explica tu propio código es exactamente el mismo.

El tiempo:
  t = -1  Python lee y compila el archivo. Todavía no existe ninguna variable.
  t =  0  Empieza la ejecución.
  t >  0  Cada paso: una línea, una llamada, un retorno o una excepción.
"""

from __future__ import annotations

import ast
import builtins
import io
import json
import sys
import types
from contextlib import redirect_stdout
from typing import Any

ARCHIVO = "<leccion>"
MODULO = "__leccion__"
MAX_PASOS = 400
LARGO_MAX = 70
PRIMITIVOS = (int, float, bool, str, type(None), complex, bytes)


class DemasiadosPasos(Exception):
    """El programa superó el máximo de pasos (probablemente un bucle infinito)."""


# ── Direcciones ──────────────────────────────────────────────────────────────


class _Direcciones:
    """Asigna a cada objeto una dirección estable.

    En CPython id(objeto) es la dirección real en memoria, pero cambia en cada
    ejecución. Aquí se numeran en orden de aparición para que la explicación sea
    reproducible, conservando lo importante: dos nombres que apuntan al mismo
    objeto muestran la misma dirección. Los objetos se mantienen vivos para que
    Python no reutilice una dirección durante la traza.
    """

    def __init__(self) -> None:
        self._por_id: dict[int, str] = {}
        self._vivos: list[Any] = []

    def de(self, obj: Any) -> str:
        clave = id(obj)
        if clave not in self._por_id:
            self._por_id[clave] = f"0x{0x1000 + 0x20 * len(self._por_id):04x}"
            self._vivos.append(obj)
        return self._por_id[clave]


# ── Memoria ─────────────────────────────────────────────────────────────────


def _corto(texto: str) -> str:
    return texto if len(texto) <= LARGO_MAX else texto[: LARGO_MAX - 1] + "…"


def _de_la_leccion(valor: Any) -> bool:
    return getattr(valor, "__module__", None) == MODULO


def _visible(nombre: str, valor: Any) -> bool:
    if isinstance(valor, types.ModuleType):
        return False
    if nombre.startswith("__") and not (isinstance(valor, types.FunctionType) and _de_la_leccion(valor)):
        return False
    return not (callable(valor) and not _de_la_leccion(valor))


def _nombre_marco(frame: types.FrameType) -> str:
    """global, el cuerpo de una clase (se ejecuta una vez al definirla) o una función."""
    if frame.f_code.co_name == "<module>":
        return "global"
    if not frame.f_code.co_flags & 0x1:  # sin CO_OPTIMIZED: cuerpo de clase
        return f"clase {frame.f_code.co_name}"
    return frame.f_code.co_name


def texto(o: Any, profundidad: int = 0) -> str:
    """Representación determinista (sin direcciones reales) para mostrar valores."""
    if isinstance(o, PRIMITIVOS):
        return repr(o)
    if profundidad > 2:
        return "…"
    if isinstance(o, list):
        return "[" + ", ".join(texto(x, profundidad + 1) for x in o) + "]"
    if isinstance(o, tuple):
        interior = ", ".join(texto(x, profundidad + 1) for x in o)
        return f"({interior}{',' if len(o) == 1 else ''})"
    if isinstance(o, (set, frozenset)):
        return "{" + ", ".join(sorted(texto(x, profundidad + 1) for x in o)) + "}" if o else "set()"
    if isinstance(o, dict):
        return "{" + ", ".join(f"{texto(k, profundidad + 1)}: {texto(v, profundidad + 1)}" for k, v in o.items()) + "}"
    if isinstance(o, types.FunctionType):
        return f"función {o.__name__}"
    if isinstance(o, types.BuiltinFunctionType):
        return f"función {o.__name__} (incorporada)"
    if isinstance(o, type):
        return f"clase {o.__name__}"
    if isinstance(o, BaseException):
        return f"{type(o).__name__}({', '.join(texto(a, profundidad + 1) for a in o.args)})"
    if hasattr(o, "__dict__"):
        campos = ", ".join(f"{k}={texto(v, profundidad + 1)}" for k, v in vars(o).items())
        return f"{type(o).__name__}({campos})"
    return f"<{type(o).__name__}>"


def _describir(raiz: Any, dirs: _Direcciones, objetos: dict[str, dict]) -> None:
    pendientes = [raiz]
    while pendientes:
        o = pendientes.pop()
        ref = dirs.de(o)
        if ref in objetos:
            continue
        info: dict[str, Any] = {"ref": ref, "tipo": type(o).__name__, "valor": _corto(texto(o))}
        if isinstance(o, PRIMITIVOS):
            pass
        elif isinstance(o, (list, tuple, set, frozenset)):
            hijos = sorted(o, key=texto) if isinstance(o, (set, frozenset)) else list(o)
            info["elementos"] = [dirs.de(h) for h in hijos]
            pendientes.extend(hijos)
        elif isinstance(o, dict):
            info["pares"] = [[dirs.de(k), dirs.de(v)] for k, v in o.items()]
            for k, v in o.items():
                pendientes.extend((k, v))
        elif isinstance(o, types.FunctionType):
            codigo = o.__code__
            parametros = codigo.co_varnames[: codigo.co_argcount]
            defectos = o.__defaults__ or ()
            info.update(tipo="función", nombre=o.__name__, valor=f"{o.__name__}({', '.join(parametros)})")
            con_defecto = parametros[len(parametros) - len(defectos) :]
            info["atributos"] = [[f"defecto de {p}", dirs.de(d)] for p, d in zip(con_defecto, defectos)]
            pendientes.extend(defectos)
        elif isinstance(o, type):
            metodos = [n for n, v in vars(o).items() if isinstance(v, types.FunctionType) and (not n.startswith("__") or n in ("__init__", "__add__", "__eq__"))]
            info.update(tipo="clase", nombre=o.__name__, valor=f"class {o.__name__}", metodos=metodos)
        elif isinstance(o, BaseException):
            pass
        elif hasattr(o, "__dict__"):
            info["atributos"] = [[k, dirs.de(v)] for k, v in vars(o).items()]
            pendientes.extend(vars(o).values())
        objetos[ref] = info


def _memoria(frame: types.FrameType, dirs: _Direcciones, extra: tuple = ()) -> dict:
    pila = []
    f: types.FrameType | None = frame
    while f is not None:
        if f.f_code.co_filename == ARCHIVO:
            pila.append(f)
        f = f.f_back
    pila.reverse()
    marcos, raices = [], list(extra)
    for f in pila:
        es_modulo = f.f_code.co_name == "<module>"
        espacio = f.f_globals if es_modulo else dict(f.f_locals)
        variables = []
        for nombre, valor in list(espacio.items()):
            if _visible(nombre, valor):
                variables.append({"nombre": nombre, "ref": dirs.de(valor)})
                raices.append(valor)
        marcos.append({"nombre": _nombre_marco(f), "linea": f.f_lineno, "variables": variables})
    objetos: dict[str, dict] = {}
    for r in raices:
        _describir(r, dirs, objetos)
    return {"marcos": marcos, "objetos": [objetos[k] for k in sorted(objetos)]}


# ── Orden de evaluación ─────────────────────────────────────────────────────

_INSEGUROS = (ast.Call, ast.Await, ast.Yield, ast.YieldFrom, ast.NamedExpr, ast.Lambda, ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)


def _hijos(n: ast.AST) -> list[ast.AST]:
    if isinstance(n, ast.BinOp):
        return [n.left, n.right]
    if isinstance(n, ast.UnaryOp):
        return [n.operand]
    if isinstance(n, ast.BoolOp):
        return list(n.values)
    if isinstance(n, ast.Compare):
        return [n.left, *n.comparators]
    if isinstance(n, ast.Call):
        return [n.func, *n.args, *(k.value for k in n.keywords)]
    if isinstance(n, ast.Attribute):
        return [n.value]
    if isinstance(n, ast.Subscript):
        return [n.value, n.slice]
    if isinstance(n, (ast.List, ast.Tuple, ast.Set)):
        return list(n.elts)
    if isinstance(n, ast.Dict):
        return [x for par in zip(n.keys, n.values) for x in par if x is not None]
    if isinstance(n, ast.JoinedStr):
        return [v.value for v in n.values if isinstance(v, ast.FormattedValue)]
    return []


def _post_orden(n: ast.AST):
    for h in _hijos(n):
        yield from _post_orden(h)
    yield n


def _seguro(n: ast.AST) -> bool:
    return not any(isinstance(x, _INSEGUROS) for x in ast.walk(n))


def _nota(n: ast.AST, frame: types.FrameType, fragmento: str) -> str:
    if isinstance(n, ast.Name):
        if n.id in frame.f_locals and frame.f_code.co_name != "<module>":
            return f"busca {n.id} en el marco de {frame.f_code.co_name}"
        if n.id in frame.f_globals:
            return f"busca {n.id} en el marco global"
        if hasattr(builtins, n.id):
            return f"busca {n.id}: no está en tus marcos, lo encuentra entre las funciones incorporadas"
        return f"busca {n.id}"
    if isinstance(n, ast.Constant):
        return "literal: Python usa (o crea) este objeto"
    if isinstance(n, ast.Call):
        if isinstance(n.func, ast.Name) and n.func.id == "print":
            return "llama a print: escribe en la salida y devuelve None"
        return "llama a la función: el resultado se conoce cuando termine"
    if isinstance(n, ast.BinOp):
        return "calcula la operación con los dos valores anteriores"
    if isinstance(n, ast.Compare):
        return "compara: el resultado es True o False"
    if isinstance(n, ast.BoolOp):
        return "combina con and/or (se detiene en cuanto conoce el resultado)"
    if isinstance(n, ast.UnaryOp):
        return "aplica el operador"
    if isinstance(n, ast.Attribute):
        return f"lee el atributo {n.attr} del objeto"
    if isinstance(n, ast.Subscript):
        return "accede por índice o clave"
    if isinstance(n, ast.List):
        return "crea una lista nueva"
    if isinstance(n, ast.Tuple):
        return "crea una tupla"
    if isinstance(n, ast.Dict):
        return "crea un diccionario nuevo"
    if isinstance(n, ast.JoinedStr):
        return "arma el texto con los valores"
    return "evalúa"


def _expresion(n: ast.AST, frame: types.FrameType, codigo: str) -> list[dict]:
    pasos = []
    for nodo in _post_orden(n):
        fragmento = ast.get_source_segment(codigo, nodo) or ""
        valor = None
        if _seguro(nodo):
            try:
                valor = _corto(texto(eval(compile(ast.Expression(nodo), "<orden>", "eval"), frame.f_globals, dict(frame.f_locals))))
            except Exception:
                valor = None
        pasos.append({"fragmento": fragmento, "valor": valor, "nota": _nota(nodo, frame, fragmento)})
    return pasos


def _objetivo(t: ast.AST, codigo: str) -> str:
    fragmento = ast.get_source_segment(codigo, t) or "?"
    if isinstance(t, ast.Name):
        return f"el nombre {fragmento}"
    if isinstance(t, ast.Attribute):
        return f"el atributo {t.attr} del objeto"
    if isinstance(t, ast.Subscript):
        return f"la posición {ast.get_source_segment(codigo, t.slice)} del contenedor"
    return fragmento


def _orden(stmt: ast.AST | None, frame: types.FrameType, codigo: str) -> list[dict]:
    if stmt is None:
        return []
    seg = lambda n: ast.get_source_segment(codigo, n) or ""  # noqa: E731
    final = lambda frag, nota: {"fragmento": frag, "valor": None, "nota": nota}  # noqa: E731
    if isinstance(stmt, ast.Assign):
        objetivos = ", ".join(_objetivo(t, codigo) for t in stmt.targets)
        return [*_expresion(stmt.value, frame, codigo), final(", ".join(seg(t) for t in stmt.targets), f"enlaza {objetivos} al resultado")]
    if isinstance(stmt, ast.AugAssign):
        return [*_expresion(stmt.target, frame, codigo), *_expresion(stmt.value, frame, codigo), final(seg(stmt), f"calcula y vuelve a enlazar {_objetivo(stmt.target, codigo)}")]
    if isinstance(stmt, ast.AnnAssign):
        if stmt.value is None:
            return [final(seg(stmt), f"declara {seg(stmt.target)} con su tipo: no crea ningún valor")]
        return [*_expresion(stmt.value, frame, codigo), final(seg(stmt.target), f"enlaza {_objetivo(stmt.target, codigo)} al resultado")]
    if isinstance(stmt, ast.Expr):
        return _expresion(stmt.value, frame, codigo)
    if isinstance(stmt, ast.Return):
        partes = _expresion(stmt.value, frame, codigo) if stmt.value else []
        return [*partes, final("return", f"devuelve el resultado y sale de {frame.f_code.co_name}")]
    if isinstance(stmt, (ast.If, ast.While)):
        palabra = "if" if isinstance(stmt, ast.If) else "while"
        return [*_expresion(stmt.test, frame, codigo), final(palabra, "si es verdadero entra al bloque; si no, lo salta")]
    if isinstance(stmt, ast.For):
        return [*_expresion(stmt.iter, frame, codigo), final(f"for {seg(stmt.target)}", f"toma el siguiente elemento y lo enlaza a {seg(stmt.target)}; si no quedan, sale del bucle")]
    if isinstance(stmt, ast.FunctionDef):
        defectos = [p for d in stmt.args.defaults for p in _expresion(d, frame, codigo)]
        return [*defectos, final(f"def {stmt.name}", f"crea el objeto función {stmt.name} sin ejecutar su cuerpo y lo enlaza al nombre {stmt.name}")]
    if isinstance(stmt, ast.ClassDef):
        decorado = " y le aplica el decorador" if stmt.decorator_list else ""
        return [final(f"class {stmt.name}", f"ejecuta el cuerpo de la clase, crea el objeto clase {stmt.name}{decorado}")]
    if isinstance(stmt, ast.Raise):
        partes = _expresion(stmt.exc, frame, codigo) if stmt.exc else []
        return [*partes, final("raise", "lanza la excepción: abandona la línea y busca un except")]
    if isinstance(stmt, ast.Assert):
        return [*_expresion(stmt.test, frame, codigo), final("assert", "si es falso, lanza AssertionError")]
    if isinstance(stmt, ast.Try):
        return [final("try", "entra al bloque try: si algo lanza una excepción, salta al except que corresponda")]
    if isinstance(stmt, ast.ExceptHandler):
        nombre = f" y la enlaza a {stmt.name}" if stmt.name else ""
        tipo = seg(stmt.type) if stmt.type else "cualquier excepción"
        return [final(f"except {tipo}", f"comprueba si la excepción es {tipo}; si coincide, entra{nombre}")]
    if isinstance(stmt, (ast.Import, ast.ImportFrom)):
        return [final(seg(stmt), "carga el módulo y enlaza los nombres importados")]
    if isinstance(stmt, ast.Pass):
        return [final("pass", "no hace nada")]
    return [final(seg(stmt), "ejecuta la sentencia")]


def _sentencias_por_linea(arbol: ast.AST) -> dict[int, ast.AST]:
    por_linea: dict[int, ast.AST] = {}
    for nodo in ast.walk(arbol):
        if isinstance(nodo, (ast.stmt, ast.ExceptHandler)):
            por_linea.setdefault(nodo.lineno, nodo)
            for decorador in getattr(nodo, "decorator_list", []):
                por_linea.setdefault(decorador.lineno, nodo)
    return por_linea


def _nombres(codigo: types.CodeType) -> set[str]:
    nombres = set(codigo.co_names) | set(codigo.co_varnames)
    for c in codigo.co_consts:
        if isinstance(c, types.CodeType):
            nombres |= _nombres(c)
    return {n for n in nombres if not n.startswith("__") and n != "_"}


# ── Traza ───────────────────────────────────────────────────────────────────


def _builtins() -> dict:
    seguros = dict(vars(builtins))

    def sin_input(*_: Any) -> str:
        raise RuntimeError("input() no está disponible aquí: escribe el valor directamente en el código")

    seguros["input"] = sin_input
    return seguros


def trazar(codigo: str, max_pasos: int = MAX_PASOS) -> dict:
    """Ejecuta el código y devuelve los eventos crudos con su memoria."""
    resultado: dict[str, Any] = {"codigo": codigo, "error_compilacion": None, "nombres": [], "eventos": [], "excepcion": None, "truncado": False, "salida": ""}
    try:
        compilado = compile(codigo, ARCHIVO, "exec")
        arbol = ast.parse(codigo)
    except SyntaxError as error:
        resultado["error_compilacion"] = {"linea": error.lineno, "mensaje": error.msg}
        return resultado
    resultado["nombres"] = sorted(_nombres(compilado))
    sentencias = _sentencias_por_linea(arbol)
    dirs = _Direcciones()
    salida = io.StringIO()
    eventos: list[dict] = []
    profundidad = {"actual": 0}

    def registrar(frame: types.FrameType, evento: str, arg: Any) -> None:
        if len(eventos) >= max_pasos:
            raise DemasiadosPasos()
        if evento == "call":
            profundidad["actual"] += 1
        datos: dict[str, Any] = {
            "tipo": evento,
            "linea": frame.f_lineno,
            "funcion": _nombre_marco(frame),
            "profundidad": profundidad["actual"],
            "salida": salida.getvalue(),
        }
        extra: tuple = ()
        if evento == "line":
            datos["orden"] = _orden(sentencias.get(frame.f_lineno), frame, codigo)
        elif evento == "return":
            extra = (arg,)
            datos["retorno"] = dirs.de(arg)
        elif evento == "exception":
            extra = (arg[1],)
            datos["excepcion"] = f"{arg[0].__name__}: {arg[1]}"
        datos["memoria"] = _memoria(frame, dirs, extra)
        eventos.append(datos)
        if evento == "return":
            profundidad["actual"] -= 1

    def local(frame: types.FrameType, evento: str, arg: Any):
        registrar(frame, evento, arg)
        return local

    def global_(frame: types.FrameType, evento: str, arg: Any):
        if frame.f_code.co_filename != ARCHIVO:
            return None
        registrar(frame, evento, arg)
        return local

    # El código corre como un módulo real: herramientas como dataclass buscan
    # su módulo en sys.modules. Se registra solo mientras dura la ejecución.
    modulo = types.ModuleType(MODULO)
    modulo.__dict__["__builtins__"] = _builtins()
    previo = sys.modules.get(MODULO)
    sys.modules[MODULO] = modulo
    anterior = sys.gettrace()
    try:
        with redirect_stdout(salida):
            sys.settrace(global_)
            try:
                exec(compilado, modulo.__dict__)
            finally:
                sys.settrace(anterior)
                if previo is None:
                    sys.modules.pop(MODULO, None)
                else:
                    sys.modules[MODULO] = previo
    except DemasiadosPasos:
        resultado["truncado"] = True
    except Exception as error:  # el programa de la persona falló: es parte de la lección
        resultado["excepcion"] = f"{type(error).__name__}: {error}"
    resultado["eventos"] = eventos
    resultado["salida"] = salida.getvalue()
    return resultado


# ── Explicación ─────────────────────────────────────────────────────────────


def _indice(memoria: dict) -> dict[str, dict]:
    return {o["ref"]: o for o in memoria["objetos"]}


def _desc(o: dict | None) -> str:
    if o is None:
        return "un objeto"
    tipo = o["tipo"]
    if tipo == "función":
        return f"la función {o.get('nombre', '')}"
    if tipo == "clase":
        return f"la clase {o.get('nombre', '')}"
    if tipo in ("list", "dict", "tuple", "set"):
        nombres = {"list": "una lista", "dict": "un diccionario", "tuple": "una tupla", "set": "un conjunto"}
        return f"{nombres[tipo]} {o['valor']}"
    if tipo in ("int", "float", "bool", "str", "NoneType"):
        return f"{tipo} {o['valor']}"
    return f"un objeto {tipo} {o['valor']}"


def _contenido(o: dict) -> tuple:
    return (o["valor"], tuple(o.get("elementos", ())), tuple(map(tuple, o.get("pares", ()))), tuple(map(tuple, o.get("atributos", ()))))


def _quienes_apuntan(memoria: dict, ref: str, excepto: str | None = None) -> list[str]:
    nombres = []
    for marco in memoria["marcos"]:
        for v in marco["variables"]:
            if v["ref"] == ref and v["nombre"] != excepto:
                sufijo = "" if marco["nombre"] == "global" else f" (en {marco['nombre']})"
                nombres.append(v["nombre"] + sufijo)
    return nombres


def _marco_legible(nombre: str) -> str:
    return "el marco global" if nombre == "global" else f"el marco de {nombre}"


def _diferencias(antes: dict, despues: dict, evento: str) -> list[str]:
    frases: list[str] = []
    obj_antes, obj_despues = _indice(antes), _indice(despues)
    marcos_antes = antes["marcos"]
    for i, marco in enumerate(despues["marcos"]):
        if i >= len(marcos_antes) or marcos_antes[i]["nombre"] != marco["nombre"]:
            continue
        previas = {v["nombre"]: v["ref"] for v in marcos_antes[i]["variables"]}
        actuales = {v["nombre"]: v["ref"] for v in marco["variables"]}
        donde = _marco_legible(marco["nombre"])
        for nombre, ref in actuales.items():
            o = obj_despues.get(ref)
            if nombre not in previas:
                if o and o["tipo"] == "función":
                    frases.append(f"def creó el objeto función {nombre} en {ref} y lo enlazó al nombre {nombre}. Su cuerpo todavía no se ejecuta: se ejecutará cada vez que alguien la llame.")
                elif o and o["tipo"] == "clase":
                    frases.append(f"class creó el objeto clase {nombre} en {ref}, con sus métodos ({', '.join(o.get('metodos', [])) or 'ninguno'}). Todavía no existe ningún objeto {nombre}.")
                else:
                    nuevo = " Es un objeto nuevo." if ref not in obj_antes else " No se creó nada: ese objeto ya existía en memoria."
                    frases.append(f"Nueva variable {nombre} en {donde}: apunta a {_desc(o)} que vive en {ref}.{nuevo}")
                    otros = _quienes_apuntan(despues, ref, excepto=nombre)
                    if otros:
                        frases.append(f"Es el mismo objeto al que apunta {', '.join(otros)}: no se copió, ahora hay dos nombres para un objeto.")
            elif previas[nombre] != ref:
                anterior = obj_antes.get(previas[nombre])
                frases.append(f"{nombre} ahora apunta a otro objeto: {_desc(o)} en {ref}. El objeto anterior ({_desc(anterior)} en {previas[nombre]}) no cambió.")
        for nombre in previas.keys() - actuales.keys():
            frases.append(f"La variable {nombre} desapareció de {donde}.")
    for ref, o in obj_despues.items():
        previo = obj_antes.get(ref)
        if previo and _contenido(previo) != _contenido(o) and o["tipo"] not in ("función", "clase"):
            frases.append(f"El objeto {o['tipo']} en {ref} cambió por dentro: {previo['valor']} → {o['valor']}.")
            quienes = _quienes_apuntan(despues, ref)
            if len(quienes) > 1:
                frases.append(f"Lo ven todas las variables que apuntan a él: {', '.join(quienes)}.")
    if evento == "line" and len(despues["marcos"]) < len(marcos_antes):
        cerrado = marcos_antes[len(despues["marcos"])]["nombre"]
        frases.append(f"De vuelta en {_marco_legible(despues['marcos'][-1]['nombre'])}: el marco de {cerrado} ya no existe.")
    return frases


def _resultado_condicion(orden: list[dict]) -> bool | None:
    """Si la línea anterior era un if o while, devuelve el valor de su condición."""
    if len(orden) >= 2 and orden[-1]["fragmento"] in ("if", "while") and orden[-2]["valor"] in ("True", "False"):
        return orden[-2]["valor"] == "True"
    return None


def explicar(traza: dict) -> list[dict]:
    """Convierte los eventos en pasos con t, líneas y explicación."""
    vacia = {"marcos": [], "objetos": []}
    nombres = ", ".join(traza["nombres"]) or "ninguno"
    compilacion = {
        "t": -1,
        "tipo": "compilacion",
        "funcion": None,
        "ejecutada": None,
        "siguiente": None,
        "memoria": vacia,
        "salida": "",
        "orden": [],
        "explicacion": [
            "Antes de ejecutar nada, Python lee el archivo completo y lo compila a bytecode: instrucciones que su máquina virtual entiende.",
            "Si hubiera un error de sintaxis, el programa fallaría aquí, sin ejecutar ni una sola línea.",
            f"Nombres que aparecen en el código: {nombres}. Ninguno existe todavía en memoria.",
        ],
    }
    if traza["error_compilacion"]:
        e = traza["error_compilacion"]
        compilacion["explicacion"] = [f"Error de sintaxis en la línea {e['linea']}: {e['mensaje']}.", "Python no ejecutó ninguna línea: los errores de sintaxis se detectan al compilar, en t<0."]
        compilacion["siguiente"] = e["linea"]
        return [compilacion]

    eventos = [e for e in traza["eventos"] if not (e["tipo"] == "call" and e["funcion"] == "global")]
    pasos = [compilacion]
    ultima_linea: dict[int, int | None] = {}
    anterior = {"memoria": vacia, "salida": ""}
    for t, e in enumerate(eventos):
        prof = e["profundidad"]
        es_fin = e["tipo"] == "return" and e["funcion"] == "global"
        if e["tipo"] == "line":
            ejecutada = ultima_linea.get(prof)
            ultima_linea[prof] = e["linea"]
        elif e["tipo"] == "call":
            ejecutada = None
            ultima_linea[prof] = None
        elif e["tipo"] == "return":
            ejecutada = e["linea"]
            ultima_linea.pop(prof, None)
        else:
            ejecutada = None
        frases: list[str] = []
        if t == 0:
            frases.append("Empieza la ejecución. Python crea el marco global: el espacio donde vivirán las variables del programa.")
            frases.append(f"Lo primero que se ejecuta es la línea {e['linea']}.")
        elif e["tipo"] == "call" and e["funcion"].startswith("clase "):
            nombre = e["funcion"][len("clase ") :]
            frases.append(f"Python ejecuta el cuerpo de la clase {nombre} una sola vez, en un espacio propio: cada def de adentro crea un método y cada anotación declara un campo.")
        elif e["tipo"] == "call":
            marcos = e["memoria"]["marcos"]
            frases.append(f"Se llama a {e['funcion']}: Python crea un marco nuevo en la pila de llamadas (ahora hay {len(marcos)}).")
            indice = _indice(e["memoria"])
            for v in marcos[-1]["variables"]:
                frases.append(f"El parámetro {v['nombre']} apunta a {_desc(indice.get(v['ref']))} en {v['ref']}: el mismo objeto que se pasó, no una copia.")
        elif e["tipo"] == "exception":
            frases.append(f"Se lanzó {e['excepcion']} en la línea {e['linea']}. Python deja de ejecutar esa línea y busca un except, subiendo por la pila si hace falta.")
        if t > 0 and e["tipo"] != "call":
            frases.extend(_diferencias(anterior["memoria"], e["memoria"], e["tipo"]))
        nueva_salida = e["salida"][len(anterior["salida"]) :]
        if nueva_salida:
            frases.append(f"Se escribió en la salida: «{nueva_salida.rstrip()}».")
        if e["tipo"] == "return" and e["funcion"].startswith("clase "):
            frases.append(f"Terminó el cuerpo de la {e['funcion']}. Con lo que se definió adentro, Python crea el objeto clase; ese espacio temporal desaparece.")
        elif e["tipo"] == "return" and not es_fin:
            retorno = _indice(e["memoria"]).get(e["retorno"])
            locales = [v["nombre"] for v in e["memoria"]["marcos"][-1]["variables"]]
            texto_locales = f" y sus variables locales ({', '.join(locales)}) dejan de existir" if locales else ""
            frases.append(f"{e['funcion']} devuelve {_desc(retorno)} ({e['retorno']}). Al terminar, su marco se destruye{texto_locales}.")
        condicion = _resultado_condicion(anterior.get("orden", [])) if anterior.get("tipo") == "line" else None
        if e["tipo"] == "line" and condicion is not None:
            frases.append("La condición dio True: Python entra al bloque." if condicion else "La condición dio False: Python salta el bloque.")
        if e["tipo"] == "line" and anterior.get("tipo") == "call":
            frases.append(f"Python entra al cuerpo de {e['funcion']}: lo siguiente es la línea {e['linea']}.")
        if e["tipo"] == "line" and t > 0 and ejecutada is not None:
            if e["linea"] < ejecutada:
                frases.append(f"Python vuelve a la línea {e['linea']}.")
            elif e["linea"] > ejecutada + 1 and not frases and condicion is None:
                frases.append(f"Python salta de la línea {ejecutada} a la {e['linea']}.")
        if es_fin:
            frases.append("El programa terminó. Al terminar, el marco global y todos sus objetos se liberan.")
        if not frases:
            frases.append(f"Se ejecutó la línea {ejecutada}: no creó ni cambió variables." if ejecutada else "Python continúa.")
        pasos.append(
            {
                "t": t,
                "tipo": "fin" if es_fin else e["tipo"],
                "funcion": e["funcion"],
                "ejecutada": ejecutada,
                "siguiente": e["linea"] if e["tipo"] in ("line", "call") else None,
                "memoria": e["memoria"],
                "salida": e["salida"],
                "orden": e.get("orden", []),
                "explicacion": frases,
            }
        )
        anterior = e
    if traza["truncado"]:
        pasos[-1]["explicacion"].append(f"Se detuvo tras {MAX_PASOS} pasos: probablemente un bucle que nunca termina.")
    if traza["excepcion"] and pasos[-1]["tipo"] != "fin":
        pasos[-1]["explicacion"].append(f"El programa terminó con un error que nadie capturó: {traza['excepcion']}.")
    return pasos


def ejecutar(codigo: str, max_pasos: int = MAX_PASOS) -> dict:
    """Traza y explica. Es lo que usan las lecciones y el navegador."""
    traza = trazar(codigo, max_pasos)
    return {
        "codigo": codigo,
        "pasos": explicar(traza),
        "salida": traza["salida"],
        "excepcion": traza["excepcion"],
        "error_compilacion": traza["error_compilacion"],
        "truncado": traza["truncado"],
    }


def ejecutar_json(codigo: str) -> str:
    """Punto de entrada para Pyodide."""
    return json.dumps(ejecutar(codigo), ensure_ascii=False)
