import json
from pathlib import Path

import pytest

from criterio.cli import main
from criterio.ruta import RUTA
from criterio.web import DESTINO, exportar, exportar_a_archivo, serializar
from criterio.web.ruta import DESTINO_MOTOR, DESTINO_RUTA, CARPETA_TRAZAS, fuente_motor, serializar_ruta, serializar_traza

RAIZ = Path(__file__).resolve().parent.parent


def test_exportar_incluye_fases_metodologias_lecciones_y_simulacion():
    datos = exportar()
    assert [f["signo"] for f in datos["fases"]] == ["t<0", "t=0", "t>0"]
    assert len(datos["metodologias"]["metodos"]) >= 18
    assert len(datos["lecciones"]) >= 6
    assert set(datos["simulacion"]) == {"tdd", "pruebas-despues", "sin-pruebas"}


def test_cada_metodo_tiene_trayectoria_de_t_negativo_a_t_30():
    for metodo in exportar()["metodologias"]["metodos"]:
        ts = [m["t"] for m in metodo["trayectoria"]]
        assert ts[0] < 0 and 0 in ts and ts[-1] == 30


def test_los_vectores_de_paridad_incluyen_plan_y_mediciones():
    vectores = exportar()["metodologias"]["vectores"]
    assert vectores and all(v["plan"] and v["mediciones"] for v in vectores)


def test_los_datos_del_sitio_estan_al_dia():
    # Si falla: ejecuta `criterio exportar` y confirma el archivo generado.
    assert (RAIZ / DESTINO).read_text(encoding="utf-8") == serializar()


def _version_de_las_trazas() -> str:
    return json.loads((RAIZ / DESTINO_RUTA).read_text(encoding="utf-8"))["python"]


def test_el_motor_del_navegador_es_el_mismo_que_el_de_python():
    assert (RAIZ / DESTINO_MOTOR).read_text(encoding="utf-8") == fuente_motor()


def test_la_ruta_y_las_trazas_estan_al_dia():
    import sys

    version = f"{sys.version_info.major}.{sys.version_info.minor}"
    if _version_de_las_trazas() != version:
        pytest.skip(f"Las trazas se generaron con Python {_version_de_las_trazas()}; este es {version}")
    assert (RAIZ / DESTINO_RUTA).read_text(encoding="utf-8") == serializar_ruta()
    for leccion in RUTA:
        assert (RAIZ / CARPETA_TRAZAS / f"{leccion.id}.json").read_text(encoding="utf-8") == serializar_traza(leccion)


def test_cli_ruta_y_ejecutar(capsys, tmp_path):
    assert main(["ruta"]) == 0
    assert "hola-mundo" in capsys.readouterr().out
    assert main(["ejecutar", "hola-mundo"]) == 0
    assert "compila" in capsys.readouterr().out
    archivo = tmp_path / "mio.py"
    archivo.write_text("x = 1\ny = x\n", encoding="utf-8")
    assert main(["ejecutar", "--archivo", str(archivo)]) == 0
    assert "mismo objeto" in capsys.readouterr().out


def test_cada_camino_cubre_desde_t_negativo_hasta_t_final():
    leccion = exportar()["lecciones"][0]
    for camino in leccion["caminos"]:
        ts = [paso["t"] for paso in camino["trayectoria"]]
        assert ts[0] == leccion["t_inicial"] < 0
        assert ts[-1] == leccion["t_final"]


def test_exportar_a_archivo_escribe_json_valido(tmp_path):
    destino = exportar_a_archivo(tmp_path / "sub" / "data.json")
    assert json.loads(destino.read_text(encoding="utf-8"))["metodologias"]


def test_cli_metodos(capsys):
    assert main(["metodos"]) == 0
    assert "espaciada" in capsys.readouterr().out


def test_cli_metodo_muestra_donde_esta_el_conocimiento(capsys):
    assert main(["metodo", "espaciada", "--t", "-1"]) == 0
    salida = capsys.readouterr().out
    assert "Antes" in salida and "retencion" in salida


def test_cli_combinar(capsys):
    assert main(["combinar", "espaciada", "feynman", "--t", "30"]) == 0
    assert "Técnica Feynman" in capsys.readouterr().out


def test_cli_lecciones(capsys):
    assert main(["lecciones"]) == 0
    assert "value-object" in capsys.readouterr().out


def test_cli_leccion_en_t_negativo_no_muestra_eleccion(capsys):
    assert main(["leccion", "value-object", "--t", "-2"]) == 0
    salida = capsys.readouterr().out
    assert "Antes" in salida
    assert "Elegida en t=0" not in salida


def test_cli_inexistente_devuelve_error(capsys):
    assert main(["metodo", "nada"]) == 1
    assert "No existe" in capsys.readouterr().err


def test_cli_simular(capsys):
    assert main(["simular", "tdd", "--pasos", "2"]) == 0
    assert "costo" in capsys.readouterr().out
