# Flowgorithm Studio v7 — El algoritmo cobra vida

> Construida encima de **v6 Completa**. Mantiene los 100 retos, 11 mundos, clases y funciones disponibles; añade observación y reproducción visual de la ejecución.

## Novedades funcionales

- **Simulación paso a paso:** panel «Así piensa tu algoritmo» visible en el editor. Resalta el **bloque que se ejecutó** (naranja) y el **siguiente bloque** (azul discontinuo).
- **Decisiones visibles:** la condición de `Si`, `Mientras`, `Hacer mientras` y `Para` registra la rama o vuelta ejecutada usando la decisión real del intérprete. Se resaltan las conexiones Sí/No, cuerpo de ciclo y la línea de retorno del ciclo.
- **Memoria viva:** variables y arreglos presentados como casillas numeradas. Las variables cambiadas se destacan; las casillas modificadas se resaltan individualmente. Se muestra el valor anterior.
- **Control de tiempo:** «Siguiente paso», «Anterior», «Siguiente grabado», «Animar», «Pausar», «Ejecutar todo», «Reiniciar» y velocidad lenta/normal/rápida.
- **Historial reversible:** se almacenan copias independientes de estados de ejecución. Al volver atrás **no se ejecuta el algoritmo a la inversa**: se muestran estados previamente registrados. Se guardan los últimos **450 fotogramas** para evitar sobrecarga.
- **Predicción:** antes de `Si` o `Mientras`, el alumno puede elegir si cree que la condición será verdadera o falsa. La app comprueba la respuesta al ejecutar el bloque. Si la condición incluye funciones no evaluables previamente, no se ofrece predicción en ese punto.
- **Móvil:** el simulador está integrado en el editor táctil; se puede contraer para devolver espacio al diagrama. Los controles hacen salto de línea y el panel de memoria se desplaza internamente.
- **Foco automático:** el lienzo desplaza su vista hasta el bloque en ejecución si estaba fuera de la zona visible.
- **Pruebas:** `tests/visual-trace.test.ts` cubre aislamiento de instantáneas, cambios, decisiones, ciclos, entrada de datos, arreglos, salida, errores, limitación de historial y condiciones no predecibles.

## Cómo probarlo (macOS)

1. Haz una copia de seguridad de tu proyecto **fuera de la carpeta** `Flowgorithm-Studio`.
2. Extrae el ZIP en `~/Proyectos`, reemplazando los archivos de la carpeta `Flowgorithm-Studio`.
3. Abre Terminal y ejecuta, por separado:

```bash
cd ~/Proyectos/Flowgorithm-Studio
npm install --include=dev
npm run verify
```

4. **Solo si `npm run verify` pasa**, ejecuta `npm run dev` y abre `http://localhost:5173`.
5. Entra a una clase, un reto o un diagrama libre. Bajo el diagrama encontrarás **«Así piensa tu algoritmo»**. Pulsa «Siguiente paso» varias veces, modifica valores y observa las casillas.
6. Prueba un ejercicio con `Si` y responde a «¿Qué crees que pasará?» antes de avanzar.
7. Para móvil conectado al mismo Wi-Fi: detén el servidor y ejecútalo con `npm run dev -- --host 0.0.0.0`, luego visita la dirección `Network` desde el celular.

## Límites actuales

- El historial registra **la función Main**; la ejecución interna de funciones llamadas se presenta como un bloque atómico. La visualización de marcos de pila de cada función queda para una versión posterior.
- El retroceso visual recupera una instantánea, **no** revierte efectos fuera del intérprete ni crea puntos de guardado persistentes entre sesiones.
- En `Ejecutar todo`, los algoritmos largos conservan los últimos 450 fotogramas. Si quieres observar cada instrucción de un programa largo desde el inicio, usa «Animar».
- Los arreglos son **unidimensionales**; los ejercicios de matrices usan índices sobre arreglos lineales, como en la v6.
- La app es un editor educativo inspirado en Flowgorithm, no una implementación de todas las funciones de Flowgorithm oficial.

## Estado de verificación en el entorno de elaboración

- Los módulos puros de TypeScript relacionados con el motor y el trazador pasaron una revisión de tipos estricta.
- Pasaron 12 comprobaciones del nuevo trazador mediante un ejecutor Node alternativo.
- Se volvieron a ejecutar las 94 soluciones de algoritmos de la v6 con sus 224 casos de prueba de entrada/salida: todas aprobadas.
- Los componentes React/TSX pasaron una revisión de TypeScript con declaraciones **provisionales** de React, pero este entorno no tenía las dependencias para ejecutar ESLint, Vitest con DOM o la compilación auténtica con Vite. **`npm run verify` en tu Mac es obligatorio antes de considerar la versión plenamente comprobada.**
