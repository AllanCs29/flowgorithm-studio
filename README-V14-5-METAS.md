# v14.5 · Metas claras antes de la ayuda

## Problema resuelto

En iPhone, los ejercicios abrían directamente con «Paso 1 de N» y resaltaban el próximo bloque. Esto revelaba el camino y escondía el objetivo del problema.

## Experiencia

1. **Tu meta** aparece en cada misión al entrar al editor móvil.
2. «Qué revisaré» muestra qué estructura o comportamiento se evalúa, sin exigir seguir una lista de clics.
3. «¿Necesitas ayuda?» permite consultar voluntariamente los pasos; «Activar resaltado de los bloques» ilumina el recorrido solo cuando se elige.
4. «Ejecutar» y «Comprobar» siguen disponibles sin haber abierto la guía.
5. En escritorio se conserva el panel de pasos y su comportamiento anterior.

## Comprobación sugerida en iPhone

- Abrir «Suma 7 + 8»: primero se ve la meta, no «Selecciona Asignar total».
- El diagrama no debe tener un resaltado guiado automático.
- Elegir «Qué revisaré» y cerrarlo: el dibujo sigue accesible.
- Elegir «¿Necesitas ayuda?» y después «Activar resaltado de los bloques»: aparece el siguiente bloque señalado.
- Resolver y comprobar sin usar esa ayuda debe funcionar igualmente.
- Repetir con «Mi primera variable», «Mayor de edad» y un reto del laboratorio de los 100.

## Publicación

Conservar la carpeta `.git`, ejecutar `npm install --include=dev && npm run verify` y, si las pruebas pasan, publicar desde GitHub Desktop con Commit to main y Push origin. GitHub Pages recompila con `BASE_PATH=/flowgorithm-studio/`. La aplicación offline puede necesitar una apertura con conexión para actualizar la caché.
