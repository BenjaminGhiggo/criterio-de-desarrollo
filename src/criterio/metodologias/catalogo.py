"""Catálogo de metodologías de aprendizaje aplicadas a Python, DDD y TDD.

Cada metodología es un plan en el tiempo: qué haces antes de encontrar el
concepto (t<0), cómo lo encuentras (t=0) y qué haces después (t>0). Al
vivir el plan sobre un Conocimiento se obtiene su trayectoria.
"""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from enum import Enum

from criterio.metodologias.conocimiento import EFECTOS, Actividad, Conocimiento
from criterio.tiempo import ErrorDeDominio, Fase


class Evidencia(Enum):
    ALTA = "alta"
    MODERADA = "moderada"
    PRACTICA = "práctica profesional"
    BAJA = "baja"

    @property
    def descripcion(self) -> str:
        return {
            Evidencia.ALTA: "Muchos estudios controlados y metaanálisis coinciden.",
            Evidencia.MODERADA: "Estudios controlados con resultados favorables, con matices según contexto.",
            Evidencia.PRACTICA: "Muy usada en la industria; poca investigación controlada.",
            Evidencia.BAJA: "La investigación muestra poco beneficio frente a alternativas.",
        }[self]


class Familia(Enum):
    MEMORIA = "Memoria"
    COMPRENSION = "Comprensión"
    PRACTICA = "Práctica"
    CRITERIO = "Criterio"
    SOCIAL = "Con otros"


@dataclass(frozen=True)
class Paso:
    t: int
    actividad: Actividad
    que_haces: str


@dataclass(frozen=True)
class Metodologia:
    id: str
    nombre: str
    familia: Familia
    resumen: str
    idea: str
    evidencia: Evidencia
    fuente: str
    para_quien: str
    plan: tuple[Paso, ...]
    esta_semana: tuple[str, ...]
    cuando_no: str
    senal: str
    ejemplo: str

    def vivir(self, concepto: str | None = None) -> Conocimiento:
        conocimiento = Conocimiento(concepto or self.ejemplo)
        for paso in sorted(self.plan, key=lambda p: p.t):
            conocimiento.realizar(paso.t, paso.actividad)
        return conocimiento

    def pasos_en(self, fase: Fase) -> tuple[Paso, ...]:
        return tuple(p for p in self.plan if _fase_de(p.t) is fase)

    @property
    def minutos(self) -> int:
        return sum(EFECTOS[p.actividad].minutos for p in self.plan)


def _fase_de(t: int) -> Fase:
    return Fase.ANTES if t < 0 else Fase.DECISION if t == 0 else Fase.DESPUES


A = Actividad
P = Paso
EXPLICA = "Lees o escuchas la explicación del concepto"

METODOLOGIAS: tuple[Metodologia, ...] = (
    Metodologia(
        id="relectura",
        nombre="Releer y subrayar",
        familia=Familia.MEMORIA,
        resumen="El método de control: lo que casi todos hacemos por defecto.",
        idea=(
            "Leer la documentación y volver a leerla hasta que se sienta familiar. Está aquí como "
            "punto de comparación: es cómodo, rápido y da sensación de dominio, pero esa sensación "
            "no se convierte en recuerdo ni en criterio."
        ),
        evidencia=Evidencia.BAJA,
        fuente="Dunlosky et al. (2013), Improving Students' Learning With Effective Learning Techniques",
        para_quien="Nadie como método principal; útil solo para una primera lectura.",
        plan=(
            P(0, A.EXPLICACION, "Lees el capítulo de Value Objects de la documentación"),
            P(1, A.RELECTURA, "Relees el capítulo y subrayas"),
            P(2, A.RELECTURA, "Relees lo subrayado"),
            P(3, A.RELECTURA, "Relees el resumen antes de usarlo"),
        ),
        esta_semana=(
            "Lee una vez el tema completo, sin subrayar.",
            "Cierra el texto y pasa a cualquier otra metodología de esta lista.",
            "Si vuelves al texto, que sea para verificar una respuesta, no para releer.",
        ),
        cuando_no="Cuando quieres recordar o aplicar algo dentro de una semana.",
        senal="Si al cerrar el libro no puedes explicar el concepto, la familiaridad te engañó.",
        ejemplo="Value Object",
    ),
    Metodologia(
        id="recuperacion",
        nombre="Práctica de recuperación",
        familia=Familia.MEMORIA,
        resumen="Ponerte a prueba sin mirar, en vez de volver a leer.",
        idea=(
            "Después de estudiar, cierras todo e intentas responder de memoria: ¿por qué un Value "
            "Object es inmutable?, ¿qué protege un agregado? El esfuerzo de recordar es lo que "
            "fortalece el recuerdo, incluso cuando fallas."
        ),
        evidencia=Evidencia.ALTA,
        fuente="Roediger y Karpicke (2006), Test-Enhanced Learning; Dunlosky et al. (2013)",
        para_quien="Todos los niveles. Especialmente al aprender vocabulario nuevo (DDD tiene mucho).",
        plan=(
            P(0, A.EXPLICACION, EXPLICA),
            P(1, A.RECUPERACION, "Respondes tres preguntas sobre Value Objects sin mirar"),
            P(2, A.RECUPERACION, "Vuelves a responderlas, ahora en otro orden"),
            P(3, A.RECUPERACION, "Escribes de memoria un Value Object Monto con sus pruebas"),
        ),
        esta_semana=(
            "Al terminar cada tema escribe 3 preguntas de por qué, no de qué.",
            "Al día siguiente respóndelas sin mirar, en papel o en voz alta.",
            "Solo después compara con la fuente y marca lo que fallaste.",
            "Lo que fallaste vuelve a la lista del día siguiente.",
        ),
        cuando_no="Cuando todavía no entendiste el concepto: primero compréndelo, luego recupéralo.",
        senal="Respondes sin mirar y cada vez dudas menos.",
        ejemplo="Value Object",
    ),
    Metodologia(
        id="espaciada",
        nombre="Repetición espaciada",
        familia=Familia.MEMORIA,
        resumen="Recuperar en intervalos crecientes: 1, 3, 7, 14 y 28 días.",
        idea=(
            "Las mismas recuperaciones rinden más si se separan en el tiempo. Repasas justo cuando "
            "empiezas a olvidar; cada repaso exitoso alarga el intervalo siguiente. Un sistema de "
            "cajas (Leitner) lo organiza sin calendario complicado."
        ),
        evidencia=Evidencia.ALTA,
        fuente="Cepeda et al. (2006), Distributed Practice in Verbal Recall Tasks; Leitner (1972)",
        para_quien="Todos. Imprescindible para conceptos que usarás durante meses.",
        plan=(
            P(0, A.EXPLICACION, EXPLICA),
            P(1, A.RECUPERACION, "Caja 1: repasas las tarjetas nuevas"),
            P(3, A.RECUPERACION, "Caja 2: las que acertaste suben de caja"),
            P(7, A.RECUPERACION, "Caja 3: repaso semanal"),
            P(14, A.RECUPERACION, "Caja 4: repaso quincenal"),
            P(28, A.RECUPERACION, "Caja 5: repaso mensual"),
        ),
        esta_semana=(
            "Crea tarjetas con una pregunta de porqué en el frente y la respuesta atrás.",
            "Usa cinco cajas: 1 diaria, 2 cada 3 días, 3 semanal, 4 quincenal, 5 mensual.",
            "Acierto: la tarjeta sube una caja. Fallo: vuelve a la caja 1.",
            "Dedica 10 minutos al día, no más.",
        ),
        cuando_no="Para habilidades que solo se aprenden haciendo (diseñar un agregado): combínala con práctica.",
        senal="Las tarjetas viejas se mudan a las cajas altas y casi no vuelven a la 1.",
        ejemplo="Vocabulario de DDD",
    ),
    Metodologia(
        id="fracaso-productivo",
        nombre="Fracaso productivo",
        familia=Familia.COMPRENSION,
        resumen="Intentar resolver antes de que te enseñen. Fallar primero, entender después.",
        idea=(
            "Antes de ver cómo se diseña un Value Object, intentas resolver el problema con lo que "
            "sabes: sumar montos en distintas monedas. Tus intentos fallan, pero descubres qué hace "
            "difícil al problema. Cuando llega la explicación, encaja en esos huecos."
        ),
        evidencia=Evidencia.MODERADA,
        fuente="Kapur (2008), Productive Failure; Sinha y Kapur (2021), metaanálisis en Review of Educational Research",
        para_quien="Intermedio. Con algo de base para poder intentar.",
        plan=(
            P(-2, A.INTENTO, "Intentas modelar dinero con lo que conoces: float, dict, tupla"),
            P(-1, A.INTENTO, "Escribes pruebas que rompen tus propios intentos"),
            P(0, A.EXPLICACION, "Ves la solución con Value Object comparada con tus intentos"),
            P(2, A.APLICACION, "Aplicas la idea a otro concepto: Email, Rango de fechas"),
            P(7, A.RECUPERACION, "Explicas de memoria por qué fallaron tus intentos"),
        ),
        esta_semana=(
            "Antes de leer sobre un patrón, dedica 20 minutos a resolver el problema que resuelve.",
            "Anota dónde te trabaste: esa es tu pregunta para la explicación.",
            "Al leer la solución, compárala línea a línea con tu intento.",
        ),
        cuando_no="Si no tienes nada de base: el intento será frustración sin aprendizaje.",
        senal="Al ver la solución piensas: así que eso era lo que me faltaba.",
        ejemplo="Dinero en distintas monedas",
    ),
    Metodologia(
        id="ejemplos-resueltos",
        nombre="Ejemplos resueltos que se desvanecen",
        familia=Familia.COMPRENSION,
        resumen="Ver la solución completa, luego completar huecos cada vez más grandes.",
        idea=(
            "Primero estudias un ciclo TDD completo escrito por alguien. En el segundo ejemplo falta "
            "una línea; en el tercero, la mitad. La ayuda se retira poco a poco hasta que escribes "
            "solo. Reduce la carga cognitiva cuando todo es nuevo."
        ),
        evidencia=Evidencia.ALTA,
        fuente="Sweller y Cooper (1985); Renkl y Atkinson (2003), Structuring the Transition From Example Study to Problem Solving",
        para_quien="Principiantes. En expertos pierde efecto (efecto de inversión de la experiencia).",
        plan=(
            P(0, A.EJEMPLO_RESUELTO, "Estudias un ciclo rojo, verde, refactor completo"),
            P(1, A.APLICACION, "Completas un segundo ejemplo con una línea faltante"),
            P(3, A.APLICACION, "Completas un tercero con la mitad faltante"),
            P(7, A.RECUPERACION, "Escribes el ciclo completo sin ayuda"),
        ),
        esta_semana=(
            "Busca un ejemplo completo y bien escrito del tema (un repositorio de referencia).",
            "Cópialo a mano entendiendo cada línea; no copies y pegues.",
            "Borra el cuerpo de una función y reescríbelo. Luego borra más.",
        ),
        cuando_no="Si ya dominas el tema: los ejemplos te sobran y te frenan.",
        senal="Cada vez necesitas mirar el ejemplo menos veces.",
        ejemplo="Ciclo TDD de Email",
    ),
    Metodologia(
        id="primm",
        nombre="PRIMM: predecir, ejecutar, investigar, modificar, crear",
        familia=Familia.COMPRENSION,
        resumen="Lees código y predices qué hará antes de ejecutarlo.",
        idea=(
            "Diseñado para enseñar programación. Predices la salida de un fragmento, lo ejecutas, "
            "investigas por qué hizo lo que hizo, lo modificas y finalmente creas el tuyo. La "
            "predicción en t<0 convierte la ejecución en un experimento."
        ),
        evidencia=Evidencia.MODERADA,
        fuente="Sentance, Waite y Kallia (2019), Teaching Computer Programming With PRIMM",
        para_quien="Principiante e intermedio. Ideal para trampas del lenguaje.",
        plan=(
            P(-1, A.PREDICCION, "Predices qué imprime una función con lista por defecto"),
            P(0, A.EXPLICACION, "Ejecutas y ves la salida real"),
            P(1, A.AUTOEXPLICACION, "Investigas: ¿cuándo se evalúa el valor por defecto?"),
            P(2, A.APLICACION, "Modificas la función para que sea correcta"),
            P(5, A.APLICACION, "Creas un Value Object que evite el mismo error"),
        ),
        esta_semana=(
            "Antes de ejecutar cualquier fragmento nuevo, escribe en un comentario qué esperas.",
            "Si te equivocaste, no sigas hasta poder explicar por qué.",
            "Cierra con una modificación propia del fragmento.",
        ),
        cuando_no="Para conceptos de diseño sin salida observable (por qué un agregado).",
        senal="Tus predicciones fallan menos y, cuando fallan, sabes por qué.",
        ejemplo="Argumentos mutables por defecto",
    ),
    Metodologia(
        id="feynman",
        nombre="Técnica Feynman (autoexplicación)",
        familia=Familia.COMPRENSION,
        resumen="Explica el concepto con palabras simples. Donde usas jerga, no entendiste.",
        idea=(
            "Escribes una explicación de qué es un agregado como si fuera para alguien que empieza. "
            "Cada vez que necesitas un término técnico sin poder reemplazarlo, encontraste un hueco. "
            "Vuelves a la fuente solo para ese hueco y reescribes."
        ),
        evidencia=Evidencia.MODERADA,
        fuente="Chi et al. (1994), Eliciting Self-Explanations; Dunlosky et al. (2013)",
        para_quien="Todos. Especialmente útil para conceptos abstractos de DDD.",
        plan=(
            P(0, A.EXPLICACION, EXPLICA),
            P(1, A.AUTOEXPLICACION, "Escribes la explicación en 5 líneas sin jerga"),
            P(3, A.AUTOEXPLICACION, "La reescribes con un ejemplo propio"),
            P(7, A.ENSENANZA, "Se la explicas a otra persona y anotas sus preguntas"),
        ),
        esta_semana=(
            "Elige un concepto y escribe qué es y por qué existe en máximo cinco líneas.",
            "Subraya cada palabra técnica: ¿podrías reemplazarla?",
            "Agrega un ejemplo que no venga del libro.",
        ),
        cuando_no="Para memorizar datos sueltos (nombres de métodos): ahí rinde más la recuperación.",
        senal="Tu explicación usa menos jerga y más ejemplos con cada versión.",
        ejemplo="Agregado",
    ),
    Metodologia(
        id="cinco-porques",
        nombre="Interrogación elaborativa (los cinco porqués)",
        familia=Familia.CRITERIO,
        resumen="Ante cada afirmación pregunta por qué, hasta llegar a una fuerza del negocio.",
        idea=(
            "Usamos un Repositorio. ¿Por qué? Para no depender de la base de datos. ¿Por qué importa? "
            "Para probar las reglas sin infraestructura. ¿Por qué? ... La cadena termina cuando "
            "llegas a algo que el negocio valora. Así una receta se vuelve criterio."
        ),
        evidencia=Evidencia.MODERADA,
        fuente="Pressley et al. (1987), Elaborative Interrogation; Dunlosky et al. (2013)",
        para_quien="Intermedio. Necesitas conocer el patrón para interrogarlo.",
        plan=(
            P(-1, A.PREGUNTA_PREVIA, "Te preguntas para qué existe un Repositorio"),
            P(0, A.EXPLICACION, EXPLICA),
            P(1, A.AUTOEXPLICACION, "Construyes la cadena de cinco porqués"),
            P(4, A.REFLEXION, "Comparas tu cadena con la de un compañero"),
            P(8, A.CONTRAFACTUAL, "Preguntas: ¿y si no lo usáramos?"),
        ),
        esta_semana=(
            "Toma una decisión del código que lees cada día y pregunta por qué cinco veces.",
            "Detente cuando llegues a costo, riesgo, tiempo o cliente.",
            "Si no llegas, la decisión podría ser costumbre: anótala.",
        ),
        cuando_no="Si no conoces el tema: los porqués se responden con suposiciones.",
        senal="Puedes defender una decisión ante quien propone otra.",
        ejemplo="Repositorio",
    ),
    Metodologia(
        id="intercalado",
        nombre="Práctica intercalada",
        familia=Familia.PRACTICA,
        resumen="Mezcla problemas de distintos patrones en vez de practicar uno a la vez.",
        idea=(
            "Practicar diez ejercicios de Value Object seguidos te enseña a hacer Value Objects, no a "
            "reconocer cuándo usarlos. Si mezclas escenarios de Value Object, Entidad, Agregado y "
            "Repositorio, aprendes a elegir. Se siente más lento, rinde más."
        ),
        evidencia=Evidencia.MODERADA,
        fuente="Rohrer y Taylor (2007), The Shuffling of Mathematics Problems Improves Learning; Dunlosky et al. (2013)",
        para_quien="Intermedio. Cuando ya conoces varios patrones y los confundes.",
        plan=(
            P(0, A.EXPLICACION, "Estudias los bloques de construcción de DDD"),
            P(2, A.INTERCALADO, "Clasificas 8 escenarios mezclados"),
            P(5, A.INTERCALADO, "Clasificas 8 escenarios nuevos, mezclados"),
            P(9, A.INTERCALADO, "Diseñas 3 escenarios que confundan a otros"),
            P(14, A.INTERCALADO, "Ronda final mezclada con tiempo"),
        ),
        esta_semana=(
            "Arma una lista de escenarios de varios temas y desordénala.",
            "Para cada uno, primero nombra el patrón y por qué, después resuelve.",
            "Anota qué pares confundes (Entidad o Value Object) y practica esos.",
        ),
        cuando_no="Al principio de un tema: primero un poco de práctica en bloque.",
        senal="Reconoces el patrón antes de empezar a escribir código.",
        ejemplo="Bloques de construcción de DDD",
    ),
    Metodologia(
        id="ejemplos-con-errores",
        nombre="Ejemplos con errores (caza del bug)",
        familia=Familia.PRACTICA,
        resumen="Te dan código con un error de diseño; tú lo encuentras y explicas.",
        idea=(
            "Un agregado que expone una lista mutable, un Value Object con setter, una prueba que "
            "verifica la implementación en vez del comportamiento. Encontrar el error y explicar "
            "por qué es un error enseña los límites de la regla mejor que verla bien aplicada."
        ),
        evidencia=Evidencia.MODERADA,
        fuente="Große y Renkl (2007), Finding and Fixing Errors in Worked Examples; McLaren et al. (2016)",
        para_quien="Intermedio y avanzado. Los principiantes necesitan antes ejemplos correctos.",
        plan=(
            P(0, A.EXPLICACION, EXPLICA),
            P(1, A.ERROR_ANALIZADO, "Encuentras el error en un agregado que se deja romper"),
            P(4, A.ERROR_ANALIZADO, "Encuentras el error en una prueba frágil"),
            P(10, A.RECUPERACION, "Enumeras de memoria los errores típicos"),
        ),
        esta_semana=(
            "En cada revisión de código, busca una violación de invariante y nómbrala.",
            "Guarda los errores reales que encuentres como ejercicios.",
            "Para cada error escribe la prueba que lo habría detectado.",
        ),
        cuando_no="Si todavía no viste el patrón correcto: confunde más de lo que enseña.",
        senal="En las revisiones de código detectas problemas antes de ejecutar.",
        ejemplo="Agregado con invariantes",
    ),
    Metodologia(
        id="parsons",
        nombre="Problemas de Parsons",
        familia=Familia.PRACTICA,
        resumen="Ordena líneas de código desordenadas hasta formar la solución.",
        idea=(
            "Recibes las líneas correctas de un ciclo TDD pero desordenadas. Ordenarlas te obliga a "
            "pensar en la estructura (qué va primero, la prueba o la clase) sin el costo de escribir "
            "todo. Rinden igual que escribir desde cero en menos tiempo."
        ),
        evidencia=Evidencia.MODERADA,
        fuente="Parsons y Haden (2006); Ericson, Margulieux y Rick (2017), Solving Parsons Problems Versus Fixing and Writing Code",
        para_quien="Principiante. Excelente para la estructura de un ciclo TDD.",
        plan=(
            P(0, A.EJEMPLO_RESUELTO, "Ves un ciclo TDD ordenado"),
            P(1, A.ORDENAMIENTO, "Ordenas las líneas de un Value Object y su prueba"),
            P(3, A.ORDENAMIENTO, "Ordenas con líneas distractoras incluidas"),
            P(7, A.APLICACION, "Escribes el mismo ciclo desde cero"),
        ),
        esta_semana=(
            "Toma una función que entiendas y desordena sus líneas para otro día.",
            "Agrega una o dos líneas incorrectas como distractoras.",
            "Ordénala sin ejecutar; luego verifica con las pruebas.",
        ),
        cuando_no="Para diseño abierto: aquí la solución ya está dada.",
        senal="Ordenas rápido y descartas las líneas distractoras sin dudar.",
        ejemplo="Estructura de un ciclo TDD",
    ),
    Metodologia(
        id="tdd",
        nombre="Aprender con TDD (cada prueba es una hipótesis)",
        familia=Familia.PRACTICA,
        resumen="Escribe la prueba de lo que crees que hará el código antes de escribirlo.",
        idea=(
            "TDD también es un método de aprendizaje: la prueba es tu hipótesis sobre el "
            "comportamiento (t<0), el código es el experimento (t=0) y el resultado verde o rojo es "
            "la evidencia (t>0). Sirve para aprender una librería nueva escribiendo pruebas de "
            "aprendizaje sobre ella."
        ),
        evidencia=Evidencia.PRACTICA,
        fuente="Beck (2002), Test-Driven Development: By Example. Los estudios sobre productividad son mixtos (Fucci et al., 2017).",
        para_quien="Todos los niveles con algo de Python.",
        plan=(
            P(-1, A.PREDICCION, "Escribes la prueba de cómo crees que se comporta un descuento"),
            P(0, A.EXPLICACION, "Escribes el código mínimo y ves el rojo pasar a verde"),
            P(1, A.APLICACION, "Siguiente regla: nueva prueba roja, luego verde"),
            P(3, A.APLICACION, "Refactorizas con las pruebas como red"),
            P(6, A.ERROR_ANALIZADO, "Analizas una prueba que falló cuando no esperabas"),
            P(12, A.REFLEXION, "Revisas qué pruebas te enseñaron algo"),
        ),
        esta_semana=(
            "Para aprender una librería, escribe pruebas que afirmen lo que crees que hace.",
            "Cuando una prueba falle sin que lo esperes, detente: ahí está el aprendizaje.",
            "Ciclos cortos: rojo, verde, refactor en menos de 10 minutos.",
        ),
        cuando_no="Para explorar algo que no sabes ni qué hace: primero un prototipo descartable.",
        senal="Tus pruebas fallan cuando esperas y pasan cuando esperas.",
        ejemplo="Regla de descuento",
    ),
    Metodologia(
        id="kata",
        nombre="Kata y práctica deliberada",
        familia=Familia.PRACTICA,
        resumen="Repite un ejercicio corto, con una meta concreta y medición, varias veces.",
        idea=(
            "Como en artes marciales: el mismo ejercicio (un carrito de compras con TDD) repetido "
            "muchas veces, cada vez con una restricción nueva (sin if, sin mirar, en 15 minutos). "
            "Mides tiempo y errores para saber si mejoras."
        ),
        evidencia=Evidencia.MODERADA,
        fuente="Ericsson, Krampe y Tesch-Römer (1993); con matices en Macnamara, Hambrick y Oswald (2014)",
        para_quien="Intermedio y avanzado. Para automatizar lo que ya entiendes.",
        plan=(
            P(0, A.EXPLICACION, "Lees el enunciado de la kata"),
            P(1, A.PRACTICA_DELIBERADA, "Primera vez, sin tiempo"),
            P(2, A.PRACTICA_DELIBERADA, "Segunda vez, con restricción: sin mirar"),
            P(4, A.PRACTICA_DELIBERADA, "Tercera vez, en 15 minutos"),
            P(8, A.PRACTICA_DELIBERADA, "Cuarta vez, otro diseño"),
            P(16, A.PRACTICA_DELIBERADA, "Quinta vez, enseñándola"),
        ),
        esta_semana=(
            "Elige una kata de 20 minutos (por ejemplo, un carrito con descuentos).",
            "Hazla tres veces esta semana, cada una con una restricción distinta.",
            "Anota tiempo, pruebas escritas y errores; compara.",
        ),
        cuando_no="Para conceptos que aún no entiendes: repetir sin entender automatiza errores.",
        senal="Baja el tiempo y los errores, y sube la calidad del diseño.",
        ejemplo="Carrito con descuentos",
    ),
    Metodologia(
        id="maestria",
        nombre="Aprendizaje para el dominio (mastery learning)",
        familia=Familia.PRACTICA,
        resumen="No avanzas al siguiente tema hasta dominar el actual (80% o más).",
        idea=(
            "El temario se divide en niveles: Value Object, Entidad, Agregado, Repositorio. Al final "
            "de cada uno hay una evaluación corta; si no llegas al 80%, recibes práctica correctiva "
            "y repites. Nadie construye sobre una base con huecos."
        ),
        evidencia=Evidencia.ALTA,
        fuente="Bloom (1984), The 2 Sigma Problem; Kulik, Kulik y Bangert-Drowns (1990), metaanálisis",
        para_quien="Principiante e intermedio. Temas que se construyen unos sobre otros (DDD lo es).",
        plan=(
            P(0, A.EXPLICACION, "Estudias el nivel 1: Value Object"),
            P(1, A.RECUPERACION, "Evaluación corta del nivel 1"),
            P(2, A.APLICACION, "Práctica correctiva de lo que fallaste"),
            P(3, A.RECUPERACION, "Repites la evaluación hasta el 80%"),
            P(7, A.RECUPERACION, "Repaso del nivel 1 al pasar al 3"),
            P(14, A.APLICACION, "Proyecto que usa todos los niveles"),
        ),
        esta_semana=(
            "Ordena el tema en niveles que dependan uno del otro.",
            "Define antes la evaluación de cada nivel (cinco preguntas o una kata).",
            "No pases al siguiente nivel sin 4 de 5.",
        ),
        cuando_no="Cuando el tiempo es fijo e inamovible: puede no alcanzar para todos los niveles.",
        senal="Los niveles avanzados se sienten fáciles porque la base no tiene huecos.",
        ejemplo="Niveles de DDD",
    ),
    Metodologia(
        id="premortem",
        nombre="Pre-mortem y post-mortem (contrafactual)",
        familia=Familia.CRITERIO,
        resumen="Antes de decidir, imagina que ya fracasó. Después, pregunta qué habría pasado con la otra opción.",
        idea=(
            "En t<0 te dices: es t=+5 y la decisión fue un desastre, ¿por qué? En t>0 recorres el "
            "camino elegido y los que no elegiste, comparando consecuencias. Es la metodología más "
            "directa para la pregunta: por qué así y no de otra forma."
        ),
        evidencia=Evidencia.MODERADA,
        fuente="Mitchell, Russo y Pennington (1989), Back to the Future; Klein (2007), Performing a Project Premortem",
        para_quien="Intermedio y avanzado. Decisiones de diseño con alternativas reales.",
        plan=(
            P(-1, A.PREMORTEM, "Imaginas que la decisión fracasó y escribes por qué"),
            P(0, A.EXPLICACION, "Decides y anotas la justificación"),
            P(3, A.CONTRAFACTUAL, "Recorres las consecuencias de cada alternativa"),
            P(10, A.REFLEXION, "Comparas tu pre-mortem con lo que pasó"),
        ),
        esta_semana=(
            "Antes de tu próxima decisión técnica escribe tres razones por las que podría fallar.",
            "Decide y guarda esas razones con la fecha.",
            "En dos semanas, revisa: ¿qué anticipaste y qué no?",
        ),
        cuando_no="Decisiones triviales y reversibles: el costo del análisis supera al del error.",
        senal="Anticipas consecuencias que antes te sorprendían.",
        ejemplo="Dinero: float, dict o Value Object",
    ),
    Metodologia(
        id="casos",
        nombre="Casos con protagonista",
        familia=Familia.CRITERIO,
        resumen="Sigues a una persona en un proyecto real a lo largo del tiempo y decides con ella.",
        idea=(
            "Ana entra a un equipo con un sistema de facturación frágil. En cada capítulo hay una "
            "decisión: probar o no, extraer un agregado o no. Eliges y ves el capítulo siguiente con "
            "las consecuencias. La historia da contexto que un ejercicio aislado no tiene."
        ),
        evidencia=Evidencia.PRACTICA,
        fuente="Kolodner (1993), Case-Based Reasoning; método del caso de Harvard. Evidencia variable según diseño.",
        para_quien="Todos. Especialmente quienes aprenden mejor con historias.",
        plan=(
            P(-1, A.PREGUNTA_PREVIA, "Lees el contexto del caso y anticipas los problemas"),
            P(0, A.EXPLICACION, "Primer capítulo: la decisión principal"),
            P(2, A.CONTRAFACTUAL, "Ves qué habría pasado con la otra elección"),
            P(5, A.APLICACION, "Aplicas la lección a tu propio proyecto"),
            P(12, A.REFLEXION, "Escribes qué harías distinto que la protagonista"),
        ),
        esta_semana=(
            "Elige un incidente real de tu equipo (o de un post-mortem público).",
            "Reconstruye la línea de tiempo: qué se sabía en t<0, qué se decidió en t=0.",
            "Escribe qué decisión alternativa habría cambiado el resultado.",
        ),
        cuando_no="Cuando necesitas la técnica concreta: el caso da contexto, no práctica.",
        senal="Reconoces en tu trabajo situaciones de los casos que estudiaste.",
        ejemplo="El sistema de facturación de Ana",
    ),
    Metodologia(
        id="adr",
        nombre="Diario de decisiones (ADR) y ciclo de Kolb",
        familia=Familia.CRITERIO,
        resumen="Escribe cada decisión con contexto, alternativas y consecuencias esperadas; revísala después.",
        idea=(
            "Un Architecture Decision Record es la línea de tiempo escrita: contexto y fuerzas (t<0), "
            "decisión (t=0), consecuencias esperadas (t>0). Volver a leerlo semanas después y "
            "anotar lo que realmente pasó cierra el ciclo de Kolb: experiencia, reflexión, "
            "concepto, nueva prueba."
        ),
        evidencia=Evidencia.MODERADA,
        fuente="Kolb (1984), Experiential Learning; Di Stefano et al. (2014), Making Experience Count; Nygard (2011), ADR",
        para_quien="Intermedio y avanzado. Ideal si ya trabajas en un equipo.",
        plan=(
            P(-1, A.PREGUNTA_PREVIA, "Describes el contexto y las fuerzas"),
            P(0, A.EXPLICACION, "Registras la decisión y la alternativa descartada"),
            P(1, A.REFLEXION, "Escribes qué consecuencias esperas"),
            P(7, A.REFLEXION, "Primera revisión: qué pasó realmente"),
            P(21, A.REFLEXION, "Segunda revisión: ¿la volverías a tomar?"),
        ),
        esta_semana=(
            "Crea una carpeta docs/decisiones en tu proyecto.",
            "Escribe un ADR por cada decisión que discutiste más de 10 minutos.",
            "Agenda una revisión de cada ADR a la semana y al mes.",
        ),
        cuando_no="Si nunca vas a releerlo: sin la revisión en t>0, es solo burocracia.",
        senal="Tus ADR nuevos anticipan consecuencias que los viejos no veían.",
        ejemplo="ADR de un Repositorio",
    ),
    Metodologia(
        id="ensenar",
        nombre="Enseñar: pato de goma y diálogo socrático",
        familia=Familia.SOCIAL,
        resumen="Explica tu código línea por línea a alguien (o algo) que solo hace preguntas.",
        idea=(
            "Explicar a un pato de goma qué hace cada línea revela supuestos que no sabías que "
            "tenías. El diálogo socrático lo lleva más lejos: alguien que no da respuestas, solo "
            "pregunta qué pasaría si. Prepararse para enseñar ya mejora el aprendizaje."
        ),
        evidencia=Evidencia.MODERADA,
        fuente="Fiorella y Mayer (2013), The Relative Benefits of Learning by Teaching; Hunt y Thomas (1999), The Pragmatic Programmer",
        para_quien="Todos.",
        plan=(
            P(0, A.EXPLICACION, EXPLICA),
            P(1, A.ENSENANZA, "Explicas tu agregado al pato, línea por línea"),
            P(4, A.ENSENANZA, "Respondes las preguntas socráticas de un compañero"),
            P(10, A.RECUPERACION, "Explicas de memoria, sin código delante"),
        ),
        esta_semana=(
            "Antes de pedir ayuda, explica el problema en voz alta a un objeto.",
            "Prepara una explicación de 5 minutos de un concepto para tu equipo.",
            "Pide que te interrumpan solo con preguntas de qué pasaría si.",
        ),
        cuando_no="Para memorizar detalles: enseñar organiza, no reemplaza a la recuperación.",
        senal="Encuentras el error a mitad de la explicación, antes de que te respondan.",
        ejemplo="Agregado Pedido",
    ),
    Metodologia(
        id="pareja",
        nombre="Programación en pareja",
        familia=Familia.SOCIAL,
        resumen="Dos personas, un teclado: una escribe, la otra navega y pregunta. Cambian de rol.",
        idea=(
            "Quien conduce escribe la prueba y el código; quien navega piensa en el diseño, detecta "
            "errores y pregunta por qué. Cambiar de rol cada 15 minutos obliga a explicar "
            "decisiones en voz alta, todo el tiempo."
        ),
        evidencia=Evidencia.MODERADA,
        fuente="McDowell et al. (2006); Hannay et al. (2009), The Effectiveness of Pair Programming: A Meta-Analysis",
        para_quien="Todos. Mejor entre niveles cercanos o con rol explícito de mentor.",
        plan=(
            P(0, A.EXPLICACION, "Leen juntos el problema"),
            P(1, A.APLICACION, "Tú conduces: escribes la prueba roja"),
            P(1, A.ENSENANZA, "Explicas en voz alta por qué esa prueba primero"),
            P(3, A.APLICACION, "Navegas: tu pareja implementa y tú preguntas"),
            P(3, A.ENSENANZA, "Justificas cada sugerencia de diseño"),
            P(8, A.REFLEXION, "Retrospectiva de 10 minutos: qué aprendió cada uno"),
        ),
        esta_semana=(
            "Busca a alguien para una sesión de 50 minutos con un temporizador.",
            "Turnos de 15 minutos: conducir y navegar.",
            "Al final, cada uno dice una cosa que aprendió del otro.",
        ),
        cuando_no="Tareas mecánicas y conocidas: dos personas hacen el trabajo de una.",
        senal="Discuten diseño antes de escribir y las pruebas salen mejores.",
        ejemplo="Regla de descuento en pareja",
    ),
)


def buscar(id_: str) -> Metodologia:
    for m in METODOLOGIAS:
        if m.id == id_:
            return m
    raise ErrorDeDominio(f"No existe la metodología '{id_}'")


def combinar(ids: Iterable[str]) -> Metodologia:
    """Une los planes de varias metodologías en una sola: tu metodología.

    Hay un solo encuentro (t=0). Si alguna parte de ejemplos resueltos, el
    encuentro es ese; si no, una explicación. Las actividades iguales en el
    mismo instante no se repiten.
    """
    elegidas = [buscar(i) for i in dict.fromkeys(ids)]
    if not elegidas:
        raise ErrorDeDominio("Elige al menos una metodología")
    pasos = [p for m in elegidas for p in m.plan]
    encuentros = [p for p in pasos if EFECTOS[p.actividad].fase is Fase.DECISION]
    encuentro = next((p for p in encuentros if p.actividad is A.EJEMPLO_RESUELTO), encuentros[0])
    vistos: set[tuple[int, Actividad]] = set()
    plan: list[Paso] = []
    for p in sorted(pasos, key=lambda p: p.t):
        if EFECTOS[p.actividad].fase is Fase.DECISION:
            p = encuentro
        clave = (p.t, p.actividad)
        if clave not in vistos:
            vistos.add(clave)
            plan.append(p)
    return Metodologia(
        id="+".join(m.id for m in elegidas),
        nombre=" + ".join(m.nombre for m in elegidas),
        familia=elegidas[0].familia,
        resumen="Tu combinación",
        idea="",
        evidencia=min((m.evidencia for m in elegidas), key=list(Evidencia).index),
        fuente="; ".join(m.fuente for m in elegidas),
        para_quien="",
        plan=tuple(plan),
        esta_semana=tuple(s for m in elegidas for s in m.esta_semana),
        cuando_no="",
        senal="",
        ejemplo="Tu combinación",
    )
