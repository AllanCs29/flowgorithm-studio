# Compatibilidad con Flowgorithm original

Flowgorithm Studio reproduce una parte de las ideas, formas y notación del programa original; **no es un reemplazo compatible al 100 %**. Para el inventario del curso y resultados de la auditoría, consulta [AUDITORIA-v14.4.md](AUDITORIA-v14.4.md).

## Subconjunto implementado

- Editor de declaraciones, asignaciones, Entrada, Salida, condiciones, ciclos y comentarios.
- Interpretación paso a paso, valores de variables, ramas, ciclos, arreglos indexados de una dimensión y llamadas a funciones propias dentro del subconjunto cubierto.
- Declaración de varias variables del mismo tipo en un bloque, tipos `Integer`, `Real`, `String`, `Boolean`.
- Operadores básicos de Flowgorithm: `=` para Asignar/comparar según la figura, `&` para unir textos, `^` para potencias, aritmética y comparaciones.
- Importación y exportación de un **subconjunto** `.fprg`; se deben probar archivos reales de Flowgorithm antes de asumir fidelidad.

## Diferencias relevantes

- Algunas funciones intrínsecas, conversiones, caracteres aceptados en identificadores y semántica numérica pueden diferir del programa original.
- Para no romper proyectos antiguos, el intérprete todavía admite `+` entre cadenas; **en las clases nuevas se enseña `&`** como notación oficial.
- Generadores a Python, JavaScript y Java traducen `&` a operaciones equivalentes; el generador C++ usa una concatenación explícita con flujo de texto; el generador C rechaza esta construcción cuando no puede producirla de forma segura. Ningún generador garantiza traducción completa de todos los diagramas.
- Soporte de funciones propias, arreglos y exportación `.fprg` debe confirmarse por separado para proyectos complejos.
- No se han comprobado gráficos/turtle ni archivos de E/S de Flowgorithm original.

## Qué hacer si encuentras una incompatibilidad

Adjunta, cuando sea posible, un `.fprg` de ejemplo **sin datos personales**, captura de la ejecución original, resultado esperado y resultado de Studio. No publiques información privada de estudiantes.

Referencia oficial: [Documentación de Flowgorithm](https://www.flowgorithm.org/documentation/index.html).
