import json

from criterio.cli import main
from criterio.web import exportar, exportar_a_archivo


def test_exportar_incluye_las_tres_fases_y_todas_las_lecciones():
    datos = exportar()
    assert [f["signo"] for f in datos["fases"]] == ["t<0", "t=0", "t>0"]
    assert len(datos["lecciones"]) >= 6
    assert set(datos["simulacion"]) == {"tdd", "pruebas-despues", "sin-pruebas"}


def test_cada_camino_cubre_desde_t_negativo_hasta_t_final():
    leccion = exportar()["lecciones"][0]
    for camino in leccion["caminos"]:
        ts = [paso["t"] for paso in camino["trayectoria"]]
        assert ts[0] == leccion["t_inicial"] < 0
        assert ts[-1] == leccion["t_final"]
        assert 0 in ts


def test_antes_de_t_cero_no_hay_eleccion_y_despues_si():
    camino = exportar()["lecciones"][0]["caminos"][0]
    por_t = {p["t"]: p for p in camino["trayectoria"]}
    assert por_t[-1]["elegida"] is None
    assert por_t[0]["elegida"] == camino["clave"]


def test_exportar_a_archivo_escribe_json_valido(tmp_path):
    destino = exportar_a_archivo(tmp_path / "sub" / "data.json")
    assert json.loads(destino.read_text(encoding="utf-8"))["lecciones"]


def test_cli_lecciones(capsys):
    assert main(["lecciones"]) == 0
    assert "value-object" in capsys.readouterr().out


def test_cli_leccion_en_t_negativo_no_muestra_eleccion(capsys):
    assert main(["leccion", "value-object", "--t", "-2"]) == 0
    salida = capsys.readouterr().out
    assert "Antes" in salida
    assert "Elegida en t=0" not in salida


def test_cli_leccion_inexistente_devuelve_error(capsys):
    assert main(["leccion", "nada"]) == 1
    assert "No existe" in capsys.readouterr().err


def test_cli_simular(capsys):
    assert main(["simular", "tdd", "--pasos", "2"]) == 0
    assert "costo" in capsys.readouterr().out
