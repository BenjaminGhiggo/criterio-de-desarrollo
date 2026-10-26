class ErrorDeDominio(Exception):
    """Una regla del dominio fue violada.

    Por qué una excepción propia y no ``ValueError``: quien llama puede
    distinguir "el usuario pidió algo que el negocio no permite" de un fallo
    de programación.
    """
