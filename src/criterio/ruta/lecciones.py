"""La ruta: programar desde Hola mundo viendo qué se ejecuta y dónde vive cada cosa.

Cada lección sigue el mismo tiempo:
  t<0  antes de ejecutar: predices (y Python compila).
  t=0  empieza la ejecución.
  t>0  paso a paso; al terminar, repasas sin mirar y lo explicas.
"""

from __future__ import annotations

from criterio.ruta.leccion import LeccionDeCodigo, Pregunta, Uso
from criterio.tiempo import ErrorDeDominio

UNIDADES = (
    "Primeros pasos",
    "Decidir y repetir",
    "Funciones y la pila",
    "Datos que cambian",
    "Objetos",
    "Diseño con criterio",
)

P = Pregunta

RUTA: tuple[LeccionDeCodigo, ...] = (
    LeccionDeCodigo(
        id="hola-mundo",
        unidad=UNIDADES[0],
        titulo="Hola mundo",
        concepto="Qué pasa antes y durante una sola línea",
        objetivo="Ver que Python compila todo antes de ejecutar, y que evalúa los argumentos antes de llamar a una función.",
        codigo='print("Hola, mundo")',
        idea_clave=(
            "En t<0 Python lee y compila el archivo completo. En t=0 empieza: busca el nombre print, crea el objeto "
            "texto \"Hola, mundo\" en memoria y solo entonces llama a print con él. Primero los argumentos, después la llamada."
        ),
        metodologias=(
            Uso("primm", "Predice qué ocurre primero antes de ejecutar; luego ejecuta, investiga, modifica y crea."),
            Uso("recuperacion", "Al final respondes sin mirar dónde vivía el texto y qué hizo Python antes de la primera línea."),
        ),
        prediccion=P(
            "Antes de ejecutar: ¿qué hace Python primero?",
            (
                "Muestra el texto y después lo guarda en memoria",
                "Crea el objeto texto en memoria y después llama a print con él",
                "Llama a print y print busca el texto después",
            ),
            1,
            "Los argumentos se evalúan antes de llamar a la función: print recibe un objeto que ya existe.",
        ),
        repaso=(
            P("¿Dónde vive el texto \"Hola, mundo\" mientras print lo usa?", ("En la pantalla", "En el montón (memoria), como un objeto str", "En una variable llamada print"), 1, "Todo valor en Python es un objeto que vive en el montón."),
            P("¿Qué hace Python antes de ejecutar la primera línea?", ("Nada: lee línea por línea", "Lee y compila el archivo completo a bytecode", "Pide permiso al sistema operativo"), 1, "Por eso un error de sintaxis en la última línea impide ejecutar la primera."),
            P("¿Dónde encuentra Python el nombre print?", ("En el marco global", "Entre las funciones incorporadas (builtins)", "En el texto"), 1, "Si un nombre no está en tus marcos, Python lo busca en los builtins."),
        ),
        reto="Agrega una segunda línea print(\"Adiós\") y predice en qué orden aparecen. Luego cambia la primera por print(\"Hola\", \"mundo\"): ¿cuántos objetos texto se crean antes de llamar a print?",
        explica="Explica, sin usar la palabra 'imprimir', qué hace Python con la línea print(\"Hola, mundo\").",
    ),
    LeccionDeCodigo(
        id="variables",
        unidad=UNIDADES[0],
        titulo="Variables: nombres que apuntan",
        concepto="Un nombre en un marco, un objeto en el montón",
        objetivo="Entender que una variable no es una caja: es un nombre que apunta a un objeto.",
        codigo='nombre = "Ana"\nedad = 30\nprint(nombre, "tiene", edad, "años")',
        idea_clave=(
            "nombre = \"Ana\" se ejecuta de derecha a izquierda: primero existe el objeto \"Ana\", después el nombre nombre "
            "queda enlazado a él en el marco global. La variable guarda una referencia (una dirección), no el valor."
        ),
        metodologias=(
            Uso("feynman", "Explica qué es una variable sin usar la palabra caja ni guardar."),
            Uso("recuperacion", "Responde sin mirar dónde vive el nombre y dónde vive el valor."),
        ),
        prediccion=P(
            "En edad = 30, ¿qué se ejecuta primero?",
            ("Se crea la variable edad vacía y luego se le mete 30", "Se obtiene el objeto 30 y después se enlaza el nombre edad", "Las dos cosas a la vez"),
            1,
            "El lado derecho se evalúa primero; la asignación solo enlaza un nombre al resultado.",
        ),
        repaso=(
            P("¿Dónde vive el nombre edad?", ("En el marco global", "Dentro del objeto 30", "En la salida"), 0, "Los nombres viven en marcos; los objetos, en el montón."),
            P("¿Qué guarda realmente la variable nombre?", ("El texto Ana copiado", "Una referencia al objeto str 'Ana'", "El número de letras"), 1, "Una variable es una flecha hacia un objeto."),
        ),
        reto="Agrega ciudad = \"Lima\" y úsala en el print. Predice en qué dirección de memoria vivirá antes de ejecutar.",
        explica="Explica la diferencia entre un nombre y un objeto con un ejemplo que no sea de programación.",
    ),
    LeccionDeCodigo(
        id="reasignacion",
        unidad=UNIDADES[0],
        titulo="Reasignar no es modificar",
        concepto="Inmutabilidad de los números",
        objetivo="Ver que y = x comparte el objeto, y que x = x + 1 crea un objeto nuevo sin tocar el anterior.",
        codigo="x = 5\ny = x\nx = x + 1\nprint(x, y)",
        idea_clave=(
            "y = x no copia el 5: hace que y apunte al mismo objeto. x + 1 crea un objeto nuevo (6) y x pasa a apuntar a él. "
            "El 5 no cambió porque los int son inmutables, así que y sigue viendo 5."
        ),
        metodologias=(
            Uso("primm", "Predice la salida, ejecuta y busca en la memoria la línea exacta donde x e y se separan."),
            Uso("fracaso-productivo", "Antes de ver la memoria, escribe tu propia explicación de por qué y vale 5. Luego compárala."),
        ),
        prediccion=P("¿Qué imprime print(x, y)?", ("6 6", "6 5", "5 5"), 1, "x pasó a apuntar a un objeto nuevo; y nunca se movió.", sobre_salida=True),
        repaso=(
            P("Después de y = x, ¿cuántos objetos 5 hay?", ("Dos: uno por variable", "Uno, con dos nombres apuntándolo", "Ninguno"), 1, "Asignar copia la referencia, no el objeto."),
            P("¿Qué hace x = x + 1 con el objeto 5?", ("Le suma 1", "Nada: crea un objeto 6 y mueve el nombre x", "Lo borra"), 1, "Los int son inmutables."),
        ),
        reto="Cambia los números por textos: x = \"a\"; y = x; x = x + \"b\". ¿Pasa lo mismo? Ejecuta y compara las direcciones.",
        explica="Explica por qué y no cambió, señalando las direcciones de memoria del paso a paso.",
    ),
    LeccionDeCodigo(
        id="expresiones",
        unidad=UNIDADES[0],
        titulo="Qué se calcula primero",
        concepto="Orden de evaluación y precedencia",
        objetivo="Seguir el orden exacto en que Python evalúa una expresión antes de asignar.",
        codigo="precio = 10\ncantidad = 3\nenvio = 5\ntotal = precio * cantidad + envio\nprint(total)\nprint(2 + 3 * 4)",
        idea_clave=(
            "Python evalúa de izquierda a derecha respetando la precedencia: busca precio, busca cantidad, multiplica, "
            "busca envio, suma, y recién al final enlaza total. El panel de orden muestra cada paso con su valor."
        ),
        metodologias=(
            Uso("ejemplos-resueltos", "La línea 4 es el ejemplo resuelto: estudia su orden de evaluación paso a paso; la 6 la resuelves tú."),
            Uso("parsons", "En el reto, ordena los pasos de evaluación de una expresión nueva antes de ejecutarla."),
        ),
        prediccion=P("¿Qué imprime la última línea?", ("20", "14", "24"), 1, "La multiplicación va antes que la suma: 3 * 4 = 12, más 2.", sobre_salida=True),
        repaso=(
            P("En total = precio * cantidad + envio, ¿qué ocurre al final?", ("Se busca envio", "Se enlaza el nombre total al resultado", "Se multiplica"), 1, "La asignación siempre es lo último."),
            P("¿Qué se evalúa primero en 2 + 3 * 4?", ("2 + 3", "3 * 4", "Depende de Python"), 1, "La precedencia agrupa 3 * 4 aunque los operandos se lean de izquierda a derecha."),
        ),
        reto="Escribe en orden los pasos de evaluación de (precio + envio) * cantidad y verifica con el panel de orden.",
        explica="Explica qué cambian los paréntesis en el orden de evaluación.",
    ),
    LeccionDeCodigo(
        id="condicionales",
        unidad=UNIDADES[1],
        titulo="Decidir: if y else",
        concepto="Líneas que nunca se ejecutan",
        objetivo="Ver que la condición se evalúa a True o False y que el bloque que no corresponde se salta.",
        codigo='edad = 17\nif edad >= 18:\n    print("Puede votar")\nelse:\n    print("Aún no puede votar")\nprint("Fin")',
        idea_clave="La línea 2 calcula edad >= 18 → False. Python salta el bloque del if y ejecuta el del else. La línea 3 nunca se ejecuta: no existe en esta línea de tiempo.",
        metodologias=(
            Uso("primm", "Predice qué líneas se ejecutan y en qué orden; compruébalo con los marcadores de línea."),
            Uso("maestria", "No avances hasta acertar las preguntas de repaso: los bucles y funciones se apoyan en esto."),
        ),
        prediccion=P(
            "¿Qué líneas se ejecutan, en orden?",
            ("1, 2, 3, 6", "1, 2, 5, 6", "Todas, del 1 al 6"),
            1,
            "La condición es False: se salta la línea 3 y entra al else. La línea del else no es una instrucción que se ejecute.",
        ),
        repaso=(
            P("¿Qué valor produce edad >= 18 aquí?", ("17", "False", "\"Aún no\""), 1, "Una comparación produce un objeto bool."),
            P("¿Se crea algún objeto en la línea 3?", ("Sí, el texto Puede votar", "No: esa línea nunca se ejecutó", "Solo si hay memoria"), 1, "Lo que no se ejecuta no ocupa memoria."),
            P("Si edad fuera 18, ¿qué se imprime primero?", ("Aún no puede votar", "Puede votar", "Fin"), 1, ">= incluye el 18."),
        ),
        reto="Cambia edad a 18 y luego agrega un elif edad >= 16 que imprima \"Voto opcional\". Predice el recorrido antes de ejecutar.",
        explica="Explica por qué la línea 3 no aparece nunca en el paso a paso.",
    ),
    LeccionDeCodigo(
        id="bucles",
        unidad=UNIDADES[1],
        titulo="Repetir: for",
        concepto="La misma línea, varios instantes",
        objetivo="Ver que el for vuelve a la misma línea y que total apunta a un objeto nuevo en cada vuelta.",
        codigo="total = 0\nfor n in [4, 7, 1]:\n    total = total + n\nprint(total)",
        idea_clave="El for toma un elemento por vuelta y reenlaza n. En cada vuelta total + n crea un int nuevo y total pasa a apuntarlo. La misma línea 3 ocurre en tres instantes distintos de t.",
        metodologias=(
            Uso("kata", "Reescribe este bucle de memoria tres veces esta semana: con lista, con range y con while."),
            Uso("espaciada", "Vuelve a esta lección en 3 días y en 7: predice de nuevo cuántas veces se ejecuta la línea 3."),
        ),
        prediccion=P("¿Cuántas veces se ejecuta la línea 3?", ("1", "3", "4"), 1, "Una vez por elemento de la lista."),
        repaso=(
            P("¿Qué es n en la segunda vuelta?", ("Una copia del 7", "Un nombre que apunta al objeto 7 de la lista", "El índice 1"), 1, "El for enlaza el nombre al elemento, no lo copia."),
            P("¿Cuántos objetos int distintos fue apuntando total?", ("1, que fue cambiando", "4: 0, 4, 11 y 12", "3"), 1, "Cada suma crea un objeto nuevo."),
        ),
        reto="Cambia la lista por range(1, 6) y predice el total antes de ejecutar. Luego reescríbelo con while.",
        explica="Explica qué hace Python en la línea 2 cada vez que vuelve a ella.",
    ),
    LeccionDeCodigo(
        id="funciones",
        unidad=UNIDADES[2],
        titulo="Funciones y su marco",
        concepto="La pila de llamadas",
        objetivo="Ver que def no ejecuta el cuerpo, que cada llamada crea un marco y que las variables locales mueren al volver.",
        codigo='def saludar(nombre):\n    mensaje = "Hola, " + nombre\n    return mensaje\n\ntexto = saludar("Ana")\nprint(texto)',
        idea_clave=(
            "def crea un objeto función. Al llamar saludar(\"Ana\") se apila un marco nuevo donde vive el parámetro nombre. "
            "mensaje nace en ese marco y muere con él; el objeto texto sobrevive porque texto lo sigue apuntando."
        ),
        metodologias=(
            Uso("ensenar", "Explícale al pato de goma qué marco está activo en cada paso y qué variables tiene."),
            Uso("feynman", "Explica qué es la pila de llamadas sin decir pila ni marco."),
        ),
        prediccion=P(
            "Cuando Python ejecuta la línea 1 (def), ¿qué pasa?",
            ("Ejecuta el cuerpo de saludar", "Crea un objeto función y lo enlaza al nombre saludar; el cuerpo no se ejecuta", "Nada hasta la línea 5"),
            1,
            "def es una instrucción que crea un objeto; el cuerpo corre recién al llamar.",
        ),
        repaso=(
            P("¿Existe la variable mensaje después de la línea 5?", ("Sí, en el marco global", "No: vivía en el marco de saludar, que se destruyó", "Sí, dentro de texto"), 1, "Las variables locales viven solo mientras su marco existe."),
            P("¿Por qué el texto 'Hola, Ana' sigue en memoria después del return?", ("Porque Python nunca borra nada", "Porque texto apunta a ese objeto", "Porque es global"), 1, "Un objeto vive mientras alguien lo apunte."),
        ),
        reto="Agrega un segundo parámetro saludo=\"Hola\" y llama saludar(\"Ana\", \"Buenas\"). Predice cuántas variables tendrá el marco.",
        explica="Explica qué pasa en memoria desde que se llama a saludar hasta que devuelve.",
    ),
    LeccionDeCodigo(
        id="pila",
        unidad=UNIDADES[2],
        titulo="Llamadas dentro de llamadas",
        concepto="Varios marcos, varios x",
        objetivo="Ver que cada llamada tiene su propio x aunque se llamen igual, y que la pila crece y decrece.",
        codigo="def doble(x):\n    return x * 2\n\ndef cuadruple(x):\n    return doble(doble(x))\n\nresultado = cuadruple(3)\nprint(resultado)",
        idea_clave="cuadruple(3) apila un marco con x=3. doble(x) apila otro con su propio x=3, devuelve 6 y se destruye. El segundo doble recibe 6. Hay tres marcos como máximo: global, cuadruple y doble.",
        metodologias=(
            Uso("pareja", "En pareja: una persona avanza los pasos y la otra, como navegante, dice antes qué marco está arriba."),
            Uso("recuperacion", "Sin mirar, dibuja la pila en el momento más profundo."),
        ),
        prediccion=P("¿Cuántos marcos hay como máximo en la pila?", ("1", "2", "3"), 2, "global, cuadruple y doble."),
        repaso=(
            P("¿Es el mismo x el de doble y el de cuadruple?", ("Sí, se llaman igual", "No: cada marco tiene su propio x", "Solo en la primera llamada"), 1, "Los nombres locales pertenecen a su marco."),
            P("¿Qué recibe el segundo doble?", ("3", "6", "12"), 1, "El resultado del primer doble."),
        ),
        reto="Agrega def octuple(x): return cuadruple(cuadruple(x)) y predice la profundidad máxima de la pila.",
        explica="Explica por qué dos variables llamadas x no se pisan.",
    ),
    LeccionDeCodigo(
        id="listas-alias",
        unidad=UNIDADES[3],
        titulo="Listas: dos nombres, un objeto",
        concepto="Mutabilidad y alias",
        objetivo="Ver que b = a no copia una lista, y que list(a) sí crea otra.",
        codigo="a = [1, 2]\nb = a\nb.append(3)\nprint(a)\nc = list(a)\nc.append(4)\nprint(a, c)",
        idea_clave="Las listas son mutables: append cambia el objeto por dentro. Como a y b apuntan al mismo objeto, el cambio se ve desde los dos. list(a) crea un objeto nuevo: modificar c no toca a.",
        metodologias=(
            Uso("fracaso-productivo", "Antes de ejecutar, escribe qué imprime la línea 4 y por qué. Si fallas, la memoria te muestra exactamente dónde."),
            Uso("ejemplos-con-errores", "Este es el error más común con listas: identifícalo en el reto en código ajeno."),
        ),
        prediccion=P("¿Qué imprime la línea 4?", ("[1, 2]", "[1, 2, 3]", "[3]"), 1, "b.append cambió el único objeto lista, que también es a.", sobre_salida=True),
        repaso=(
            P("Después de b = a, ¿cuántas listas hay en memoria?", ("Dos", "Una", "Depende del tamaño"), 1, "Mira las direcciones: a y b muestran la misma."),
            P("¿Por qué c.append(4) no cambia a?", ("Porque c es más nueva", "Porque list(a) creó un objeto lista distinto", "Porque append solo funciona una vez"), 1, "Dirección distinta, objeto distinto."),
        ),
        reto="Busca el error: def agregar_iva(precios): precios.append(0); return precios. ¿Qué le pasa a la lista de quien llama? Pruébalo en el editor.",
        explica="Explica con tus palabras la diferencia entre cambiar un objeto y cambiar a dónde apunta un nombre.",
    ),
    LeccionDeCodigo(
        id="defecto-mutable",
        unidad=UNIDADES[3],
        titulo="La trampa del valor por defecto",
        concepto="Cuándo se evalúa un default",
        objetivo="Ver que el valor por defecto se crea una sola vez, al ejecutar def, y vive pegado a la función.",
        codigo='def agregar(producto, carrito=[]):\n    carrito.append(producto)\n    return carrito\n\nprint(agregar("pan"))\nprint(agregar("leche"))',
        idea_clave="La lista [] se evalúa en la línea 1, una sola vez, y queda guardada en el objeto función. Cada llamada sin carrito usa esa misma lista. En la memoria se ve: la función apunta a su lista por defecto.",
        metodologias=(
            Uso("ejemplos-con-errores", "El código tiene un error real de diseño: encuéntralo en la memoria antes de leer la explicación."),
            Uso("premortem", "Antes de ejecutar, imagina que esto ya está en producción y falló: ¿qué reclamo llegó?"),
        ),
        prediccion=P("¿Qué imprime la segunda llamada?", ("['leche']", "['pan', 'leche']", "['leche', 'pan']"), 1, "La lista por defecto es la misma en ambas llamadas.", sobre_salida=True),
        repaso=(
            P("¿Cuándo se crea la lista por defecto?", ("En cada llamada", "Una vez, cuando se ejecuta def", "Cuando se imprime"), 1, "Los defaults se evalúan al definir la función."),
            P("¿Cuál es la corrección habitual?", ("carrito=list()", "carrito=None y dentro if carrito is None: carrito = []", "Borrar la lista al inicio"), 1, "None es inmutable; la lista nueva se crea en cada llamada."),
        ),
        reto="Corrige la función con carrito=None y verifica en el paso a paso que cada llamada crea su propia lista.",
        explica="Explica por qué list() como valor por defecto tampoco lo arregla.",
    ),
    LeccionDeCodigo(
        id="diccionarios",
        unidad=UNIDADES[3],
        titulo="Diccionarios: claves que apuntan",
        concepto="Pares clave → referencia",
        objetivo="Ver que un dict guarda referencias y que asignar una clave modifica el mismo objeto.",
        codigo='precios = {"pan": 2, "leche": 4}\nprecios["cafe"] = 9\ntotal = precios["pan"] + precios["cafe"]\nprint(total)\nprint("te" in precios)',
        idea_clave="Un dict es un objeto mutable con pares clave → referencia. precios[\"cafe\"] = 9 no crea otro diccionario: agrega un par al mismo objeto (misma dirección). Leer precios[\"pan\"] sigue la referencia hasta el int 2.",
        metodologias=(
            Uso("espaciada", "Vuelve en 3 y 7 días: predice la dirección de precios antes y después de la línea 2."),
            Uso("intercalado", "Mezcla con listas y tuplas: en el reto decide qué estructura usarías y por qué."),
        ),
        prediccion=P("¿precios[\"cafe\"] = 9 crea un diccionario nuevo?", ("Sí", "No: agrega un par al mismo objeto dict", "Solo si cafe no existía"), 1, "Mira la dirección de precios antes y después: no cambia."),
        repaso=(
            P("¿Qué devuelve \"te\" in precios?", ("None", "False", "Un error"), 1, "in busca entre las claves."),
            P("¿Qué guarda el dict para la clave \"pan\"?", ("El número 2 copiado", "Una referencia al objeto int 2", "El texto pan"), 1, "Como las variables, los contenedores guardan referencias."),
        ),
        reto="Para cada caso elige lista, tupla o dict y justifica: los pasos de una receta, un punto (x, y), el stock por producto.",
        explica="Explica por qué buscar por clave en un dict no recorre todos los elementos.",
    ),
    LeccionDeCodigo(
        id="clases",
        unidad=UNIDADES[4],
        titulo="Clases y objetos: qué es self",
        concepto="Atributos dentro del objeto",
        objetivo="Ver que los atributos viven dentro del objeto en el montón y que self es una referencia más a ese objeto.",
        codigo="class Cuenta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n\n    def depositar(self, monto):\n        self.saldo = self.saldo + monto\n\ncuenta = Cuenta(100)\ncuenta.depositar(50)\nprint(cuenta.saldo)",
        idea_clave="Cuenta(100) crea un objeto vacío y llama a __init__ con self apuntando a él. self.saldo = saldo guarda un atributo dentro del objeto. En depositar, self es el mismo objeto que cuenta: por eso el cambio se ve afuera.",
        metodologias=(
            Uso("ensenar", "Explica al pato de goma cada vez que aparece un marco nuevo: quién es self en ese marco."),
            Uso("cinco-porques", "¿Por qué existe self? Encadena porqués hasta llegar a: varios objetos comparten los mismos métodos."),
        ),
        prediccion=P("¿Qué es self dentro de depositar?", ("Una copia de la cuenta", "El mismo objeto al que apunta cuenta", "La clase Cuenta"), 1, "Compara las direcciones de self y de cuenta en el paso a paso."),
        repaso=(
            P("¿Dónde vive el atributo saldo?", ("En el marco global", "Dentro del objeto Cuenta, en el montón", "En la clase"), 1, "Cada objeto tiene sus propios atributos."),
            P("¿Qué imprime el programa?", ("100", "150", "50"), 1, "depositar cambió el atributo del mismo objeto."),
        ),
        reto="Crea una segunda cuenta con 20 y deposita 5 solo en ella. Verifica en la memoria que hay dos objetos con saldos distintos y una sola clase.",
        explica="Explica qué hace Python cuando escribes cuenta.depositar(50), en orden.",
    ),
    LeccionDeCodigo(
        id="excepciones",
        unidad=UNIDADES[4],
        titulo="Excepciones: saltar en el tiempo",
        concepto="raise, try y except",
        objetivo="Ver que raise abandona la función, destruye su marco y salta al except, saltándose líneas.",
        codigo='def retirar(saldo, monto):\n    if monto > saldo:\n        raise ValueError("Saldo insuficiente")\n    return saldo - monto\n\ntry:\n    nuevo = retirar(100, 150)\n    print("Retiro hecho")\nexcept ValueError as error:\n    print("No se pudo:", error)\nprint("Fin")',
        idea_clave="raise crea un objeto excepción y Python deja de ejecutar: sale de retirar (su marco se destruye) y busca un except. La línea 8 nunca se ejecuta y nuevo nunca se crea.",
        metodologias=(
            Uso("cinco-porques", "¿Por qué lanzar una excepción y no devolver None? Sigue los porqués hasta una consecuencia para quien usa la función."),
            Uso("casos", "Imagina a Ana depurando un retiro que 'no hizo nada': ¿qué línea buscaría primero?"),
        ),
        prediccion=P("¿Se ejecuta print(\"Retiro hecho\")?", ("Sí", "No: la excepción salta directo al except", "Sí, pero después del except"), 1, "El salto ocurre en la línea 7; la 8 queda atrás para siempre."),
        repaso=(
            P("¿Existe la variable nuevo al final?", ("Sí, vale -50", "No: la asignación nunca terminó", "Sí, vale None"), 1, "La excepción interrumpió la línea antes de enlazar el nombre."),
            P("¿Qué le pasa al marco de retirar cuando se lanza la excepción?", ("Queda esperando", "Se destruye", "Pasa al global"), 1, "La excepción sube por la pila destruyendo marcos hasta un except."),
        ),
        reto="Cambia el monto a 50 y predice qué líneas se ejecutan. Luego quita el try: ¿qué pasa con print(\"Fin\")?",
        explica="Explica por qué una excepción es mejor que devolver None para un retiro imposible.",
    ),
    LeccionDeCodigo(
        id="value-object",
        unidad=UNIDADES[4],
        titulo="Value Object: valores que no cambian",
        concepto="dataclass(frozen=True) y operadores",
        objetivo="Ver que a + b llama a un método, que el Value Object crea objetos nuevos y que == compara por valor.",
        codigo='from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Monto:\n    valor: int\n    moneda: str\n\n    def __add__(self, otro):\n        if self.moneda != otro.moneda:\n            raise ValueError("Monedas distintas")\n        return Monto(self.valor + otro.valor, self.moneda)\n\na = Monto(10, "PEN")\nb = Monto(5, "PEN")\ntotal = a + b\nprint(total)\nprint(a == Monto(10, "PEN"))',
        idea_clave="a + b no suma números: llama a a.__add__(b), que verifica la moneda y crea un Monto nuevo. a y b no cambian nunca (frozen). Dos Monto con los mismos valores son iguales aunque vivan en direcciones distintas.",
        metodologias=(
            Uso("intercalado", "Compara con la lección de clases: ¿cuándo un objeto debe cambiar (Cuenta) y cuándo no (Monto)?"),
            Uso("adr", "Escribe un ADR corto: por qué representar dinero con un Value Object y no con int."),
        ),
        prediccion=P("¿Qué ejecuta Python en total = a + b?", ("Suma los atributos automáticamente", "Llama a a.__add__(b)", "Crea una lista con a y b"), 1, "Los operadores son llamadas a métodos especiales."),
        repaso=(
            P("Después de total = a + b, ¿cambió a?", ("Sí, ahora vale 15", "No: se creó un objeto nuevo para total", "Depende de b"), 1, "Inmutable: las operaciones devuelven objetos nuevos."),
            P("¿Por qué a == Monto(10, \"PEN\") da True si son objetos distintos?", ("Porque Python compara direcciones", "Porque dataclass genera __eq__ que compara por valor", "Por casualidad"), 1, "Un Value Object se define por su valor."),
        ),
        reto="Suma Monto(10, \"PEN\") + Monto(5, \"USD\") en el editor y sigue el salto de la excepción.",
        explica="Explica cuándo conviene que un objeto sea inmutable.",
    ),
    LeccionDeCodigo(
        id="pruebas-tdd",
        unidad=UNIDADES[5],
        titulo="Pruebas: assert y TDD",
        concepto="Una prueba es código que verifica código",
        objetivo="Ver que una prueba es una función que llama a tu código y que assert lanza un error si algo es falso.",
        codigo="def descuento(total, frecuente):\n    if frecuente:\n        return total * 10 // 100\n    return 0\n\ndef test_frecuente_tiene_10_por_ciento():\n    assert descuento(200, True) == 20\n\ndef test_no_frecuente_no_tiene_descuento():\n    assert descuento(200, False) == 0\n\ntest_frecuente_tiene_10_por_ciento()\ntest_no_frecuente_no_tiene_descuento()\nprint(\"Pruebas en verde\")",
        idea_clave="Cada prueba es una función. Al llamarla, apila su marco, llama a descuento (otro marco), compara con == y assert verifica que sea True. pytest hace exactamente esto por ti con cada función test_.",
        metodologias=(
            Uso("tdd", "En el reto escribe primero la prueba de una regla nueva, mírala fallar (rojo) y después escribe el código."),
            Uso("kata", "Repite el ciclo rojo, verde, refactor con esta función tres veces, cada vez más rápido."),
        ),
        prediccion=P(
            "Si descuento devolviera siempre 20, ¿qué prueba fallaría?",
            ("test_frecuente_tiene_10_por_ciento", "test_no_frecuente_no_tiene_descuento", "Ninguna"),
            1,
            "Para un cliente no frecuente se espera 0.",
        ),
        repaso=(
            P("¿Qué hace assert cuando la condición es False?", ("Imprime False", "Lanza AssertionError", "Nada"), 1, "Ese error es lo que pytest muestra en rojo."),
            P("¿Cuántos marcos hay cuando se ejecuta el return de descuento dentro de una prueba?", ("1", "2", "3"), 2, "global, la prueba y descuento."),
        ),
        reto="Regla nueva: compras de 500 o más tienen 15%. Escribe primero test_compra_grande_tiene_15_por_ciento, ejecútalo y míralo fallar. Luego cambia descuento.",
        explica="Explica por qué conviene ver la prueba en rojo antes de escribir el código.",
    ),
    LeccionDeCodigo(
        id="agregado",
        unidad=UNIDADES[5],
        titulo="Agregado: un objeto que se protege",
        concepto="Invariantes de DDD",
        objetivo="Ver que el agregado verifica su regla antes de modificar su estado, así un error no lo deja a medias.",
        codigo='class LimiteExcedido(Exception):\n    pass\n\nclass Pedido:\n    def __init__(self, limite):\n        self._lineas = []\n        self._limite = limite\n\n    def agregar(self, producto, precio):\n        if self.total() + precio > self._limite:\n            raise LimiteExcedido(producto)\n        self._lineas.append((producto, precio))\n\n    def total(self):\n        suma = 0\n        for _, precio in self._lineas:\n            suma = suma + precio\n        return suma\n\npedido = Pedido(limite=10)\npedido.agregar("pan", 4)\npedido.agregar("leche", 5)\ntry:\n    pedido.agregar("cafe", 9)\nexcept LimiteExcedido as error:\n    print("Rechazado:", error)\nprint(pedido.total())',
        idea_clave="La regla (no superar el límite) vive dentro de Pedido. agregar verifica antes de tocar _lineas: cuando el café excede, la excepción sale antes del append y el pedido queda con 2 líneas, consistente. Nadie de afuera modifica _lineas directamente.",
        metodologias=(
            Uso("premortem", "Antes de ejecutar: si el append estuviera antes del if, ¿qué estado inconsistente quedaría tras el error?"),
            Uso("casos", "Piensa en Ana: el script de administración hacía pedido._lineas.append(...). ¿Qué regla se saltaba?"),
            Uso("maestria", "Es la lección final: si fallas el repaso, vuelve a funciones y excepciones antes de seguir."),
        ),
        prediccion=P("Después del error con el café, ¿cuántas líneas tiene el pedido?", ("3", "2", "0"), 1, "La verificación ocurre antes del append: el café nunca entra."),
        repaso=(
            P("¿Por qué el if va antes del append?", ("Por estilo", "Para que un error no deje el pedido a medias", "Porque Python lo exige"), 1, "Verificar antes de modificar mantiene la invariante."),
            P("¿Qué imprime la última línea?", ("18", "9", "4"), 1, "pan 4 + leche 5."),
            P("¿Quién debería poder agregar líneas al pedido?", ("Cualquiera con pedido._lineas", "Solo el método agregar del propio pedido", "El repositorio"), 1, "Así la regla se cumple siempre."),
        ),
        reto="Escribe primero una prueba que verifique que un pedido rechazado no cambia su total. Luego mueve el append antes del if en el editor y mira cómo la memoria muestra el estado inconsistente.",
        explica="Explica qué es una invariante y quién la protege en este código.",
    ),
)


def buscar_leccion(id_: str) -> LeccionDeCodigo:
    for leccion in RUTA:
        if leccion.id == id_:
            return leccion
    raise ErrorDeDominio(f"No existe la lección '{id_}'")
