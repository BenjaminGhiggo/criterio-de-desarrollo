# Propuestas de protagonista

Las tres propuestas comparten el mismo núcleo (`criterio.tiempo`) y el mismo lenguaje ubicuo sobre el tiempo. Difieren en **quién** es el protagonista y en **qué** se mide.

## Núcleo compartido

- `Instante` (Value Object): un entero `t`. Su `fase` depende solo del signo.
- `EventoDeDominio`: algo que pasó en un instante. Inmutable.
- `LineaDeTiempo`: eventos ordenados por instante, inmutable, orden estable.
- `Protagonista`: raíz de agregado. `estado_en(t) = reduce(aplicar, eventos_hasta(t), estado_inicial)`.

Por qué event sourcing y no un atributo `estado`: queremos preguntar por el pasado (`t<0`) sin guardar copias. Si el estado se proyecta desde los hechos, cualquier `t` es consultable y las tres fases nunca se contradicen.

## A. La Decisión

| Fase | Comandos | Invariantes |
|---|---|---|
| `t<0` | `identificar_fuerza`, `considerar_opcion` | Solo en `t<0`. Sin opciones repetidas. |
| `t=0` | `decidir(clave, justificacion)` | Una sola vez. Al menos dos opciones. La justificación cita fuerzas identificadas. |
| `t>0` | `observar(t, descripcion, impacto)` | Solo en `t>0` y solo si hubo decisión. |

Estado: `EN_CONTEXTO -> DECIDIDA -> VALIDADA | CUESTIONADA` según el balance de consecuencias.

- A favor: modela el porqué de forma directa; cada lección del catálogo es una `Decision` que se puede vivir por cualquier camino (el recomendado y los contrafactuales).
- En contra: las consecuencias son narradas por quien escribe la lección.
- Cuándo usarla: enseñar patrones, documentar decisiones de arquitectura (un ADR que vive).

## B. El Aprendiz

| Fase | Comandos | Reglas |
|---|---|---|
| `t<0` | `diagnosticar(t, puntaje)` | Punto de partida entre 0 y 100. |
| `t=0` | `comprometerse(meta)` | Requiere diagnóstico. |
| `t>0` | `resolver(t, leccion, acerto, justifico)` | Requiere compromiso. |

Puntos: acertar y justificar `+10`; equivocarse justificando `+4`; acertar sin justificar `+2`; ni una ni otra `-3`. Etapas de competencia: inconsciente, consciente, competencia consciente (criterio 50) y competencia inconsciente (criterio 80 y racha de 3).

- A favor: mide a la persona; premia el razonamiento, no la suerte.
- En contra: la puntuación es un modelo, no una verdad.
- Cuándo usarla: cursos, onboarding de equipos, seguimiento de mentorías.

## C. El Módulo de código

| Fase | Comandos | Reglas |
|---|---|---|
| `t<0` | `escribir_prueba(t)` | Las pruebas en `t<0` cuentan como "prueba primero". |
| `t=0` | `publicar(comportamientos)` | Una vez, al menos un comportamiento. |
| `t>0` | `cambiar(t, con_prueba)`, `refactorizar(t)` | Refactorizar exige cobertura de 70%: sin red de seguridad está prohibido. |

`costo_de_cambio = (1 + 0.35 * deuda) * (2 - cobertura)`. Código limpio y probado cuesta 1.0.

- A favor: las consecuencias se calculan y se pueden simular (`criterio simular`).
- En contra: reduce la realidad a un número.
- Cuándo usarla: mostrar el efecto acumulado de TDD frente a no probar.

## Cómo se combinan

El sitio usa A para el laboratorio de lecciones, C para la simulación del costo de cambio y B para el recorrido personal de quien visita. Cada contexto es independiente (no importa a los otros) salvo el catálogo, que es cliente de A, y la capa web, que solo lee.

## Ideas para seguir

- Lecciones nuevas: agregar un `Leccion` en `catalogo/lecciones.py`. Las pruebas parametrizadas verifican automáticamente que sea una decisión válida por todos sus caminos.
- Persistencia del Aprendiz: un `RepositorioDeAprendices` (puerto) con adaptador en memoria y otro en base de datos.
- Consecuencias calculadas para A usando el modelo de C.
