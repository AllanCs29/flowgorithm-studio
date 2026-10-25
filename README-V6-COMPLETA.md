# Flowgorithm Studio v6 Completa — academia y laboratorio de lógica

## Qué hay en este paquete

- **100 de 100 retos habilitados** y organizados en 11 mundos, además de las 14 clases guiadas del curso inicial.
- 6 retos de **acciones del editor** (001, 002, 005, 006, 008 y 009) con comprobación de la interacción realizada: selección ordenada, apertura de propiedades, cancelación de cambios, inserción, eliminación y un solo paso + reinicio.
- 94 retos de **lógica ejecutable**, cada uno con diagrama inicial que debe corregirse, solución de referencia, pista y casos de prueba. En total se verificaron 224 casos de entrada/salida de referencia en una ejecución directa de los módulos TypeScript transpilados.
- Funciones propias con parámetros tipados, `Call` y `Return`, funciones usadas en expresiones y **recursión limitada a 40 niveles** para prevenir ejecuciones recursivas infinitas.
- Arreglos indexados, matrices 2×2 representadas con arreglos lineales, búsquedas, ordenamiento burbuja, textos, estadísticas y proyectos integradores.
- Selector de funciones desde **Opciones → Funciones**; en el editor libre es posible crear una función, editar su diagrama y luego llamarla desde `Main`.
- Se conserva la interfaz móvil con paneles inferiores, pulsación para insertar bloques, ruta de aprendizaje y guardado local de progreso.

## Instalación en macOS

1. Haz un respaldo de tu carpeta actual `~/Proyectos/Flowgorithm-Studio` **fuera** del proyecto.
2. Descomprime el ZIP sobre `~/Proyectos`. El ZIP contiene el directorio `Flowgorithm-Studio`.
3. En Terminal:

```bash
cd ~/Proyectos/Flowgorithm-Studio
npm install --include=dev
npm run verify
npm run dev
```

4. Abre `http://localhost:5173`. Para celular, usa `npm run dev -- --host 0.0.0.0` y abre la URL `Network` desde el celular conectado al mismo Wi-Fi.

Si `npm run verify` falla, **no ignores el error**: copia el resultado para corregirlo. No ejecutes `npm audit fix --force` sin revisar los cambios.

## Uso de funciones

1. Abre **Opciones → Funciones**, elige una existente o crea una con nombre, parámetros `x:Integer` y tipo de retorno.
2. En la función, cambia el bloque **Retornar** por una expresión válida, por ejemplo `x * 2`.
3. Selecciona la función **Main** desde ese mismo menú.
4. Declara una variable destino, inserta **Llamar función**, pon `doble` como nombre, `x` como argumento y la variable destino. Ejecuta Main.

Las funciones pueden llamarse desde expresiones como `factorial(n-1)`. El límite de profundidad protege de recursión sin caso base.

## Alcance y límites

El catálogo de los **100 ejercicios ya no tiene fichas «En preparación»**. No debe confundirse con compatibilidad total con Flowgorithm de escritorio: las funciones gráficas/tortuga, todas las modalidades de lectura de archivos, matrices bidimensionales nativas, todas las variantes de `.fprg` y la equivalencia de código generado en todos los lenguajes **no están certificadas**. Las matrices educativas se modelan como un arreglo lineal con índice `fila*columnas+columna`.

La ejecución del motor de las 94 soluciones y sus 224 casos, las 94 plantillas inicialmente incorrectas, los seis validadores de interacción y los 100 diagramas iniciales/finales se comprobaron directamente con Node.js y TypeScript transpilado. La compilación completa React/Vite, ESLint y las pruebas Vitest dependen de `node_modules`: **no estuvieron disponibles en este entorno** y se deben verificar mediante `npm run verify` en tu Mac. Tampoco se ha certificado la usabilidad con pruebas E2E en un dispositivo físico.
