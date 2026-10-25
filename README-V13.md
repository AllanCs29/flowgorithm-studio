# Flowgorithm Studio v13 · Funciones interactivas

## ¿Qué es una función?

Una **función** es una pequeña receta con nombre que puedes volver a utilizar. `Main` ejecuta el programa principal, entrega **argumentos** al invocar una función; esta los recibe en **parámetros** declarados con su tipo (`Integer`, `Real`, `String`, `Boolean`). Si devuelve un valor, ese resultado puede guardarse mediante un bloque **Asignar**.

Ejemplo fiel a la sintaxis de Flowgorithm para una función que devuelve un entero:

- Main: `Integer numero, resultado` → `Input numero` → `resultado = doble(numero)` → `Output resultado`.
- Función: `doble(x: Integer): Integer` → retorna `x * 2`.
- Con entrada 4, la salida es 8; con entrada -3, la salida es -6.

> En Flowgorithm original, las llamadas a funciones **con retorno** pueden aparecer como expresiones dentro del bloque Asignar. El bloque independiente **Llamar función** es útil para funciones que no devuelven valor. La v13 enseña y practica funciones con retorno; la implementación general de llamadas sin retorno y la compatibilidad total de exportación `.fprg` de funciones siguen pendientes.

## Qué se agregó

- **Nivel 11 · Funciones:** dos clases detalladas con tres pasos cada una, preguntas de comprensión y laboratorios manipulables. 
- Diagramas separados de `Main` y la función, con seguimiento resaltado de llamada → parámetros → cálculo → retorno → salida.
- Laboratorio `doble(x)`: cambia un número y observa cómo llega a la función y vuelve como resultado.
- Laboratorio `sumar(a,b)`: cambia dos números y observa los nombres locales y los argumentos de Main.
- Dos ejercicios reales en el editor: corregir `doble` (`x + 1` → `x * 2`) y `sumar` (`a - b` → `a + b`). Se prueban varios valores, incluidos negativos y cero, para evitar respuestas memorizadas.
- Acceso directo **Explorar funciones** en la portada y nivel 11 dentro de la ruta de aprendizaje.
- Pruebas adicionales `tests/functions-learning-v13.test.ts` y actualización de expectativas de 14 a 16 lecciones.

## Cómo practicar en Mac

1. Abre la aplicación y pulsa **Explorar funciones** en la pantalla inicial.
2. Avanza las explicaciones y haz clic en los bloques del recorrido. Observa las variables y el resultado de pantalla; experimenta con los controles del laboratorio.
3. Después de acertar la pregunta, elige **Practicar en el editor**.
4. Abre **Opciones → Funciones del algoritmo**. Elige `doble` o `sumar`.
5. Selecciona el bloque **Retornar**, cambia la expresión como se indica en el reto y pulsa **Aplicar cambios**.
6. Puedes volver a `Main` desde el panel **Funciones** y pulsar **Comprobar mi reto**.
7. Desde Terminal, con el proyecto abierto, ejecuta `npm run verify` y `npm run dev:lan`.
8. En Mac abre la dirección Local de Vite (habitualmente `http://localhost:5173`); en el teléfono, conectado a la misma Wi-Fi, abre la dirección Network que imprima la Terminal.

## Validación y límite actual

Esta entrega se generó en un entorno que no pudo instalar dependencias npm. Se compilaron con `tsc` los módulos de aprendizaje, intérprete, validación estructural y los componentes UI modificados (con declaraciones mínimas de React para la comprobación de tipos); se probaron los escenarios y los casos de ejecución de ambos retos con Node.js. Aún falta ejecutar `npm run verify` completo, la compilación real de Vite, y revisar los laboratorios en Safari/Chrome y un teléfono físico.

No se ha validado la exportación de estos diagramas con funciones a un archivo `.fprg` compatible con todas las versiones de Flowgorithm original; usa **Guardar JSON** para respaldar tus funciones mientras tanto.
