# Flowgorithm Studio v14.6.1 — Corrección de prueba de la meta

La prueba heredada de v14.5 esperaba el encabezado literal en mayúsculas `TU META`.
Desde v14.6, el objetivo se presenta como una tarjeta plegable con el texto visible `Tu meta`, resumen accesible y criterios y ayuda dentro del panel expandible.

La prueba `tests/mission-goals-v145.test.ts` fue actualizada para verificar el comportamiento real sin depender de las mayúsculas:
- El encabezado accesible «Tu meta del reto».
- El título «Tu meta» y el resumen visibles de forma compacta.
- El panel de objetivo inicialmente plegado y el recorrido guiado no abierto por defecto.
- Meta con contenido y botones para consultar criterios o solicitar ayuda.

Esta revisión no cambia el código de ejecución ni el diseño de la v14.6.

## Verificar en macOS

```bash
cd ~/Proyectos/Flowgorithm-Studio
npm install --include=dev
npm run verify
npm run dev:lan
```

Publicar con GitHub Desktop solamente cuando la verificación termine sin errores.
