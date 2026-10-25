# Validación v11 · 25 de octubre de 2026

## Confirmado dentro del entorno de creación

- Se extrajo y revisó el ZIP original de v10, incluyendo componentes de lecciones, rutas de aprendizaje, pruebas y CSS móvil.
- `tsc --noEmit --strict` para los tres módulos de aprendizaje modificados: **pasa** sin dependencias de npm.
- `tsc --noEmit --strict` para los dos componentes TSX cambiados: **pasa usando declaraciones provisionales mínimas de React**, externas al ZIP.
- Compilación CommonJS y ejecución en Node de `visualLessons.ts`: **14/14 escenarios válidos**, y verificación específica de la pregunta sobre `total = 3` y `+2`.
- Comprobación de que las condiciones tienen rutas separadas y los ciclos poseen varios estados sobre el mismo bloque.
- Archivo de pruebas Vitest agregado: `tests/visual-lessons.test.ts`.

## Pendiente de confirmar en el Mac (no afirmar completado)

- `npm install --include=dev`, `npm run lint`, `npm test`, `npm run build` o `npm run verify` completos contra las dependencias reales, pues `npm install` no pudo terminar por inaccesibilidad de npm registry en el entorno de preparación.
- Ejecución del navegador real, comportamiento del progreso local existente e inspección de legibilidad/tacto en un teléfono real.

Los datos y las soluciones del motor de retos de v10 no se han modificado. Los ejemplos explicativos son independientes del intérprete de proyectos.
