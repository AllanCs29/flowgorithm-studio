# Flowgorithm Studio v13.1 — Corrección de verificación

Esta entrega conserva todas las funciones educativas de v13 y actualiza `tests/course-flow.test.ts` para reflejar el nivel 11 (Funciones).

## Problema corregido

Antes: `expect(levelLessons().length).toBe(10)` fallaba al encontrar 11 niveles.

Ahora se verifica que hay 11 niveles, que están ordenados del 1 al 11, que el nivel 11 se completa y que contiene las clases `functions` y `parameters`.

## Verificar en macOS

```sh
npm install --include=dev
npm run verify
npm run dev:lan
```

Abre la dirección Local en la Mac y Network en el teléfono conectado al mismo Wi-Fi.

## Avisos independientes

Los mensajes `npm audit` e `install-scripts` no causan la falla de la prueba. Analiza `npm audit` aparte y evita `npm audit fix --force` sin revisar si las actualizaciones rompen compatibilidad.
