# Historial de cambios

## 1.4.7 — Corrección TypeScript de pruebas táctiles (2026-10-26)

- `tests/mobile-ux-v146.test.ts`: `beforeEach` ahora ejecuta `vi.useFakeTimers()` sin devolver su resultado, que no es un valor de limpieza válido para Vitest. Esto corrige TS2322 durante `npm run build`.
- Se conservan los casos de prueba de pulsación larga, toque corto, desplazamiento y mouse; no cambia el comportamiento del editor.
- `package.json` se identifica como versión 1.4.7 (SemVer válido).
- La compilación y suite oficial completas deben confirmarse ejecutando `npm run verify` en macOS antes de subir a GitHub.

## Parche v14.6.1 — Prueba de meta plegable (2026-10-26)

- Se adapta `tests/mission-goals-v145.test.ts` al componente plegable de v14.6. Antes comprobaba el encabezado literal `TU META`, que ahora se presenta como `Tu meta`.
- La prueba ahora verifica la accesibilidad y el estado inicial compacto de la tarjeta, el resumen del objetivo y la ausencia de una guía abierta automáticamente.
- No se modifican los ejercicios, las reglas de evaluación ni el comportamiento visual. `package.json` conserva `1.4.6` porque es una corrección exclusiva de pruebas.
- Verificar con `npm run verify` antes de publicar en GitHub Pages.

## 1.4.6 — UX móvil: objetivo plegable y pulsación larga (2026-10-26)

- Tarjeta «Tu meta» compacta de una línea en iPhone, ampliable desde un botón accesible. Recuerda la preferencia sin guardar datos personales.
- «Qué revisaré» y «¿Necesitas ayuda?» se despliegan dentro de la misma tarjeta; la guía paso a paso solo se abre cuando se solicita.
- Toque corto selecciona/edita el bloque. Mantener presionado 430 ms activa el modo arrastre. Deslizar antes del umbral desplaza el diagrama.
- Los gestos de ratón y teclado siguen como en el editor de escritorio.
- Flechas más ligeras y líneas diferenciadas para el flujo activo; mejor contraste de las etiquetas Sí/No.
- Pruebas de regresión de gestos, corrección de prueba antigua del deslizamiento y documentación de validación en iPhone.

## 1.4.5 — Metas primero, ayuda opcional (2026-10-26)

- Cada uno de los 16 retos de clase y los 100 retos del banco muestra una **meta visible** al entrar al editor móvil, sin abrir el paso a paso.
- Se distingue la meta de los criterios de evaluación y de los pasos que guían la solución.
- La guía no selecciona ni ilumina automáticamente bloques en iPhone; se activa solo a petición del alumno.
- Escritorio mantiene la guía previa, sin cambios de maquetación.
- Se aclara la meta de «Suma 7 + 8» para especificar que debe calcularse y mostrarse usando `total`, no imprimir un literal.
- Se añade `tests/mission-goals-v145.test.ts` para verificar las metas y el carácter opcional del recorrido guiado.
- Conserva progreso local, el modo sin conexión, GitHub Pages y la estructura de validación.

## 1.4.4.2 — Corrección de tipado en evaluación de ejercicios (2026-10-26)

- Se tipan explícitamente los nodos `Input` y `If` después de filtrarlos en `src/learning/learning.ts`, para acceder correctamente a `target`, `trueNext` y `falseNext`.
- Se resuelven cinco errores `TS2339` que detenían `npm run build` y `npm run verify`.
- No se alteran las reglas pedagógicas ni los resultados que espera el evaluador.
- Comprobación aislada: el archivo corregido supera TypeScript estricto y 128 pruebas de lógica pasaron. Seis pruebas de XML requieren un entorno con `DOMParser` y no pudieron ejecutarse en la comprobación aislada. La suite oficial y la compilación completa deben confirmarse en el Mac.

## 1.4.4.1 — Corrección de prueba de concatenación (2026-10-26)

- Se retiran dos escapes innecesarios de comillas en `tests/parser.test.ts` que detenían ESLint con `no-useless-escape`.
- Se conserva intacta la lógica del parser, la ejecución y el contenido del curso.
- La instalación de dependencias y `npm run verify` completo deberán confirmarse en el Mac antes de publicar.

## 1.4.4 — Auditoría y correcciones pedagógicas (2026-10-26)

- Auditoría de **16 clases, 100 retos y 224 casos automáticos**.
- Validación reforzada: piezas alcanzables y Salida que lea las variables pedidas, no números fijos.
- Ejemplos de concatenación ajustados a `&` como en Flowgorithm original.
- Precedencia de comparaciones y negación unaria revisada; soporte del operador `mod`.
- Traducción de `&` en Python, JavaScript, Java y C++; C señala incompatibilidad en lugar de emitir una expresión peligrosa o incorrecta.
- Ejemplo resuelto del laboratorio opcional y oculto al principio.
- Objetivos y pasos del banco redactados con instrucciones claras.
- GitHub Actions ahora ejecuta `npm run verify` antes de publicar, para no desplegar versiones con pruebas fallidas.
- README y documentación principal actualizados, con informe de límites y protocolo para probar usabilidad en iPhone.
- Pruebas de regresión sobre contenido, evaluación estructural y generadores.

## 1.4.3.1 — Ajuste de prueba

El test de la misión «Mi primera variable» utiliza la terminología española del evaluador.

## 1.4.3 — Evaluación y móvil

Comprobación del flujo de la variable `edad`, acceso móvil al código, paneles más contenidos y navegación a la clase siguiente.

## 1.4.2 — Editor táctil

Campos nuevos vacíos, avisos de configuración e inserción más directa en móvil.

## 1.4.1 — Distribución móvil

Simulador colapsable y acciones principales simplificadas.

## 1.4.0 — Aplicación web offline

PWA con precaché de archivos compilados y soporte de publicación en rutas HTTPS.

## 1.3.x — Funciones y parámetros

Clases sobre llamadas, parámetros y valores de retorno con ejercicios interactivos.

Las notas históricas completas se conservan en `README-V*.md`.
