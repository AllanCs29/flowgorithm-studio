# Flowgorithm Studio v12 — Bases originales

## Qué cambia

Esta versión mantiene la academia v11 (14 clases con recorridos, selección y reproducción de bloques, memoria visual, explicación y quiz), pero enseña la notación de **Flowgorithm original** en lugar de pseudocódigo alternativo.

- El bloque **Asignar** muestra `total = total + 2`, no `total ← total + 2`. El signo `=` tiene dos usos según el bloque: asigna en **Assign** y compara dentro de **If**.
- El editor dibuja un **óvalo** para Main/End, un **rectángulo dividido** para Declare, un **rectángulo** para Assign, **paralelogramos** diferenciados para Input/Output y un **rombo** para If. El recorrido didáctico sigue las mismas convenciones de color y silueta.
- Las declaraciones didácticas muestran el tipo **antes** del nombre: `Integer edad`, `String nombre`, `Real area, radius`. Los tipos básicos son `Integer` (entero), `Real` (número decimal), `String` (texto) y `Boolean` (verdadero/falso).
- Explicaciones previas, sencillas y más graduales en las clases iniciales (qué hace cada bloque, para qué sirve una variable, cómo se interpreta `=`, por qué las comillas y el operador `&`).
- Laboratorio **área de un círculo**, desplegable en las lecciones Declarar, Asignar y Entrada: cambia el radio, sigue los seis pasos reales, toca figuras, observa `area` y `radius` y mira el resultado.
- Motor de expresiones: `pi`, `^`, `&` y `=` en condiciones. Declaraciones agrupadas como `Real area, radius` se ejecutan y se traducen a los generadores de código como dos variables.
- Importador/exportador `.fprg`: ya distingue el atributo original `array="False"` de `array="True" size="..."` y acepta la dirección del ciclo `for` sin importar si se escribe `Inc`, `Dec`, `inc` o `dec`. **No es todavía compatible con todas las funciones de Flowgorithm**.

## El ejemplo base

````text
Main
  Real area, radius
  Input radius
  area = pi * radius ^ 2
  Output "The area is " & area
End
````

Ejemplo con radio `3`: `pi * 3 ^ 2` produce `28.2743338823...`; las explicaciones interactivas muestran `28.2743`, redondeado únicamente para visualizar.

**Qué enseña cada paso:** Main inicia, Real crea las cajitas, Input llena `radius`, Assign lee `radius` y guarda el área, Output escribe el resultado, End termina.

El archivo `ejemplos/area-del-circulo.fprg` es un ejemplo estándar de la estructura XML de Flowgorithm y puede importarse desde el editor, sujeto a la compatibilidad parcial explicada arriba. En el archivo `.fprg` original, Main y End son implícitos y no figuran como etiquetas dentro de `body`; en el laboratorio sí se muestran como figuras.

## Ruta didáctica elegida

1. Entender qué es un algoritmo, Main, End y las flechas.
2. Salida: mostrar texto (comillas) y valores.
3. Declaración: cajitas, nombres y `Integer`, `Real`, `String`, `Boolean`; primero una variable, luego varias.
4. Asignación: calcular a la derecha, guardar a la izquierda; actualización de una variable.
5. Entrada: solicitar datos, guardarlos y formar mensajes con `&`.
6. Condicionales: una decisión, comparaciones y ramas Sí/No.
7. Ciclos: Mientras, Hacer mientras, Para, contadores y acumuladores.
8. Aplicar lo aprendido: problemas integrados y proyectos.

Este orden está inspirado en los **temas introductorios** de la playlist facilitada por el usuario: <https://youtube.com/playlist?list=PLDLnmbUDWFUtFTqLf_lS99z2gmYU5ouRv>. No afirmamos haber visto todos los videos ni copiamos su contenido. Nos basamos asimismo en <https://www.flowgorithm.org/documentation/index.html> para mantener la sintaxis y las convenciones.

## Cómo ejecutar en macOS y probar en teléfono

Necesitas Node.js 20 o superior. Detén el servidor viejo antes de iniciar uno nuevo. Desde la carpeta del proyecto:

```bash
npm install --include=dev
npm run verify
npm run dev:lan
```

En el Mac abre la dirección **Local** que muestre Vite (normalmente `http://localhost:5173`). Con el Mac y el teléfono conectados al **mismo Wi-Fi**, abre en el teléfono la dirección **Network** de Vite (no `localhost`). Asegúrate de permitir las conexiones de la red local si macOS lo solicita.

Revisión sugerida: **Nivel 2 → Declarar → Asignar → Leer datos**. Abre el laboratorio del círculo y recorre los seis bloques, cambia el radio, luego selecciona una figura y comprueba la relación entre texto, estado y valor. En el editor, agrega `Real area, radius`, Input, Assign y Output; usa `=` y `&`.

## Validación y limitaciones

Se ejecutaron comprobaciones de TypeScript estricto para motor de expresiones, intérprete, generadores y contenido de clases; también verificaciones directas con Node del programa del círculo para radios 3, 2 y 2.5, agrupación de declaraciones, operadores y 14 escenarios. El código TypeScript/TSX fue revisado sintácticamente.

En el entorno de preparación no se completó la instalación `npm install`, por lo que **no se afirma que `npm run verify`, la compilación web o la interfaz real de un teléfono hayan pasado aquí**. Ejecuta `npm run verify` en tu Mac y comparte cualquier salida de error.

**Límites actuales:** esta es una academia basada en Flowgorithm, no una copia exacta de todas las funciones ni un emulador 100 % compatible. El exportador `.fprg`, algunas funciones y arreglos complejos, y algunos retos heredados siguen requiriendo mejoras. En las lecciones de ciclos avanzados se conservan algunos diagramas parciales para enfocarse en una sola idea; el laboratorio del círculo es el ejemplo completo paso a paso.
