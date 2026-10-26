# Criterio de desarrollo

Sistema para aprender **por qué** se hace algo de una forma y no de otra en Python, usando **Domain Driven Design** y **Test Driven Development**, medido en el tiempo.

Sitio: <https://criterio.benjacode.com>

## La idea: un protagonista medido en el tiempo

Toda decisión tiene un antes, un instante y un después. Tomamos `t = 0` como referencia:

| Instante | Fase | Pregunta |
|---|---|---|
| `t < 0` | Antes | ¿Por qué hay que decidir? ¿Qué fuerzas y alternativas existen? |
| `t = 0` | Decisión | ¿Qué se elige y con qué justificación? |
| `t > 0` | Después | ¿Qué consecuencia tuvo lo elegido con el paso del tiempo? |

El **protagonista** es una raíz de agregado que no guarda su estado: guarda lo que le pasó (eventos de dominio). Su estado en cualquier `t` es la proyección de sus eventos hasta `t`, así que siempre se puede preguntar **en qué estado está y dónde está**:

```python
decision.donde_esta(-1)   # Ubicacion(fase=ANTES,    estado=EN_CONTEXTO, ...)
decision.donde_esta(0)    # Ubicacion(fase=DECISION, estado=DECIDIDA, ...)
decision.donde_esta(5)    # Ubicacion(fase=DESPUES,  estado=VALIDADA, balance=+2, ...)
```

## Tres propuestas

Las tres comparten el núcleo de tiempo y están implementadas y probadas. El detalle y la comparación están en [`docs/propuestas.md`](docs/propuestas.md).

- **A. La Decisión** (`criterio.decisiones`): fuerzas y alternativas en `t<0`, elección justificada en `t=0`, consecuencias en `t>0`.
- **B. El Aprendiz** (`criterio.aprendiz`): diagnóstico, compromiso y práctica; el criterio sube al acertar sabiendo por qué.
- **C. El Módulo de código** (`criterio.codigo`): pruebas primero, publicación y costo de cambio que crece con la deuda.

## Estructura

```
src/criterio/
  tiempo/        núcleo compartido: Instante, Fase, LineaDeTiempo, Protagonista
  decisiones/    Propuesta A
  aprendiz/      Propuesta B
  codigo/        Propuesta C
  catalogo/      siete lecciones (Value Object, TDD, Repositorio, Agregado, ...)
  web/           exporta las trayectorias a JSON para el sitio
  cli.py         aprender desde la terminal
site/            sitio estático (HTML, CSS, JS sin dependencias)
tests/           pruebas escritas antes que el código
```

## Uso

```bash
pip install -e ".[dev]"
pytest

criterio lecciones
criterio leccion value-object --camino float --t 4
criterio simular sin-pruebas
criterio exportar site/data.json
```

## Sitio

El sitio no recalcula las lecciones: muestra las trayectorias que proyecta el dominio en Python (`criterio exportar`). Para verlo en local:

```bash
criterio exportar site/data.json
python -m http.server -d site 8000
```

Despliegue en Cloudflare Pages (proyecto `criterio`, dominio `criterio.benjacode.com`):

```bash
criterio exportar site/data.json
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... npx wrangler pages deploy site --project-name criterio --branch main
```

El workflow `.github/workflows/deploy.yml` hace lo mismo en cada push a `main` si el repositorio tiene los secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.
