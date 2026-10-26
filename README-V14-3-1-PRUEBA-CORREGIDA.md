# Flowgorithm Studio v14.3.1 — Arreglo de una prueba

## Motivo

`tests/learning.test.ts` comprobaba que el mensaje del reto «Mi primera variable»
contuviera el texto inglés `Declare`. Tras mejorar la experiencia pedagógica,
la interfaz presenta los mensajes en español (`Declarar`). Por ello,
la prueba fallaba aunque el evaluador rechazaba correctamente la solución
sin un bloque Declarar.

## Corrección

La prueba ahora comprueba `Declarar edad como Integer`, que es el requisito real
del ejercicio. **No se modificó el criterio de evaluación**, no se exige un
valor numérico fijo y no se acepta imprimir un literal en lugar de usar la
variable. La prueba adicional `tests/v143-learning-ux.test.ts` continúa
cubriendo estos casos.

## Verificar en Mac

```bash
cd ~/Proyectos/Flowgorithm-Studio
npm run verify
npm run dev:lan
```

Esta es una actualización del test, no del editor: la versión de la app
en `package.json` sigue siendo 1.4.3.
