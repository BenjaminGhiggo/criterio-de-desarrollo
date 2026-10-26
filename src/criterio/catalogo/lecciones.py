"""Las lecciones. Cada una responde a "¿por qué así y no de otra forma?".

Convención: la primera fuerza de cada lección es la que tienta a tomar el
atajo. Las consecuencias están en t>0 (1 = la primera semana, 5 = meses
después); los atajos suelen verse bien al principio y mal al final.
"""

from __future__ import annotations

from criterio.catalogo.leccion import NEG, NEU, POS, Camino, Leccion
from criterio.decisiones import Fuerza
from criterio.tiempo import ErrorDeDominio

VALUE_OBJECT = Leccion(
    id="value-object",
    titulo="Dinero: float, dict o Value Object",
    concepto="DDD · Value Object",
    pregunta="¿Cómo representamos un monto con su moneda?",
    contexto=(
        "Un sistema de facturación suma montos, aplica descuentos y convierte "
        "monedas. Hoy hay un solo país; el próximo trimestre llegan dos más."
    ),
    fuerzas=(
        Fuerza("rapidez", "Hay que entregar esta semana"),
        Fuerza("precision", "Un centavo perdido es un reclamo y una auditoría"),
        Fuerza("invariantes", "No se pueden sumar soles con dólares"),
        Fuerza("lenguaje", "El negocio habla de 'Monto', no de 'float'"),
    ),
    opciones=(
        Camino(
            "float",
            "Un float suelto",
            "total = 0.1 + 0.2   # 0.30000000000000004",
            (
                (1, "Se entregó a tiempo", POS),
                (2, "Diferencias de un centavo en reportes", NEG),
                (4, "Alguien sumó PEN + USD sin darse cuenta", NEG),
                (5, "Auditoría observa redondeos inconsistentes", NEG),
            ),
        ),
        Camino(
            "dict",
            "Un diccionario {'monto', 'moneda'}",
            "precio = {'monto': Decimal('10.50'), 'moneda': 'PEN'}",
            (
                (1, "Se entregó a tiempo y guarda la moneda", POS),
                (3, "Cada función valida la moneda a su manera", NEG),
                (5, "Un typo 'mondea' rompió producción", NEG),
            ),
        ),
        Camino(
            "value-object",
            "Value Object inmutable",
            (
                "@dataclass(frozen=True)\n"
                "class Monto:\n"
                "    valor: Decimal\n"
                "    moneda: Moneda\n\n"
                "    def __add__(self, otro: 'Monto') -> 'Monto':\n"
                "        if self.moneda != otro.moneda:\n"
                "            raise MonedasDistintas(self.moneda, otro.moneda)\n"
                "        return Monto(self.valor + otro.valor, self.moneda)"
            ),
            (
                (1, "Un día más de trabajo", NEG),
                (2, "Los tests de Monto documentan las reglas", POS),
                (4, "Agregar dos países fue agregar dos Moneda", POS),
                (5, "Auditoría sin observaciones", POS),
            ),
        ),
    ),
    recomendada="value-object",
    justificacion=("precision", "invariantes", "lenguaje"),
    explicacion=(
        "Un Value Object se define por su valor, no por su identidad, y es "
        "inmutable. Al encerrar las reglas (misma moneda, Decimal) en un solo "
        "lugar, la invariante se cumple siempre y no en cada llamada. El costo "
        "se paga en t=1; el beneficio crece con cada t."
    ),
)

TEST_PRIMERO = Leccion(
    id="test-primero",
    titulo="Test antes, después o nunca",
    concepto="TDD · Rojo, Verde, Refactor",
    pregunta="¿Cuándo escribimos la prueba de una regla de descuento?",
    contexto=(
        "Hay que implementar: 'clientes frecuentes tienen 10%, excepto en "
        "productos en oferta'. La regla va a cambiar en cada campaña."
    ),
    fuerzas=(
        Fuerza("rapidez", "Escribir pruebas parece duplicar el trabajo"),
        Fuerza("diseno", "Escribir el uso antes revela la interfaz correcta"),
        Fuerza("cambio", "La regla va a cambiar cada mes"),
        Fuerza("confianza", "Refactorizar requiere red de seguridad"),
    ),
    opciones=(
        Camino(
            "nunca",
            "Sin pruebas, se prueba a mano",
            "def descuento(cliente, producto):\n    ...  # 'ya lo probé en el navegador'",
            (
                (1, "Funcionó en la demo", POS),
                (2, "La campaña de julio rompió la de junio", NEG),
                (3, "Nadie se anima a tocar la función", NEG),
                (5, "Reescritura completa", NEG),
            ),
        ),
        Camino(
            "despues",
            "Pruebas después del código",
            "# el código ya existe; las pruebas confirman lo que hace, no lo que debería",
            (
                (1, "Funcionó y tiene algo de cobertura", POS),
                (2, "Las pruebas se acoplaron a detalles internos", NEG),
                (4, "Un caso borde nunca se probó", NEG),
                (5, "Cobertura aceptable pero frágil", NEU),
            ),
        ),
        Camino(
            "primero",
            "TDD: prueba primero",
            (
                "def test_frecuente_no_tiene_descuento_en_oferta():\n"
                "    cliente = Cliente(frecuente=True)\n"
                "    producto = Producto(en_oferta=True)\n"
                "    assert descuento(cliente, producto) == Porcentaje(0)"
            ),
            (
                (1, "Más lento la primera vez", NEG),
                (2, "Las pruebas describen la regla del negocio", POS),
                (3, "Cada campaña es: nueva prueba roja, luego verde", POS),
                (5, "Refactor grande sin miedo en una tarde", POS),
            ),
        ),
    ),
    recomendada="primero",
    justificacion=("diseno", "cambio", "confianza"),
    explicacion=(
        "En TDD la prueba existe en t<0 respecto del código: escribirla primero "
        "obliga a diseñar desde el uso. Rojo (falla), Verde (código mínimo), "
        "Refactor (mejorar con la red puesta). El costo de cambio se mantiene "
        "plano en vez de crecer."
    ),
)

REPOSITORIO = Leccion(
    id="repositorio",
    titulo="El ORM dentro o fuera del dominio",
    concepto="DDD · Repositorio y puertos",
    pregunta="¿Dónde vive el acceso a base de datos de un Pedido?",
    contexto=(
        "Un Pedido tiene reglas: no se confirma vacío, no se modifica enviado. "
        "Hoy es PostgreSQL; se habla de leer pedidos desde una API externa."
    ),
    fuerzas=(
        Fuerza("comodidad", "El ORM ya está instalado y el modelo hereda de Base"),
        Fuerza("testabilidad", "Probar reglas no debería requerir una base de datos"),
        Fuerza("aislamiento", "El dominio no debe cambiar cuando cambia la infraestructura"),
    ),
    opciones=(
        Camino(
            "orm-en-dominio",
            "El Pedido es el modelo del ORM",
            "class Pedido(Base):\n    __tablename__ = 'pedidos'\n    def confirmar(self): session.commit()",
            (
                (1, "Muy rápido de escribir", POS),
                (2, "Cada test necesita una base levantada", NEG),
                (4, "La API externa obliga a duplicar el Pedido", NEG),
            ),
        ),
        Camino(
            "repositorio",
            "Repositorio como puerto",
            (
                "class RepositorioDePedidos(Protocol):\n"
                "    def guardar(self, pedido: Pedido) -> None: ...\n"
                "    def obtener(self, id: PedidoId) -> Pedido: ...\n\n"
                "# tests: RepositorioEnMemoria; producción: RepositorioPostgres"
            ),
            (
                (1, "Una interfaz y un adaptador más", NEG),
                (2, "Tests de dominio en milisegundos", POS),
                (4, "La API externa es otro adaptador", POS),
            ),
        ),
    ),
    recomendada="repositorio",
    justificacion=("testabilidad", "aislamiento"),
    explicacion=(
        "El Repositorio es un puerto: el dominio declara qué necesita "
        "(guardar, obtener) y la infraestructura decide cómo. Con typing.Protocol "
        "Python no exige herencia. El dominio queda puro y la base de datos "
        "se vuelve un detalle reemplazable."
    ),
)

COMPOSICION = Leccion(
    id="composicion",
    titulo="Herencia o composición",
    concepto="Diseño · Composición sobre herencia",
    pregunta="¿Cómo agregamos notificaciones por email, SMS y WhatsApp?",
    contexto=(
        "Hay un Notificador por email. Piden SMS, luego WhatsApp, y algunos "
        "clientes quieren email y SMS a la vez."
    ),
    fuerzas=(
        Fuerza("reutilizar", "La herencia reutiliza código del padre de inmediato"),
        Fuerza("combinacion", "Las combinaciones crecen: email+SMS, SMS+WhatsApp..."),
        Fuerza("acoplamiento", "Cambiar al padre no debe romper a los hijos"),
    ),
    opciones=(
        Camino(
            "herencia",
            "Una subclase por canal",
            "class NotificadorEmailYSms(NotificadorEmail, NotificadorSms): ...",
            (
                (1, "Dos subclases y listo", POS),
                (3, "Explosión de clases por combinación", NEG),
                (4, "Un cambio en el padre rompió el SMS", NEG),
            ),
        ),
        Camino(
            "composicion",
            "Canales compuestos",
            (
                "class Canal(Protocol):\n"
                "    def enviar(self, mensaje: Mensaje) -> None: ...\n\n"
                "@dataclass\n"
                "class Notificador:\n"
                "    canales: list[Canal]"
            ),
            (
                (1, "Una abstracción más", NEU),
                (3, "Cualquier combinación es una lista", POS),
                (4, "WhatsApp fue una clase de 10 líneas", POS),
            ),
        ),
    ),
    recomendada="composicion",
    justificacion=("combinacion", "acoplamiento"),
    explicacion=(
        "La herencia expresa 'es un'; la composición, 'tiene un'. Cuando las "
        "variaciones se combinan, la herencia multiplica clases y la "
        "composición solo agrega elementos a una lista."
    ),
)

EXCEPCION = Leccion(
    id="excepcion-dominio",
    titulo="None, False o una excepción de dominio",
    concepto="DDD · Errores explícitos",
    pregunta="¿Qué devuelve retirar() cuando no hay saldo?",
    contexto="Una cuenta bancaria permite retirar si hay saldo. Si no, algo debe pasar.",
    fuerzas=(
        Fuerza("simplicidad", "Devolver None es una línea"),
        Fuerza("explicito", "Quien llama no debe poder ignorar el fallo"),
        Fuerza("lenguaje", "El negocio llama a esto 'Saldo insuficiente'"),
    ),
    opciones=(
        Camino(
            "none",
            "Devolver None",
            "def retirar(self, monto):\n    if monto > self.saldo:\n        return None",
            (
                (1, "Funciona", POS),
                (2, "Un llamador olvidó revisar el None", NEG),
                (4, "'NoneType has no attribute' en producción", NEG),
            ),
        ),
        Camino(
            "excepcion",
            "Excepción del dominio",
            (
                "class SaldoInsuficiente(ErrorDeDominio): ...\n\n"
                "def retirar(self, monto: Monto) -> None:\n"
                "    if monto > self.saldo:\n"
                "        raise SaldoInsuficiente(self.saldo, monto)"
            ),
            (
                (1, "Una clase más", NEU),
                (2, "El error tiene nombre y datos", POS),
                (4, "La API traduce SaldoInsuficiente a un 422 claro", POS),
            ),
        ),
    ),
    recomendada="excepcion",
    justificacion=("explicito", "lenguaje"),
    explicacion=(
        "Un None silencioso traslada la regla a cada llamador. Una excepción "
        "del dominio no se puede ignorar sin querer, lleva el nombre del "
        "negocio y se puede capturar en una sola capa (la de aplicación)."
    ),
)

ENUM = Leccion(
    id="enum",
    titulo="Strings mágicos o Enum",
    concepto="Python · Tipos explícitos",
    pregunta="¿Cómo representamos el estado de un pedido?",
    contexto="Un pedido pasa por: pendiente, pagado, enviado, entregado, cancelado.",
    fuerzas=(
        Fuerza("rapidez", "Un string se escribe sin definir nada"),
        Fuerza("errores", "Un typo no debe llegar a producción"),
        Fuerza("descubrimiento", "El editor debe sugerir los estados posibles"),
    ),
    opciones=(
        Camino(
            "string",
            "Strings sueltos",
            "if pedido.estado == 'enviaod':  # typo, siempre False",
            (
                (1, "Nada que definir", POS),
                (3, "Un typo dejó pedidos sin enviar", NEG),
                (5, "Nadie sabe la lista completa de estados", NEG),
            ),
        ),
        Camino(
            "enum",
            "Enum",
            "class EstadoPedido(Enum):\n    PENDIENTE = 'pendiente'\n    PAGADO = 'pagado'\n    ...",
            (
                (1, "Un archivo más", NEU),
                (3, "El typo falla al importar, no en producción", POS),
                (5, "match/case exhaustivo con mypy", POS),
            ),
        ),
    ),
    recomendada="enum",
    justificacion=("errores", "descubrimiento"),
    explicacion=(
        "Un Enum convierte un conjunto cerrado de valores en un tipo. Los "
        "errores se mueven de t>0 (producción) a t<0 (al escribir el código)."
    ),
)

AGREGADO = Leccion(
    id="agregado",
    titulo="Modelo anémico o agregado con invariantes",
    concepto="DDD · Agregado",
    pregunta="¿Quién protege que un pedido no se confirme vacío?",
    contexto=(
        "Hoy el servicio valida antes de hacer pedido.estado = 'confirmado'. "
        "Mañana habrá un segundo servicio, un script y un endpoint de admin."
    ),
    fuerzas=(
        Fuerza("familiaridad", "Los setters y servicios son lo que todos conocen"),
        Fuerza("invariantes", "La regla debe cumplirse siempre, no 'si te acuerdas'"),
        Fuerza("cohesion", "El comportamiento debe vivir con los datos"),
    ),
    opciones=(
        Camino(
            "anemico",
            "Datos con setters, reglas en servicios",
            "pedido.estado = 'confirmado'  # ¿quién validó que tenga líneas?",
            (
                (1, "Simple y conocido", POS),
                (3, "El script de admin confirmó pedidos vacíos", NEG),
                (5, "La regla está copiada en cuatro lugares", NEG),
            ),
        ),
        Camino(
            "agregado",
            "Agregado que se protege",
            (
                "class Pedido:\n"
                "    def confirmar(self) -> None:\n"
                "        if not self._lineas:\n"
                "            raise PedidoVacio(self.id)\n"
                "        self._estado = EstadoPedido.CONFIRMADO"
            ),
            (
                (1, "Hay que pensar los métodos", NEU),
                (3, "Imposible confirmar vacío desde cualquier lado", POS),
                (5, "Cambiar la regla es cambiar un método", POS),
            ),
        ),
    ),
    recomendada="agregado",
    justificacion=("invariantes", "cohesion"),
    explicacion=(
        "Un agregado es una frontera de consistencia: solo se modifica a "
        "través de su raíz, que garantiza las invariantes. En este proyecto, "
        "Decision, Aprendiz y Modulo son agregados: ninguno permite un "
        "evento fuera de su tiempo."
    ),
)

LECCIONES: tuple[Leccion, ...] = (
    VALUE_OBJECT,
    TEST_PRIMERO,
    REPOSITORIO,
    AGREGADO,
    EXCEPCION,
    COMPOSICION,
    ENUM,
)


def buscar(id_: str) -> Leccion:
    for leccion in LECCIONES:
        if leccion.id == id_:
            return leccion
    raise ErrorDeDominio(f"No existe la lección '{id_}'")
