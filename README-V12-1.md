# Flowgorithm Studio v12.1 · Correcciones

Esta actualización de la v12 conserva los diagramas, los 14 escenarios y el laboratorio del área del círculo, y corrige dos fallos señalados al ejecutar `npm run verify`.

## Correcciones de código

1. `src/ui/PropertyInspector.tsx`: elimina la conversión booleana redundante en un condicional, que provocaba el error `no-extra-boolean-cast`.
2. `tests/visual-trace.test.ts`: cambia `let ctx` por `const ctx` donde no se reasigna, evitando el error `prefer-const`.
3. `tests/visual-lessons.test.ts`: incorpora una prueba de regresión del cambio del valor inicial 0 al valor calculado 15.

## Corrección pedagógica

El primer bloque de la clase Asignar es `Integer total`. Al declararse, la variable de tipo Integer comienza con `0`; eso **NO significa que `7 + 8 = 0`**. La suma aún no se ejecutó.

Ahora la pantalla distingue expresamente:

- **Declarar:** `total` tiene un **valor inicial: 0**. Se explica que NO es el resultado.
- **Asignar:** `total = 7 + 8`, cambia de **0 → 15**.
- **Salida:** `Output total` muestra **15**.

Cada cajita indica si se inicializó, recibió un dato, cambió o mantuvo su valor. La misma distinción se aplica a `Real area, radius` en el laboratorio del círculo.

## Instalar en macOS (respaldo de la v12)

En Terminal, primero detén Vite con `Control + C`. Descarga el ZIP en Descargas, luego:

```bash
cd ~/Proyectos
mv Flowgorithm-Studio "Flowgorithm-Studio-respaldo-v12-$(date +%Y%m%d-%H%M)"
unzip ~/Downloads/Flowgorithm-Studio-v12.1-Correcciones.zip -d ~/Proyectos
cd ~/Proyectos/Flowgorithm-Studio
npm install --include=dev
npm run verify
npm run dev:lan
```

El Mac puede abrir la dirección Local indicada por Vite (normalmente `http://localhost:5173`). El teléfono, **conectado al mismo Wi-Fi que el Mac**, debe abrir la dirección Network de Vite. No uses `localhost` en el teléfono. Recarga la pestaña para obtener los cambios.

## Verificación

Se comprobaron sintácticamente los archivos TS/TSX, los recorridos de 14 lecciones y el cálculo del área del círculo para radios 2, 3 y 5. **No se completó `npm install` en el entorno de preparación**, por lo que **no se pudo ejecutar la cadena completa de ESLint, Vitest y Vite build**. Para confirmar la integración real, ejecuta `npm run verify` en tu Mac y comparte la salida si aparece algún error.

Los mensajes `npm audit` y `install-scripts` no son los dos errores de lint. El aviso de `esbuild` no impidió que arrancara el servidor Vite que mostraste. Evita ejecutar `npm audit fix --force` sin revisar antes los cambios propuestos.
