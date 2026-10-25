# Registro de verificación — Flowgorithm Studio v10

Fecha de preparación: 2026-10-25.

## Comprobaciones ejecutadas aquí

- Revisión TypeScript estática (`tsc`) de `src/**/*.ts`, `src/**/*.tsx` y pruebas `tests/**/*.ts`, mediante **declaraciones provisionales** para React y Vitest, sin errores. Esta revisión no equivale a `npm run verify` real.
- Compilación estricta CommonJS y ejecución directa con Node.js de los módulos puros de micropráctica y perfiles: 24 preguntas, las seis habilidades, respuestas correctas/incorrectas, 4 rompecabezas de ordenación, separación de perfiles, asignaciones, respaldos.
- Comprobación de sintaxis de `public/sw.js` y `scripts/prepare-offline.cjs`.
- Simulación de `scripts/prepare-offline.cjs` sobre una compilación ficticia: inyecta JS y CSS con nombres hash al caché PWA.
- Validación de los iconos de 192 y 512 píxeles.

## Comprobaciones pendientes en el equipo del usuario

- `npm install --include=dev` y `npm run verify` con dependencias auténticas (ESLint, Vitest, TypeScript, Vite).
- Inspección manual de escritorio, móvil, gestos y tamaños de pantalla.
- Instalación offline bajo un origen HTTPS real en teléfono.

## Alcance de la cobertura

La base v7 había superado 85 pruebas en el Mac del usuario antes de esta entrega. Esas pruebas se mantienen y se agregan nuevas pruebas en `tests/skill-arcade.test.ts`, `tests/local-classroom.test.ts`, `tests/code-bridge.test.ts` y `tests/error-coach.test.ts`. La **cantidad total de pruebas que pase v10** debe verificarse con Vitest en el Mac; no se afirma aquí que ese comando haya corrido.
