# Metodologías de aprendizaje

El protagonista es tu conocimiento de un concepto. Cada metodología es un plan: qué haces antes de encontrarlo (t<0), cómo lo encuentras (t=0) y qué haces después (t>0). Las mediciones a t=+30 vienen del modelo ilustrativo de `criterio.metodologias.conocimiento` y sirven para comparar, no para predecir.

Para elegir: prueba el ejemplo de cada una en https://criterio.benjacode.com, valóralas con honestidad y combina las que te hicieron aprender. Una buena mezcla suele cubrir memoria (que dure), comprensión (que se entienda) y criterio (que sepas por qué).

| Metodología | Familia | Evidencia | Min | Retención | Comprensión | Transferencia | Criterio |
|---|---|---|---|---|---|---|---|
| [Releer y subrayar](https://criterio.benjacode.com/metodos/relectura) | Memoria | baja | 60 | 0 | 39 | 8 | 8 |
| [Práctica de recuperación](https://criterio.benjacode.com/metodos/recuperacion) | Memoria | alta | 60 | 26 | 42 | 8 | 8 |
| [Repetición espaciada](https://criterio.benjacode.com/metodos/espaciada) | Memoria | alta | 80 | 98 | 47 | 8 | 8 |
| [Fracaso productivo](https://criterio.benjacode.com/metodos/fracaso-productivo) | Comprensión | moderada | 110 | 28 | 52 | 41 | 14 |
| [Ejemplos resueltos que se desvanecen](https://criterio.benjacode.com/metodos/ejemplos-resueltos) | Comprensión | alta | 100 | 25 | 53 | 29 | 17 |
| [PRIMM: predecir, ejecutar, investigar, modificar, crear](https://criterio.benjacode.com/metodos/primm) | Comprensión | moderada | 110 | 13 | 53 | 36 | 27 |
| [Técnica Feynman (autoexplicación)](https://criterio.benjacode.com/metodos/feynman) | Comprensión | moderada | 85 | 8 | 55 | 19 | 31 |
| [Interrogación elaborativa (los cinco porqués)](https://criterio.benjacode.com/metodos/cinco-porques) | Criterio | moderada | 75 | 4 | 48 | 23 | 40 |
| [Práctica intercalada](https://criterio.benjacode.com/metodos/intercalado) | Práctica | moderada | 90 | 63 | 35 | 45 | 34 |
| [Ejemplos con errores (caza del bug)](https://criterio.benjacode.com/metodos/ejemplos-con-errores) | Práctica | moderada | 70 | 25 | 47 | 15 | 25 |
| [Problemas de Parsons](https://criterio.benjacode.com/metodos/parsons) | Práctica | moderada | 80 | 4 | 54 | 19 | 12 |
| [Aprender con TDD (cada prueba es una hipótesis)](https://criterio.benjacode.com/metodos/tdd) | Práctica | práctica profesional | 120 | 25 | 53 | 36 | 36 |
| [Kata y práctica deliberada](https://criterio.benjacode.com/metodos/kata) | Práctica | moderada | 155 | 48 | 47 | 46 | 25 |
| [Aprendizaje para el dominio (mastery learning)](https://criterio.benjacode.com/metodos/maestria) | Práctica | alta | 120 | 73 | 49 | 29 | 19 |
| [Pre-mortem y post-mortem (contrafactual)](https://criterio.benjacode.com/metodos/premortem) | Criterio | moderada | 65 | 1 | 40 | 19 | 37 |
| [Casos con protagonista](https://criterio.benjacode.com/metodos/casos) | Criterio | práctica profesional | 90 | 8 | 45 | 29 | 37 |
| [Diario de decisiones (ADR) y ciclo de Kolb](https://criterio.benjacode.com/metodos/adr) | Criterio | moderada | 65 | 18 | 46 | 13 | 40 |
| [Enseñar: pato de goma y diálogo socrático](https://criterio.benjacode.com/metodos/ensenar) | Con otros | moderada | 90 | 33 | 49 | 15 | 22 |
| [Programación en pareja](https://criterio.benjacode.com/metodos/pareja) | Con otros | moderada | 150 | 30 | 55 | 34 | 39 |

## Memoria

### Releer y subrayar

Leer la documentación y volver a leerla hasta que se sienta familiar. Está aquí como punto de comparación: es cómodo, rápido y da sensación de dominio, pero esa sensación no se convierte en recuerdo ni en criterio.

- **Evidencia:** baja. Dunlosky et al. (2013), Improving Students' Learning With Effective Learning Techniques
- **Para quién:** Nadie como método principal; útil solo para una primera lectura.
- **Ejemplo en la web:** Value Object
- **Cuándo no:** Cuando quieres recordar o aplicar algo dentro de una semana.
- **Señal de que funciona:** Si al cerrar el libro no puedes explicar el concepto, la familiaridad te engañó.

Plan en el tiempo:

- `t=0` Explicación: Lees el capítulo de Value Objects de la documentación
- `t=+1` Relectura: Relees el capítulo y subrayas
- `t=+2` Relectura: Relees lo subrayado
- `t=+3` Relectura: Relees el resumen antes de usarlo

Esta semana:

- Lee una vez el tema completo, sin subrayar.
- Cierra el texto y pasa a cualquier otra metodología de esta lista.
- Si vuelves al texto, que sea para verificar una respuesta, no para releer.

### Práctica de recuperación

Después de estudiar, cierras todo e intentas responder de memoria: ¿por qué un Value Object es inmutable?, ¿qué protege un agregado? El esfuerzo de recordar es lo que fortalece el recuerdo, incluso cuando fallas.

- **Evidencia:** alta. Roediger y Karpicke (2006), Test-Enhanced Learning; Dunlosky et al. (2013)
- **Para quién:** Todos los niveles. Especialmente al aprender vocabulario nuevo (DDD tiene mucho).
- **Ejemplo en la web:** Value Object
- **Cuándo no:** Cuando todavía no entendiste el concepto: primero compréndelo, luego recupéralo.
- **Señal de que funciona:** Respondes sin mirar y cada vez dudas menos.

Plan en el tiempo:

- `t=0` Explicación: Lees o escuchas la explicación del concepto
- `t=+1` Recuperación: Respondes tres preguntas sobre Value Objects sin mirar
- `t=+2` Recuperación: Vuelves a responderlas, ahora en otro orden
- `t=+3` Recuperación: Escribes de memoria un Value Object Monto con sus pruebas

Esta semana:

- Al terminar cada tema escribe 3 preguntas de por qué, no de qué.
- Al día siguiente respóndelas sin mirar, en papel o en voz alta.
- Solo después compara con la fuente y marca lo que fallaste.
- Lo que fallaste vuelve a la lista del día siguiente.

### Repetición espaciada

Las mismas recuperaciones rinden más si se separan en el tiempo. Repasas justo cuando empiezas a olvidar; cada repaso exitoso alarga el intervalo siguiente. Un sistema de cajas (Leitner) lo organiza sin calendario complicado.

- **Evidencia:** alta. Cepeda et al. (2006), Distributed Practice in Verbal Recall Tasks; Leitner (1972)
- **Para quién:** Todos. Imprescindible para conceptos que usarás durante meses.
- **Ejemplo en la web:** Vocabulario de DDD
- **Cuándo no:** Para habilidades que solo se aprenden haciendo (diseñar un agregado): combínala con práctica.
- **Señal de que funciona:** Las tarjetas viejas se mudan a las cajas altas y casi no vuelven a la 1.

Plan en el tiempo:

- `t=0` Explicación: Lees o escuchas la explicación del concepto
- `t=+1` Recuperación: Caja 1: repasas las tarjetas nuevas
- `t=+3` Recuperación: Caja 2: las que acertaste suben de caja
- `t=+7` Recuperación: Caja 3: repaso semanal
- `t=+14` Recuperación: Caja 4: repaso quincenal
- `t=+28` Recuperación: Caja 5: repaso mensual

Esta semana:

- Crea tarjetas con una pregunta de porqué en el frente y la respuesta atrás.
- Usa cinco cajas: 1 diaria, 2 cada 3 días, 3 semanal, 4 quincenal, 5 mensual.
- Acierto: la tarjeta sube una caja. Fallo: vuelve a la caja 1.
- Dedica 10 minutos al día, no más.

## Comprensión

### Fracaso productivo

Antes de ver cómo se diseña un Value Object, intentas resolver el problema con lo que sabes: sumar montos en distintas monedas. Tus intentos fallan, pero descubres qué hace difícil al problema. Cuando llega la explicación, encaja en esos huecos.

- **Evidencia:** moderada. Kapur (2008), Productive Failure; Sinha y Kapur (2021), metaanálisis en Review of Educational Research
- **Para quién:** Intermedio. Con algo de base para poder intentar.
- **Ejemplo en la web:** Dinero en distintas monedas
- **Cuándo no:** Si no tienes nada de base: el intento será frustración sin aprendizaje.
- **Señal de que funciona:** Al ver la solución piensas: así que eso era lo que me faltaba.

Plan en el tiempo:

- `t=-2` Intento sin instrucción: Intentas modelar dinero con lo que conoces: float, dict, tupla
- `t=-1` Intento sin instrucción: Escribes pruebas que rompen tus propios intentos
- `t=0` Explicación: Ves la solución con Value Object comparada con tus intentos
- `t=+2` Aplicación: Aplicas la idea a otro concepto: Email, Rango de fechas
- `t=+7` Recuperación: Explicas de memoria por qué fallaron tus intentos

Esta semana:

- Antes de leer sobre un patrón, dedica 20 minutos a resolver el problema que resuelve.
- Anota dónde te trabaste: esa es tu pregunta para la explicación.
- Al leer la solución, compárala línea a línea con tu intento.

### Ejemplos resueltos que se desvanecen

Primero estudias un ciclo TDD completo escrito por alguien. En el segundo ejemplo falta una línea; en el tercero, la mitad. La ayuda se retira poco a poco hasta que escribes solo. Reduce la carga cognitiva cuando todo es nuevo.

- **Evidencia:** alta. Sweller y Cooper (1985); Renkl y Atkinson (2003), Structuring the Transition From Example Study to Problem Solving
- **Para quién:** Principiantes. En expertos pierde efecto (efecto de inversión de la experiencia).
- **Ejemplo en la web:** Ciclo TDD de Email
- **Cuándo no:** Si ya dominas el tema: los ejemplos te sobran y te frenan.
- **Señal de que funciona:** Cada vez necesitas mirar el ejemplo menos veces.

Plan en el tiempo:

- `t=0` Ejemplo resuelto: Estudias un ciclo rojo, verde, refactor completo
- `t=+1` Aplicación: Completas un segundo ejemplo con una línea faltante
- `t=+3` Aplicación: Completas un tercero con la mitad faltante
- `t=+7` Recuperación: Escribes el ciclo completo sin ayuda

Esta semana:

- Busca un ejemplo completo y bien escrito del tema (un repositorio de referencia).
- Cópialo a mano entendiendo cada línea; no copies y pegues.
- Borra el cuerpo de una función y reescríbelo. Luego borra más.

### PRIMM: predecir, ejecutar, investigar, modificar, crear

Diseñado para enseñar programación. Predices la salida de un fragmento, lo ejecutas, investigas por qué hizo lo que hizo, lo modificas y finalmente creas el tuyo. La predicción en t<0 convierte la ejecución en un experimento.

- **Evidencia:** moderada. Sentance, Waite y Kallia (2019), Teaching Computer Programming With PRIMM
- **Para quién:** Principiante e intermedio. Ideal para trampas del lenguaje.
- **Ejemplo en la web:** Argumentos mutables por defecto
- **Cuándo no:** Para conceptos de diseño sin salida observable (por qué un agregado).
- **Señal de que funciona:** Tus predicciones fallan menos y, cuando fallan, sabes por qué.

Plan en el tiempo:

- `t=-1` Predicción: Predices qué imprime una función con lista por defecto
- `t=0` Explicación: Ejecutas y ves la salida real
- `t=+1` Autoexplicación: Investigas: ¿cuándo se evalúa el valor por defecto?
- `t=+2` Aplicación: Modificas la función para que sea correcta
- `t=+5` Aplicación: Creas un Value Object que evite el mismo error

Esta semana:

- Antes de ejecutar cualquier fragmento nuevo, escribe en un comentario qué esperas.
- Si te equivocaste, no sigas hasta poder explicar por qué.
- Cierra con una modificación propia del fragmento.

### Técnica Feynman (autoexplicación)

Escribes una explicación de qué es un agregado como si fuera para alguien que empieza. Cada vez que necesitas un término técnico sin poder reemplazarlo, encontraste un hueco. Vuelves a la fuente solo para ese hueco y reescribes.

- **Evidencia:** moderada. Chi et al. (1994), Eliciting Self-Explanations; Dunlosky et al. (2013)
- **Para quién:** Todos. Especialmente útil para conceptos abstractos de DDD.
- **Ejemplo en la web:** Agregado
- **Cuándo no:** Para memorizar datos sueltos (nombres de métodos): ahí rinde más la recuperación.
- **Señal de que funciona:** Tu explicación usa menos jerga y más ejemplos con cada versión.

Plan en el tiempo:

- `t=0` Explicación: Lees o escuchas la explicación del concepto
- `t=+1` Autoexplicación: Escribes la explicación en 5 líneas sin jerga
- `t=+3` Autoexplicación: La reescribes con un ejemplo propio
- `t=+7` Enseñar: Se la explicas a otra persona y anotas sus preguntas

Esta semana:

- Elige un concepto y escribe qué es y por qué existe en máximo cinco líneas.
- Subraya cada palabra técnica: ¿podrías reemplazarla?
- Agrega un ejemplo que no venga del libro.

## Práctica

### Práctica intercalada

Practicar diez ejercicios de Value Object seguidos te enseña a hacer Value Objects, no a reconocer cuándo usarlos. Si mezclas escenarios de Value Object, Entidad, Agregado y Repositorio, aprendes a elegir. Se siente más lento, rinde más.

- **Evidencia:** moderada. Rohrer y Taylor (2007), The Shuffling of Mathematics Problems Improves Learning; Dunlosky et al. (2013)
- **Para quién:** Intermedio. Cuando ya conoces varios patrones y los confundes.
- **Ejemplo en la web:** Bloques de construcción de DDD
- **Cuándo no:** Al principio de un tema: primero un poco de práctica en bloque.
- **Señal de que funciona:** Reconoces el patrón antes de empezar a escribir código.

Plan en el tiempo:

- `t=0` Explicación: Estudias los bloques de construcción de DDD
- `t=+2` Práctica intercalada: Clasificas 8 escenarios mezclados
- `t=+5` Práctica intercalada: Clasificas 8 escenarios nuevos, mezclados
- `t=+9` Práctica intercalada: Diseñas 3 escenarios que confundan a otros
- `t=+14` Práctica intercalada: Ronda final mezclada con tiempo

Esta semana:

- Arma una lista de escenarios de varios temas y desordénala.
- Para cada uno, primero nombra el patrón y por qué, después resuelve.
- Anota qué pares confundes (Entidad o Value Object) y practica esos.

### Ejemplos con errores (caza del bug)

Un agregado que expone una lista mutable, un Value Object con setter, una prueba que verifica la implementación en vez del comportamiento. Encontrar el error y explicar por qué es un error enseña los límites de la regla mejor que verla bien aplicada.

- **Evidencia:** moderada. Große y Renkl (2007), Finding and Fixing Errors in Worked Examples; McLaren et al. (2016)
- **Para quién:** Intermedio y avanzado. Los principiantes necesitan antes ejemplos correctos.
- **Ejemplo en la web:** Agregado con invariantes
- **Cuándo no:** Si todavía no viste el patrón correcto: confunde más de lo que enseña.
- **Señal de que funciona:** En las revisiones de código detectas problemas antes de ejecutar.

Plan en el tiempo:

- `t=0` Explicación: Lees o escuchas la explicación del concepto
- `t=+1` Análisis de errores: Encuentras el error en un agregado que se deja romper
- `t=+4` Análisis de errores: Encuentras el error en una prueba frágil
- `t=+10` Recuperación: Enumeras de memoria los errores típicos

Esta semana:

- En cada revisión de código, busca una violación de invariante y nómbrala.
- Guarda los errores reales que encuentres como ejercicios.
- Para cada error escribe la prueba que lo habría detectado.

### Problemas de Parsons

Recibes las líneas correctas de un ciclo TDD pero desordenadas. Ordenarlas te obliga a pensar en la estructura (qué va primero, la prueba o la clase) sin el costo de escribir todo. Rinden igual que escribir desde cero en menos tiempo.

- **Evidencia:** moderada. Parsons y Haden (2006); Ericson, Margulieux y Rick (2017), Solving Parsons Problems Versus Fixing and Writing Code
- **Para quién:** Principiante. Excelente para la estructura de un ciclo TDD.
- **Ejemplo en la web:** Estructura de un ciclo TDD
- **Cuándo no:** Para diseño abierto: aquí la solución ya está dada.
- **Señal de que funciona:** Ordenas rápido y descartas las líneas distractoras sin dudar.

Plan en el tiempo:

- `t=0` Ejemplo resuelto: Ves un ciclo TDD ordenado
- `t=+1` Ordenar código: Ordenas las líneas de un Value Object y su prueba
- `t=+3` Ordenar código: Ordenas con líneas distractoras incluidas
- `t=+7` Aplicación: Escribes el mismo ciclo desde cero

Esta semana:

- Toma una función que entiendas y desordena sus líneas para otro día.
- Agrega una o dos líneas incorrectas como distractoras.
- Ordénala sin ejecutar; luego verifica con las pruebas.

### Aprender con TDD (cada prueba es una hipótesis)

TDD también es un método de aprendizaje: la prueba es tu hipótesis sobre el comportamiento (t<0), el código es el experimento (t=0) y el resultado verde o rojo es la evidencia (t>0). Sirve para aprender una librería nueva escribiendo pruebas de aprendizaje sobre ella.

- **Evidencia:** práctica profesional. Beck (2002), Test-Driven Development: By Example. Los estudios sobre productividad son mixtos (Fucci et al., 2017).
- **Para quién:** Todos los niveles con algo de Python.
- **Ejemplo en la web:** Regla de descuento
- **Cuándo no:** Para explorar algo que no sabes ni qué hace: primero un prototipo descartable.
- **Señal de que funciona:** Tus pruebas fallan cuando esperas y pasan cuando esperas.

Plan en el tiempo:

- `t=-1` Predicción: Escribes la prueba de cómo crees que se comporta un descuento
- `t=0` Explicación: Escribes el código mínimo y ves el rojo pasar a verde
- `t=+1` Aplicación: Siguiente regla: nueva prueba roja, luego verde
- `t=+3` Aplicación: Refactorizas con las pruebas como red
- `t=+6` Análisis de errores: Analizas una prueba que falló cuando no esperabas
- `t=+12` Reflexión escrita: Revisas qué pruebas te enseñaron algo

Esta semana:

- Para aprender una librería, escribe pruebas que afirmen lo que crees que hace.
- Cuando una prueba falle sin que lo esperes, detente: ahí está el aprendizaje.
- Ciclos cortos: rojo, verde, refactor en menos de 10 minutos.

### Kata y práctica deliberada

Como en artes marciales: el mismo ejercicio (un carrito de compras con TDD) repetido muchas veces, cada vez con una restricción nueva (sin if, sin mirar, en 15 minutos). Mides tiempo y errores para saber si mejoras.

- **Evidencia:** moderada. Ericsson, Krampe y Tesch-Römer (1993); con matices en Macnamara, Hambrick y Oswald (2014)
- **Para quién:** Intermedio y avanzado. Para automatizar lo que ya entiendes.
- **Ejemplo en la web:** Carrito con descuentos
- **Cuándo no:** Para conceptos que aún no entiendes: repetir sin entender automatiza errores.
- **Señal de que funciona:** Baja el tiempo y los errores, y sube la calidad del diseño.

Plan en el tiempo:

- `t=0` Explicación: Lees el enunciado de la kata
- `t=+1` Práctica deliberada: Primera vez, sin tiempo
- `t=+2` Práctica deliberada: Segunda vez, con restricción: sin mirar
- `t=+4` Práctica deliberada: Tercera vez, en 15 minutos
- `t=+8` Práctica deliberada: Cuarta vez, otro diseño
- `t=+16` Práctica deliberada: Quinta vez, enseñándola

Esta semana:

- Elige una kata de 20 minutos (por ejemplo, un carrito con descuentos).
- Hazla tres veces esta semana, cada una con una restricción distinta.
- Anota tiempo, pruebas escritas y errores; compara.

### Aprendizaje para el dominio (mastery learning)

El temario se divide en niveles: Value Object, Entidad, Agregado, Repositorio. Al final de cada uno hay una evaluación corta; si no llegas al 80%, recibes práctica correctiva y repites. Nadie construye sobre una base con huecos.

- **Evidencia:** alta. Bloom (1984), The 2 Sigma Problem; Kulik, Kulik y Bangert-Drowns (1990), metaanálisis
- **Para quién:** Principiante e intermedio. Temas que se construyen unos sobre otros (DDD lo es).
- **Ejemplo en la web:** Niveles de DDD
- **Cuándo no:** Cuando el tiempo es fijo e inamovible: puede no alcanzar para todos los niveles.
- **Señal de que funciona:** Los niveles avanzados se sienten fáciles porque la base no tiene huecos.

Plan en el tiempo:

- `t=0` Explicación: Estudias el nivel 1: Value Object
- `t=+1` Recuperación: Evaluación corta del nivel 1
- `t=+2` Aplicación: Práctica correctiva de lo que fallaste
- `t=+3` Recuperación: Repites la evaluación hasta el 80%
- `t=+7` Recuperación: Repaso del nivel 1 al pasar al 3
- `t=+14` Aplicación: Proyecto que usa todos los niveles

Esta semana:

- Ordena el tema en niveles que dependan uno del otro.
- Define antes la evaluación de cada nivel (cinco preguntas o una kata).
- No pases al siguiente nivel sin 4 de 5.

## Criterio

### Interrogación elaborativa (los cinco porqués)

Usamos un Repositorio. ¿Por qué? Para no depender de la base de datos. ¿Por qué importa? Para probar las reglas sin infraestructura. ¿Por qué? ... La cadena termina cuando llegas a algo que el negocio valora. Así una receta se vuelve criterio.

- **Evidencia:** moderada. Pressley et al. (1987), Elaborative Interrogation; Dunlosky et al. (2013)
- **Para quién:** Intermedio. Necesitas conocer el patrón para interrogarlo.
- **Ejemplo en la web:** Repositorio
- **Cuándo no:** Si no conoces el tema: los porqués se responden con suposiciones.
- **Señal de que funciona:** Puedes defender una decisión ante quien propone otra.

Plan en el tiempo:

- `t=-1` Pregunta previa: Te preguntas para qué existe un Repositorio
- `t=0` Explicación: Lees o escuchas la explicación del concepto
- `t=+1` Autoexplicación: Construyes la cadena de cinco porqués
- `t=+4` Reflexión escrita: Comparas tu cadena con la de un compañero
- `t=+8` Contrafactual: Preguntas: ¿y si no lo usáramos?

Esta semana:

- Toma una decisión del código que lees cada día y pregunta por qué cinco veces.
- Detente cuando llegues a costo, riesgo, tiempo o cliente.
- Si no llegas, la decisión podría ser costumbre: anótala.

### Pre-mortem y post-mortem (contrafactual)

En t<0 te dices: es t=+5 y la decisión fue un desastre, ¿por qué? En t>0 recorres el camino elegido y los que no elegiste, comparando consecuencias. Es la metodología más directa para la pregunta: por qué así y no de otra forma.

- **Evidencia:** moderada. Mitchell, Russo y Pennington (1989), Back to the Future; Klein (2007), Performing a Project Premortem
- **Para quién:** Intermedio y avanzado. Decisiones de diseño con alternativas reales.
- **Ejemplo en la web:** Dinero: float, dict o Value Object
- **Cuándo no:** Decisiones triviales y reversibles: el costo del análisis supera al del error.
- **Señal de que funciona:** Anticipas consecuencias que antes te sorprendían.

Plan en el tiempo:

- `t=-1` Pre-mortem: Imaginas que la decisión fracasó y escribes por qué
- `t=0` Explicación: Decides y anotas la justificación
- `t=+3` Contrafactual: Recorres las consecuencias de cada alternativa
- `t=+10` Reflexión escrita: Comparas tu pre-mortem con lo que pasó

Esta semana:

- Antes de tu próxima decisión técnica escribe tres razones por las que podría fallar.
- Decide y guarda esas razones con la fecha.
- En dos semanas, revisa: ¿qué anticipaste y qué no?

### Casos con protagonista

Ana entra a un equipo con un sistema de facturación frágil. En cada capítulo hay una decisión: probar o no, extraer un agregado o no. Eliges y ves el capítulo siguiente con las consecuencias. La historia da contexto que un ejercicio aislado no tiene.

- **Evidencia:** práctica profesional. Kolodner (1993), Case-Based Reasoning; método del caso de Harvard. Evidencia variable según diseño.
- **Para quién:** Todos. Especialmente quienes aprenden mejor con historias.
- **Ejemplo en la web:** El sistema de facturación de Ana
- **Cuándo no:** Cuando necesitas la técnica concreta: el caso da contexto, no práctica.
- **Señal de que funciona:** Reconoces en tu trabajo situaciones de los casos que estudiaste.

Plan en el tiempo:

- `t=-1` Pregunta previa: Lees el contexto del caso y anticipas los problemas
- `t=0` Explicación: Primer capítulo: la decisión principal
- `t=+2` Contrafactual: Ves qué habría pasado con la otra elección
- `t=+5` Aplicación: Aplicas la lección a tu propio proyecto
- `t=+12` Reflexión escrita: Escribes qué harías distinto que la protagonista

Esta semana:

- Elige un incidente real de tu equipo (o de un post-mortem público).
- Reconstruye la línea de tiempo: qué se sabía en t<0, qué se decidió en t=0.
- Escribe qué decisión alternativa habría cambiado el resultado.

### Diario de decisiones (ADR) y ciclo de Kolb

Un Architecture Decision Record es la línea de tiempo escrita: contexto y fuerzas (t<0), decisión (t=0), consecuencias esperadas (t>0). Volver a leerlo semanas después y anotar lo que realmente pasó cierra el ciclo de Kolb: experiencia, reflexión, concepto, nueva prueba.

- **Evidencia:** moderada. Kolb (1984), Experiential Learning; Di Stefano et al. (2014), Making Experience Count; Nygard (2011), ADR
- **Para quién:** Intermedio y avanzado. Ideal si ya trabajas en un equipo.
- **Ejemplo en la web:** ADR de un Repositorio
- **Cuándo no:** Si nunca vas a releerlo: sin la revisión en t>0, es solo burocracia.
- **Señal de que funciona:** Tus ADR nuevos anticipan consecuencias que los viejos no veían.

Plan en el tiempo:

- `t=-1` Pregunta previa: Describes el contexto y las fuerzas
- `t=0` Explicación: Registras la decisión y la alternativa descartada
- `t=+1` Reflexión escrita: Escribes qué consecuencias esperas
- `t=+7` Reflexión escrita: Primera revisión: qué pasó realmente
- `t=+21` Reflexión escrita: Segunda revisión: ¿la volverías a tomar?

Esta semana:

- Crea una carpeta docs/decisiones en tu proyecto.
- Escribe un ADR por cada decisión que discutiste más de 10 minutos.
- Agenda una revisión de cada ADR a la semana y al mes.

## Con otros

### Enseñar: pato de goma y diálogo socrático

Explicar a un pato de goma qué hace cada línea revela supuestos que no sabías que tenías. El diálogo socrático lo lleva más lejos: alguien que no da respuestas, solo pregunta qué pasaría si. Prepararse para enseñar ya mejora el aprendizaje.

- **Evidencia:** moderada. Fiorella y Mayer (2013), The Relative Benefits of Learning by Teaching; Hunt y Thomas (1999), The Pragmatic Programmer
- **Para quién:** Todos.
- **Ejemplo en la web:** Agregado Pedido
- **Cuándo no:** Para memorizar detalles: enseñar organiza, no reemplaza a la recuperación.
- **Señal de que funciona:** Encuentras el error a mitad de la explicación, antes de que te respondan.

Plan en el tiempo:

- `t=0` Explicación: Lees o escuchas la explicación del concepto
- `t=+1` Enseñar: Explicas tu agregado al pato, línea por línea
- `t=+4` Enseñar: Respondes las preguntas socráticas de un compañero
- `t=+10` Recuperación: Explicas de memoria, sin código delante

Esta semana:

- Antes de pedir ayuda, explica el problema en voz alta a un objeto.
- Prepara una explicación de 5 minutos de un concepto para tu equipo.
- Pide que te interrumpan solo con preguntas de qué pasaría si.

### Programación en pareja

Quien conduce escribe la prueba y el código; quien navega piensa en el diseño, detecta errores y pregunta por qué. Cambiar de rol cada 15 minutos obliga a explicar decisiones en voz alta, todo el tiempo.

- **Evidencia:** moderada. McDowell et al. (2006); Hannay et al. (2009), The Effectiveness of Pair Programming: A Meta-Analysis
- **Para quién:** Todos. Mejor entre niveles cercanos o con rol explícito de mentor.
- **Ejemplo en la web:** Regla de descuento en pareja
- **Cuándo no:** Tareas mecánicas y conocidas: dos personas hacen el trabajo de una.
- **Señal de que funciona:** Discuten diseño antes de escribir y las pruebas salen mejores.

Plan en el tiempo:

- `t=0` Explicación: Leen juntos el problema
- `t=+1` Aplicación: Tú conduces: escribes la prueba roja
- `t=+1` Enseñar: Explicas en voz alta por qué esa prueba primero
- `t=+3` Aplicación: Navegas: tu pareja implementa y tú preguntas
- `t=+3` Enseñar: Justificas cada sugerencia de diseño
- `t=+8` Reflexión escrita: Retrospectiva de 10 minutos: qué aprendió cada uno

Esta semana:

- Busca a alguien para una sesión de 50 minutos con un temporizador.
- Turnos de 15 minutos: conducir y navegar.
- Al final, cada uno dice una cosa que aprendió del otro.

