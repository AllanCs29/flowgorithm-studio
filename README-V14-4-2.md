# Flowgorithm Studio v14.4.2 — corrección de compilación TypeScript

## Qué ocurría

`npm run verify` se detenía en `npm run build` con cinco errores TS2339 en `src/learning/learning.ts`. El código filtraba los nodos por tipo con una expresión booleana, pero TypeScript no podía garantizar en los pasos posteriores que fueran nodos `Input` o `If`.

## Solución

- `Input`: el filtro usa una guarda de tipo sobre `FlowNode`, con lo que `target` es accesible.
- `If`: el filtro usa una guarda de tipo sobre `FlowNode`, con lo que `trueNext` y `falseNext` son accesibles.

Estos cambios **no modifican las reglas de evaluación**; solo hacen explícito al compilador algo que ya se comprueba en ejecución.

## Instalación en macOS

Dentro de `~/Proyectos`, descomprime el ZIP completo conservando la carpeta `.git` que ya tienes, y ejecuta:

```bash
cd ~/Proyectos/Flowgorithm-Studio
npm install --include=dev
npm run verify
npm run dev:lan
```

La URL **Local** de Vite funciona en Mac; la URL **Network**, en un teléfono en la misma Wi-Fi. Publica con GitHub Desktop → Commit to main → Push origin únicamente después de que `verify` pase.

## Validación realizada y pendiente

- `tsc` global v5.8.3, modo estricto sobre `src/learning/learning.ts`: correcto.
- Verificaciones estructurales móviles: correctas.
- Ejecutadas 134 pruebas en un ejecutor aislado: 128 correctas; 6 no ejecutables allí por no disponer de `DOMParser`. **No equivalen a Vitest completo**.
- `npm run verify` y empaquetado Vite de producción siguen pendientes de confirmación en Mac.
