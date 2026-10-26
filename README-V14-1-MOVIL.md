# Flowgorithm Studio v14.1 — Editor móvil primero

**Objetivo:** evitar que los controles ocupen toda la pantalla de un iPhone. Este cambio mantiene intactos los conceptos, diagramas, cálculos, evaluaciones y la compatibilidad offline de v14. No incluye autenticación ni Firebase todavía.

## Experiencia para iPhone

- La misión ocupa una franja breve con acceso a todos los pasos.
- El diagrama gana el espacio central de la pantalla.
- La barra inferior contiene solo **Piezas**, **Un paso**, **Ejecutar** y **Comprobar** (o **Resultado** en el editor libre).
- **Para editar:** tocar directamente el bloque del diagrama. Se abre un panel sobre la pantalla.
- La línea **Así piensa tu algoritmo** está compacta de entrada; tocar **Ver ejecución** abre los controles, la línea de tiempo, la explicación y las variables. Se puede cerrar con el fondo oscuro o el botón **Cerrar detalles**.
- La opción **Más** del encabezado conserva proyecto, archivos, funciones, ajustes y herramientas avanzadas.
- Se respetan las áreas seguras del iPhone y los tamaños táctiles de controles.
- En pantallas grandes, la experiencia de escritorio sigue sin cambios deliberados.

## Cómo actualizar tu GitHub Pages actual

1. En Mac, descomprime el ZIP **en `~/Proyectos/`**, de modo que se actualicen los archivos dentro de `~/Proyectos/Flowgorithm-Studio`. Si Finder pregunta, combina/reemplaza archivos. **No elimines el proyecto ni su carpeta `.git`.**
2. Abre GitHub Desktop en el repositorio `flowgorithm-studio`, revisa los cambios, escribe `Optimizar editor móvil v14.1` y pulsa **Commit to main** y luego **Push origin**.
3. En GitHub Actions, comprueba que **Publicar Flowgorithm Studio** termine en verde; abre `https://allancs29.github.io/flowgorithm-studio/`.
4. En iPhone, abre la app con internet para que se actualice su versión offline. Cierra y vuelve a abrir la PWA instalada. Si sigue mostrando una versión anterior, revisa la caché antes de borrar datos, ya que el progreso se guarda en el dispositivo.

## Comprobaciones

```bash
npm install --include=dev
node scripts/test-mobile-layout.cjs
npm run verify
npm run dev:lan
```

Para abrir desde un teléfono conectado a la misma Wi-Fi usa la dirección **Network** del comando `npm run dev:lan`. Esta dirección local es para revisar el diseño; **el modo sin internet** debe probarse desde la versión HTTPS compilada e instalada como PWA.

**Lista de revisión en teléfono:** abre una misión, toca un bloque y edítalo, abre Piezas, ejecuta paso a paso, revisa la memoria, comprueba el reto, gira el teléfono, vuelve a clases y prueba el modo Avión después de cargar la nueva versión.
