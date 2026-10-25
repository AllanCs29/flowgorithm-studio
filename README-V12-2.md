# Flowgorithm Studio v12.2 · Corrección de recorridos visuales

## Qué fallaba

La prueba `tests/visual-lessons.test.ts` comprobaba `moment.description.length > 20` para cada instante de las 14 clases. En «Acumuladores», dos descripciones tenían exactamente **20 caracteres** (`Guardamos 0 + 1 = 1.` y `Guardamos 3 + 3 = 6.`), por lo que el resultado era `false`. No se trataba de que el algoritmo calculase mal.

## Qué se corrigió

- Se reemplazaron esas dos frases por explicaciones educativas que muestran el valor anterior, el valor actual del contador y el nuevo valor de `suma`.
- La prueba comprueba cada momento por separado y, si falla, indica la clase, el paso y el bloque en lugar de devolver únicamente `expected false to be true`.
- Se mantienen las mejoras de la v12.1 y los diagramas compatibles con la notación de Flowgorithm.

## Validación realizada

- Compilación individual de `src/learning/visualLessons.ts` mediante TypeScript 5.8.3: **correcta**.
- Comprobación ejecutada con Node.js de **14 escenarios y 77 momentos**, incluyendo explicaciones de longitud suficiente: **correcta**.
- Comprobación del ejemplo del círculo para radios 0, 2, 3, 5 y 10, y de los datos 0 → 15 en Asignar: **correcta**.
- **Pendiente:** no fue posible instalar dependencias en este entorno, por lo que no afirmamos haber ejecutado la suite completa de Vitest, ESLint y Vite. Ejecutar `npm run verify` en el Mac.

## Instalar en Mac y probar en el teléfono

Detén el servidor anterior en Terminal pulsando **Control + C**. Descarga el archivo ZIP de la v12.2 a Descargas. Luego:

```bash
cd ~/Proyectos
mv Flowgorithm-Studio "Flowgorithm-Studio-respaldo-v12.1-$(date +%Y%m%d-%H%M)"
unzip ~/Downloads/Flowgorithm-Studio-v12.2-Recorridos-Corregidos.zip -d ~/Proyectos
cd ~/Proyectos/Flowgorithm-Studio
npm install --include=dev
npm run verify
npm run dev:lan
```

En el Mac, abre la URL **Local** de Vite (usualmente `http://localhost:5173`). En tu teléfono, conectado a la **misma red Wi-Fi** que el Mac, abre la URL **Network** impresa en Terminal (por ejemplo `http://192.168.1.82:5173`, si sigue siendo tu IP). No uses `localhost` en el teléfono. Prueba especialmente Nivel 8 → **Acumuladores**, comprobando cómo evoluciona `suma` en cada paso. No hace falta reinstalar paquetes si ya están actualizados, pero ejecuta `npm run verify` de todos modos.
