# Criterio de desarrollo

Sistema para aprender a programar en Python **desde Hola mundo**, viendo en cada paso **qué se ejecuta primero** y **dónde vive cada variable** en memoria, hasta llegar a **Domain Driven Design** con **Test Driven Development**. Cada lección se trabaja con metodologías de aprendizaje (19 en total, con su evidencia) para que elijas las que de verdad te hacen aprender.

Sitio: <https://criterio.benjacode.com>

## La ruta: de Hola mundo a un agregado

16 lecciones en 6 unidades: primeros pasos (Hola mundo, variables, reasignación, orden de evaluación), decidir y repetir, funciones y la pila, datos que cambian (alias, el valor por defecto mutable, diccionarios), objetos (clases, excepciones, Value Object) y diseño con criterio (pruebas y TDD, agregado de DDD).

Cada lección sigue el mismo tiempo:

- **t<0** predices qué va a pasar (PRIMM, fracaso productivo, pre-mortem…). Python, mientras tanto, compila el archivo.
- **t=0** empieza la ejecución.
- **t>0** paso a paso: la línea recién ejecutada y la siguiente, el orden en que se evalúa cada parte de la línea, la pila de marcos con sus nombres y el montón de objetos con su dirección, con una flecha de cada variable a su objeto. Al terminar repasas sin mirar, lo explicas con tus palabras y lo modificas en un editor que ejecuta Python real en el navegador.

El paso a paso lo produce `criterio.ejecucion.motor`, que ejecuta el código con `sys.settrace` y explica en español qué cambió. Solo usa la biblioteca estándar: el sitio descarga ese mismo archivo y lo ejecuta con Pyodide, así que tu código y las lecciones se explican igual.

```bash
criterio ruta                               # las 16 lecciones
criterio ejecutar funciones                 # paso a paso en la terminal
criterio ejecutar --archivo mi_programa.py  # tu propio código
```

## El protagonista medido en el tiempo

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

El protagonista de las metodologías es tu conocimiento de un concepto.

Memoria (releer como control, recuperación, repetición espaciada), comprensión (fracaso productivo, ejemplos resueltos que se desvanecen, PRIMM, Feynman), práctica (intercalado, ejemplos con errores, Parsons, TDD como método de aprendizaje, kata, mastery learning), criterio (cinco porqués, pre-mortem y post-mortem, casos con protagonista, diario ADR) y con otros (enseñar con pato de goma y diálogo socrático, programación en pareja).

El detalle de cada una (evidencia, fuente, plan, cuándo no usarla) está en [`docs/metodologias.md`](docs/metodologias.md).

**Las pruebas codifican la evidencia.** Los números del modelo son ilustrativos, pero las comparaciones que sostiene la investigación son pruebas que fallan si alguien las contradice: recuperar retiene más que releer (Roediger y Karpicke, 2006), espaciar vence a concentrar (Cepeda et al., 2006), releer produce la mayor ilusión de fluidez, el fracaso productivo incomoda antes y transfiere después (Kapur, 2008), intercalar mejora la transferencia (Rohrer y Taylor, 2007). Ver `tests/test_metodologias.py`.

## Estructura

```
src/criterio/
  tiempo/         núcleo compartido: Instante, Fase, LineaDeTiempo, Protagonista
  ejecucion/      motor paso a paso (marcos, objetos, orden de evaluación)
  ruta/           16 lecciones de Hola mundo a un agregado con TDD
  metodologias/   el conocimiento como protagonista y las 19 metodologías
  decisiones/     Propuesta A: una decisión técnica como protagonista
  aprendiz/       Propuesta B: quien aprende como protagonista
  codigo/         Propuesta C: un módulo y su costo de cambio
  catalogo/       siete lecciones de Python y DDD (cliente de A)
  web/            exporta lecciones, trazas y trayectorias a web/src/data/ y motor.py a web/public/
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
criterio exportar            # regenera web/src/data/ (lecciones, trazas, metodologías) y web/public/motor.py
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
