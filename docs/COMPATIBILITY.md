# Compatibilidad de Flowgorithm Studio

Esta tabla delimita el comportamiento que realmente intenta cubrir la reconstrucción. No significa equivalencia completa con la aplicación original.

## Modelo y editor

| Área | Estado de esta base |
|---|---|
| Bloques Start / End / Declare / Assign / Input / Output | Implementados |
| If con ramas true/false | Implementado en el modelo, layout y generadores |
| While / Do / For | Implementados en el modelo, layout, intérprete y generadores para las formas cubiertas |
| Comment / Return / Call | Modelo y generación presentes; ejecución de llamadas aún no implementada |
| Inserción estructural Before / After / InsideTrue / InsideFalse / InsideBody | Implementada con validación |
| Mover bloques y undo/redo | Implementación inicial con snapshots de proyecto y validación tras comandos |
| Diagrama vertical/horizontal | Layout determinista inicial |
| Mouse, teclado, touch/pen | Controlador unificado y eventos de puntero; UX móvil aún requiere pruebas de dispositivo |
| Árbol de estructura accesible | Componente semántico inicial |

## Parser e intérprete

- Parser de expresiones Pratt sin `eval`, con precedencia aritmética y lógica de base.
- Estado de ejecución paso a paso con resaltado del siguiente bloque, variables, salida y solicitud de entrada. Un valor inválido conserva la pausa y permite reintentar.
- Los ciclos While/Do/For y las continuaciones de ramas tienen pruebas de flujo. Los operadores lógicos cortocircuitan.
- La entrada valida `Integer`, `Real`, `String` y `Boolean` según una declaración de variable.
- Las llamadas a funciones en ejecución arrojan un error explícito por ahora.
- Indexación de arreglos en expresiones no está implementada y produce un error explícito; una matriz no se trata como su primer valor. Las conversiones numéricas exactas de Flowgorithm y semánticas avanzadas aún no son completas.
- No se debe asumir equivalencia numérica 1:1 en operaciones límite o conversiones no cubiertas.

## Generación de código

Generadores separados para Python, JavaScript, C, C++ y Java. Cada uno tiene archivos de `generator`, `types`, `keywords` y `lowering`. Las construcciones que el generador no puede representar de forma fiable deben fallar con un mensaje de compatibilidad explícito, en lugar de inventar silenciosamente semántica.

Se hicieron pruebas de humo con un ejemplo de proyecto: TypeScript estricto en el dominio/interprete/layout/generadores, sintaxis Python/JavaScript, compilación C/C++ y compilación Java. Eso no reemplaza una suite oficial de conformidad.

## Archivos `.fprg`

El importador/exportador cubre un subconjunto XML común: secuencias, declaraciones, asignaciones, entrada/salida, If, ciclos, comentarios y retorno. Otros elementos, atributos o versiones de Flowgorithm pueden ser rechazados con `CompatibilityError`. Exportar y reabrir archivos reales de producción requiere más pruebas de conformidad.

## Pendiente para una paridad mayor

1. Importar archivos `.fprg` reales de distintas versiones y comparar el resultado nodo por nodo.
2. Terminar ejecución de funciones, matrices/arrays con indexación y llamadas recursivas.
3. Completar coerciones, cadenas, funciones matemáticas y nombres reservados según cada lenguaje.
4. Pruebas de navegador para drag/drop táctil, accesibilidad, zoom/pan y diagramas grandes.
5. Mejoras del algoritmo de compactación para árboles con ramas anidadas muy anchas.
