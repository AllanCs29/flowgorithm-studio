# Criterios didácticos para Flowgorithm Studio

**Público objetivo:** alguien sin conocimientos previos de programación, especialmente en iPhone.

## Secuencia de una clase

**Descubre → Observa → Explica → Predice → Practica → Comprueba → Repasa.** Primero se presenta una pieza de Flowgorithm original y su función concreta; después se resalta su recorrido, se muestra el cambio en variables y se pide un pequeño intento propio. El ejemplo resuelto se consulta voluntariamente cuando hace falta.

Un paso debe responder: **¿Qué pieza es? ¿Qué recibe? ¿Qué cambia? ¿A dónde lleva la flecha?** El resultado del programa y el estado inicial deben mostrarse como cosas distintas.

## Glosario y redacción

| Término | Explicación inicial sugerida | Ejemplo |
| --- | --- | --- |
| Algoritmo | Una receta de pasos ordenados | Inicio → Mostrar → Fin |
| Variable | Una cajita con nombre que guarda un dato | `Integer edad` |
| Declarar | Crear una cajita e indicar qué puede guardar | `Real radio` |
| Asignar | Calcular lo de la derecha y guardarlo a la izquierda | `total = 7 + 8` |
| Entrada | Pedir un dato a la persona | `Input radio` |
| Salida | Mostrar texto o el contenido de una variable | `Output edad` |
| Si | Elegir una ruta según una pregunta verdadera o falsa | `edad >= 18` |
| Mientras | Repetir solo mientras se cumpla una condición | `i < 5` |
| Función | Pequeño algoritmo con nombre, que puede recibir datos y devolver un resultado | `doble(4)` |

**Escritura:** usa «Toca» para interacción táctil y «Haz clic» cuando solo se habla de ratón; donde sea posible, «Selecciona» funciona en ambos. Evita abreviaturas técnicas sin explicación previa. Prefiere ejemplos realistas breves y muestra comillas cuando son parte del código.

**Notación:** `=` asigna dentro de un bloque Asignar y compara dentro de una condición; `&` une textos; `+` suma números. No afirmar que un valor 0 es el resultado de una operación que todavía no se ejecuta.

## Diseño de ejercicios

- Separa los microretos de **gestos** (aprender a tocar, insertar y borrar) de los ejercicios de **lógica** (calcular, decidir o repetir).
- El objetivo explica el mecanismo requerido antes de iniciar; un único resultado fijo no demuestra la habilidad.
- El banco contiene diagramas con **un error deliberado** para corregir: esto se informa al abrir el reto.
- Los primeros casos de prueba deben ser comprensibles; añade después casos con cero, negativos, límites y diferentes tamaños cuando el objetivo lo permita.
- Distingue entre **casos automáticos escritos por desarrolladores** y **observación empírica de estudiantes**.
- Los mensajes deben nombrar la pieza y el siguiente paso útil; nunca atribuir al usuario un error que procede de un criterio mal especificado.

## Comprobación con personas principiantes

No inferir usabilidad de las pruebas de código. Invita voluntariamente a 3–5 principiantes a realizar tareas sin orientación. Registra solo errores de interacción por tarea, sin nombres y con consentimiento. Prioriza las pantallas que causan bloqueos reales. Repite tras cambios grandes en la interfaz.
