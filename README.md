# Criterio de desarrollo

Sistema para aprender **por qué** se hace algo de una forma y no de otra en Python, con **Domain Driven Design** y **Test Driven Development**. Lo central es **cómo aprendes**: 19 metodologías de aprendizaje, cada una con un ejemplo interactivo, medidas en el tiempo, para que elijas las que de verdad te hacen aprender.

Sitio: <https://criterio.benjacode.com>

## La idea: un protagonista medido en el tiempo

El protagonista es **tu conocimiento de un concepto**. Tomamos como referencia el instante en que lo encuentras:

| Instante | Fase | En el aprendizaje |
|---|---|---|
| `t < 0` | Antes | Predecir, intentar y fallar, preguntarte para qué existe algo |
| `t = 0` | Encuentro | La explicación, el ejemplo resuelto, la documentación |
| `t > 0` | Después | Recuperar, espaciar, aplicar, enseñar, reflexionar |

El protagonista no guarda su estado: guarda lo que le pasó. Su estado en cualquier `t` es la proyección de sus eventos hasta `t`, así que siempre se puede preguntar **en qué estado está y dónde está**:

```python
from criterio.metodologias import buscar

conocimiento = buscar("espaciada").vivir()
conocimiento.medir(-1)   # fase ANTES: nada que recordar todavía
conocimiento.medir(0)    # fase DECISION: retención 100
conocimiento.medir(30)   # fase DESPUES: retención, comprensión, transferencia, criterio, confianza
```

## Las metodologías

Memoria (releer como control, recuperación, repetición espaciada), comprensión (fracaso productivo, ejemplos resueltos que se desvanecen, PRIMM, Feynman), práctica (intercalado, ejemplos con errores, Parsons, TDD como método de aprendizaje, kata, mastery learning), criterio (cinco porqués, pre-mortem y post-mortem, casos con protagonista, diario ADR) y con otros (enseñar con pato de goma y diálogo socrático, programación en pareja).

El detalle de cada una (evidencia, fuente, plan, cuándo no usarla) está en [`docs/metodologias.md`](docs/metodologias.md).

**Las pruebas codifican la evidencia.** Los números del modelo son ilustrativos, pero las comparaciones que sostiene la investigación son pruebas que fallan si alguien las contradice: recuperar retiene más que releer (Roediger y Karpicke, 2006), espaciar vence a concentrar (Cepeda et al., 2006), releer produce la mayor ilusión de fluidez, el fracaso productivo incomoda antes y transfiere después (Kapur, 2008), intercalar mejora la transferencia (Rohrer y Taylor, 2007). Ver `tests/test_metodologias.py`.

## Estructura

```
src/criterio/
  tiempo/         núcleo compartido: Instante, Fase, LineaDeTiempo, Protagonista
  metodologias/   el conocimiento como protagonista y las 19 metodologías
  decisiones/     Propuesta A: una decisión técnica como protagonista
  aprendiz/       Propuesta B: quien aprende como protagonista
  codigo/         Propuesta C: un módulo y su costo de cambio
  catalogo/       siete lecciones de Python y DDD (cliente de A)
  web/            exporta las trayectorias a web/src/data/criterio.json
  cli.py          aprender desde la terminal
web/              app construida sobre aurora-ui (TanStack Start, prerender estático)
tests/            pruebas escritas antes que el código
docs/             metodologías y propuestas
```

## Uso

```bash
pip install -e ".[dev]"
pytest

criterio metodos
criterio metodo fracaso-productivo --t -1
criterio combinar espaciada feynman premortem --t 30
criterio lecciones
criterio exportar            # regenera web/src/data/criterio.json
```

Web:

```bash
cd web
npm ci
npm test          # el port TypeScript del modelo da los mismos números que Python
npm run build     # dist/client: sitio estático
```

## Despliegue

Cloudflare Pages, proyecto `criterio`, dominio `criterio.benjacode.com`:

```bash
cd web && npm run build
npx wrangler pages deploy dist/client --project-name criterio --branch main
```

El workflow `.github/workflows/deploy.yml` hace lo mismo en cada push a `main` si el repositorio tiene los secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.
