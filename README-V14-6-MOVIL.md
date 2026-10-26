# Flowgorithm Studio v14.6 — Experiencia móvil

## Objetivo
Facilitar que un principiante resuelva sus propios algoritmos sin perder de vista el diagrama, conservando las opciones de ayuda sin obligarlo a seguirlas.

## Interacciones (iPhone)

| Acción | Resultado |
|---|---|
| Tocar un bloque | Seleccionarlo y abrir sus propiedades. |
| Mantener pulsado ~430 ms y desplazar | Activar arrastre y escoger otra posición válida del flujo. |
| Deslizar antes de que termine la pulsación | Recorrer el lienzo sin mover el bloque. |
| Tocar «Tu meta» | Expandir o contraer objetivo. La vista compacta enseña un resumen truncado. |
| Tocar «Qué revisaré» | Ver criterios, sin revelarse como solución automática. |
| Tocar «¿Necesitas ayuda?» | Ver explicación y abrir la guía opcional. |

**Importante:** mover bloques no significa arrastrarlos libremente a coordenadas arbitrarias: el editor mantiene su modelo estructurado de Flowgorithm y los coloca en destinos válidos. En un programa con ramas o ciclos, los destinos dependen del tipo de bloque.

## Comprobaciones antes de subir a GitHub

```bash
cd ~/Proyectos/Flowgorithm-Studio
npm install --include=dev
npm run verify
npm run dev:lan
```

Desde el iPhone en la misma Wi-Fi abre la dirección Network de Vite. Comprueba en **Suma 7 + 8**: meta compacta y ampliable, paneles desplegables, toque para editar, deslizamiento y pulsación larga. Repite en un diagrama con `Si` y con un ciclo. Comprueba también que en el Mac puedes arrastrar con ratón y que la navegación por teclado sigue funcionando.

Después de obtener una ejecución limpia de `verify`, utiliza GitHub Desktop para `Commit to main` y `Push origin`; GitHub Actions volverá a publicar GitHub Pages. Abre después la PWA instalada en iPhone con conexión para actualizar la caché offline.

## Limitaciones y pendientes

- No se han probado gestos físicos en todos los modelos de iPhone ni la respuesta de VoiceOver. Revisar estos dispositivos antes de considerar la experiencia cerrada.
- Las ayudas permanecen accesibles; no se registran métricas ni comportamiento de alumnos.
- No se ha añadido Firebase ni sincronización del progreso en esta entrega.
